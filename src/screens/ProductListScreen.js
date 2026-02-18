// src/screens/ProductListScreen.jsx
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import normalizeUri from '../utils/normalizeUri';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/productSlice';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

/* ---------- Constants / Colors ---------- */
const BRAND = '#FF6A00';
const SUCCESS = '#0AA03A';
const MUTED = '#6B7280';
const SURFACE = '#FFFFFF';
const CARD_BG = '#fff';
const BORDER_LIGHT = '#E6E6E6';
const CARD_SHADOW_OPACITY = 0.08;
const CARD_WIDTH = 180;

/* ---------- Styled components ---------- */

const ScreenWrapper = styled.View`
  flex: 1;
  background-color: #fff6f0; /* subtle warm background to match brand */
`;

/* ---------- IMPORTANT: lightweight section wrapper (no white card/shadow) ---------- */
const SectionWrapper = styled.View`
  margin-horizontal: 16px;
  margin-vertical: 12px;
  padding-vertical: 8px;
  /* intentionally transparent background and no shadow to avoid double-card effect */
`;

/* Header row */
const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: #111;
`;

const ViewAll = styled.TouchableOpacity`
  padding-vertical: 6px;
  padding-horizontal: 8px;
`;

const ViewAllText = styled.Text`
  color: ${BRAND};
  font-weight: 600;
`;

/* Horizontal products list */
const ProductsList = styled.FlatList.attrs(() => ({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  snapToAlignment: 'start',
  decelerationRate: 'fast',
  contentContainerStyle: { paddingLeft: 10, paddingRight: 30 },
}))``;

/* Card */
const Card = styled.View`
  width: ${CARD_WIDTH}px;
  background-color: ${CARD_BG};
  border-radius: 14px;
  padding: 12px;
  margin-right: 12px;
  elevation: 6;
  shadow-color: #000;
  shadow-opacity: ${CARD_SHADOW_OPACITY};
  shadow-offset: 0px 4px;
  shadow-radius: 10px;
  position: relative;
`;

/* Price pill */
const PricePill = styled.View`
  position: absolute;
  left: 12px;
  top: 12px;
  background-color: ${SUCCESS};
  padding-vertical: 6px;
  padding-horizontal: 10px;
  border-radius: 20px;
  z-index: 3;
  elevation: 8;
`;
const PricePillText = styled.Text`
  color: #fff;
  font-weight: 800;
  font-size: 14px;
`;

/* Sold out ribbon */
const Ribbon = styled.View`
  position: absolute;
  top: 12px;
  right: -28px;
  background-color: rgba(0,0,0,0.65);
  transform: rotate(20deg);
  padding-vertical: 6px;
  padding-horizontal: 36px;
  z-index: 4;
  border-radius: 4px;
`;
const RibbonText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
`;

/* Product image */
const ProductImage = styled(FastImage)`
  width: 100%;
  height: 130px;
  border-radius: 10px;
  margin-vertical: 8px;
  background-color: ${BORDER_LIGHT};
`;

/* Offer tag */
const OfferTag = styled.View`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: ${SUCCESS};
  border-radius: 16px;
  padding-horizontal: 10px;
  padding-vertical: 6px;
  z-index: 5;
`;
const OfferText = styled.Text`
  color: #fff;
  font-size: 12px;
  font-weight: 700;
`;

/* Texts */
const ProductName = styled.Text`
  font-size: 14px;
  font-weight: 700;
  text-align: center;
`;

const SmallMeta = styled.Text`
  font-size: 12px;
  color: ${MUTED};
  margin-top: 6px;
  text-align: center;
`;

/* Rating chip and CTA */
const RatingChip = styled.View`
  align-self: center;
  margin-top: 8px;
  background-color: ${SUCCESS};
  padding-vertical: 4px;
  padding-horizontal: 8px;
  border-radius: 12px;
`;
const RatingText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
`;

/* CTA (brand orange) */
const CTAButton = styled.TouchableOpacity`
  background-color: ${BRAND};
  padding-vertical: 10px;
  border-radius: 10px;
  margin-top: 10px;
  align-items: center;
`;
const CTAButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
`;

/* Skeleton card while loading */
const SkeletonRow = styled.View`
  flex-direction: row;
`;
const SkeletonCard = styled.View`
  width: ${CARD_WIDTH}px;
  height: 260px;
  border-radius: 14px;
  background-color: #eee;
  margin-right: 12px;
`;

/* Helper price formatter */
const fmtINR = (n) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n));
  } catch (e) {
    return `₹${Number(n || 0).toFixed(0)}`;
  }
};

/* ---------- Component ---------- */

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const productsState = useSelector(state => state.products || { items: [], loading: false, error: null });
  const { items: products = [], loading, error } = productsState;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // choose a subset for Home carousel or new arrivals preview
  const newArrivals = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return [...products].slice(0, 12);
  }, [products]);

  const renderProduct = ({ item }) => {
    if (!item) return null;
    const price = Number(item.price) || 0;
    const mrp = price > 0 ? price + 100 : 0;
    const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const productName = item.name?.length > 30 ? `${item.name.substring(0, 27)}...` : item.name;

    return (
      <Card>
        {item.countInStock <= 0 && (
          <Ribbon>
            <RibbonText>SOLD OUT</RibbonText>
          </Ribbon>
        )}

        <PricePill>
          <PricePillText>{price > 0 ? fmtINR(price) : 'Price on request'}</PricePillText>
        </PricePill>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
        >
          <ProductImage
            source={{ uri: normalizeUri(item.image || '') }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>

        {discount > 0 && (
          <OfferTag>
            <OfferText>{discount}% OFF</OfferText>
          </OfferTag>
        )}

        <ProductName numberOfLines={2}>{productName}</ProductName>

        <SmallMeta>⏳ 3 days • {item.countInStock > 0 ? `In stock · ${item.countInStock}` : 'Out of stock'}</SmallMeta>

        <RatingChip>
          <RatingText>⭐ {item.rating || 0} ({item.numReviews || 0})</RatingText>
        </RatingChip>

        <CTAButton
          disabled={item.countInStock <= 0}
          activeOpacity={0.85}
          onPress={() => {
            // navigate to billing or product details — keep behavior consistent with your app
            navigation.navigate('ProductDetails', { product: item });
          }}
        >
          <CTAButtonText>{item.countInStock > 0 ? 'Add to cart' : 'Notify me'}</CTAButtonText>
        </CTAButton>
      </Card>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <SectionWrapper>
          <HeaderRow>
            <HeaderTitle>New Arrivals</HeaderTitle>
            <ViewAll onPress={() => navigation.navigate('Allproducts')}>
              <ViewAllText>View all</ViewAllText>
            </ViewAll>
          </HeaderRow>

          <ActivityIndicator size="small" color={BRAND} style={{ marginBottom: 12 }} />

          <SkeletonRow>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </SkeletonRow>
        </SectionWrapper>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <SectionWrapper>
        <HeaderRow>
          <HeaderTitle>New Arrivals</HeaderTitle>
          <ViewAll onPress={() => navigation.navigate('Allproducts')}>
            <ViewAllText>View all</ViewAllText>
          </ViewAll>
        </HeaderRow>

        {error ? (
          <Text style={{ color: '#E53935', textAlign: 'center', marginVertical: 12 }}>{error}</Text>
        ) : newArrivals.length === 0 ? (
          <Text style={{ textAlign: 'center', color: MUTED, marginVertical: 12 }}>No products available</Text>
        ) : (
          <ProductsList
            data={newArrivals}
            renderItem={renderProduct}
            keyExtractor={(item, idx) => item._id ? String(item._id) : String(idx)}
          />
        )}
      </SectionWrapper>
    </ScreenWrapper>
  );
};

export default ProductListScreen;
