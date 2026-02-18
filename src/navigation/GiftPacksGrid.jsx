// src/screens/GiftPacksGrid.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import WishlistButton from './WishlistButton';
import AppSnackbar from '../screens/Home/AppSnackbar';
import { useSnackbar } from '../context/SnackbarContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCartItems, updateCartItem } from '../redux/cartSlice';

const { width } = Dimensions.get('window');

/* ---------- LAYOUT ---------- */
const GAP = 14;
const CARD_WIDTH = (width - theme.spacing.card * 2 - GAP) / 2;

/* ---------- STYLES ---------- */
const Section = styled.View`
  padding: ${theme.spacing.card}px;
  background-color: ${theme.colors.subtle};
`;

const Title = styled.Text`
  font-size: ${theme.fonts.h1}px;
  font-weight: 900;
  margin-bottom: 14px;
`;

const CardWrap = styled.View`
  width: ${CARD_WIDTH}px;
  margin-bottom: ${GAP}px;
`;

const Card = styled.View`
  background-color: ${theme.colors.card};
  border-radius: ${theme.radius.card}px;
  overflow: hidden;
`;

const ThumbWrap = styled.View`
  height: 180px;
`;

const Thumb = styled.Image`
  width: 100%;
  height: 100%;
`;

const Overlay = styled(LinearGradient)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
`;

const PriceBadge = styled.View`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background-color: ${theme.colors.brand};
  padding: 6px 12px;
  border-radius: 18px;
`;

const Meta = styled.View`
  padding: 12px;
  align-items: center;
`;

const Name = styled.Text`
  font-weight: 800;
  text-align: center;
`;

/* ---------- MAIN ---------- */
export default function GiftPacksGrid() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const animRef = useRef({});

  const { snack, hideSnackbar } = useSnackbar();
  const cartItems = useSelector(state => state.cart.items);

  const reduxProducts = useSelector(state =>
    Array.isArray(state.products?.items)
      ? state.products.items
      : []
  );

  /* ✅ FILTER COMBO PRODUCTS */
  const comboProducts = useMemo(
    () => reduxProducts.filter(p => p.product_type === 'COMBO'),
    [reduxProducts]
  );

  /* ✅ SAFE IMAGE RESOLVER */
  const resolveImage = (item) => {
    if (item.image) return item.image;
    if (item.images?.length) return item.images[0];
    return 'https://wishandsurprise.com/backend/uploads/placeholder.png';
  };

  /* CART HELPERS */
  const getQty = id =>
    cartItems.find(i => Number(i.product_id) === Number(id))?.quantity || 0;

  const updateQty = async (item, delta) => {
    await dispatch(
      updateCartItem({
        productId: item.id,
        quantity: getQty(item.id) + delta,
      })
    );
  };

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  const renderItem = ({ item }) => {
    if (!animRef.current[item.id]) {
      animRef.current[item.id] = new Animated.Value(1);
    }

    return (
      <CardWrap>
        <Card>
          {/* IMAGE CLICK */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('ProductDetails', {
                product: item,
               
              })
            }
          >
            <ThumbWrap>
              <Thumb source={{ uri: resolveImage(item) }} />
              <Overlay colors={['transparent', 'rgba(0,0,0,0.3)']} />
              <PriceBadge>
                <Text style={{ color: '#fff', fontWeight: '900' }}>
                  ₹ {item.price}
                </Text>
              </PriceBadge>
            </ThumbWrap>
          </TouchableOpacity>

          {/* META */}
          <Meta>
            <Name numberOfLines={2}>{item.name}</Name>
          </Meta>

          <WishlistButton />
        </Card>
      </CardWrap>
    );
  };

  if (!comboProducts.length) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Section>
        <Title>Our Combo Packs</Title>

        <FlatList
          data={comboProducts}
          renderItem={renderItem}
          keyExtractor={item => `${item.id}`}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      </Section>

      <AppSnackbar
        visible={snack.visible}
        message={snack.message}
        variant={snack.variant}
        onHide={hideSnackbar}
      />
    </View>
  );
}
