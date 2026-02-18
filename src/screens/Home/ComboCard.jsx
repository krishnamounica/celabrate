// src/components/ComboCard.jsx
import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';

// BRAND COLORS
const BRAND = '#FF6A00';
const SUCCESS = '#0AA03A';
const MUTED = '#6B7280';
const CARD_BG = '#fff';

// cross-platform shadow helper
const cardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },
  android: {
    elevation: 6,
  },
});

/* ---------- Styled ---------- */

const Card = styled.View`
  width: 270px;
  background-color: ${CARD_BG};
  border-radius: 16px;
  padding: 0px;
  margin-right: 16px;
  overflow: visible;
`;

// top image container
const ImageWrap = styled.View`
  height: 160px;
  width: 100%;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  overflow: hidden;
  background-color: #f5f5f5;
`;

// using FastImage for better perf; fallbacks handled by FastImage
const StyledImage = styled(FastImage)`
  width: 100%;
  height: 100%;
`;

/* subtle dark gradient overlay to increase legibility of badges on image */
const ImageOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48%;
  background-color: rgba(0,0,0,0.18);
`;

/* price pill at bottom-left of image */
const PricePill = styled.View`
  position: absolute;
  left: 12px;
  bottom: 10px;
  background-color: ${BRAND};
  padding-vertical: 8px;
  padding-horizontal: 12px;
  border-radius: 22px;
  elevation: 6;
  ${Platform.select({
    ios: `shadow-color: ${BRAND}; shadow-offset: 0px 6px; shadow-opacity: 0.18; shadow-radius: 10px;`,
    android: '',
  })}
`;

/* plus floating CTA button at bottom-right of image */
const AddFab = styled.TouchableOpacity`
  position: absolute;
  right: 12px;
  bottom: -18px;
  width: 46px;
  height: 46px;
  border-radius: 23px;
  background-color: ${BRAND};
  justify-content: center;
  align-items: center;
  elevation: 10;
  ${Platform.select({
    ios: `shadow-color: ${BRAND}; shadow-offset: 0px 8px; shadow-opacity: 0.25; shadow-radius: 12px;`,
    android: '',
  })}
`;

/* sold badge at top-left */
const SoldBadge = styled.View`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0,0,0,0.62);
  padding-vertical: 6px;
  padding-horizontal: 10px;
  border-radius: 12px;
`;

/* wishlist bubble top-right */
const WishBubble = styled.TouchableOpacity`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255,255,255,0.96);
  justify-content: center;
  align-items: center;
  elevation: 6;
  ${Platform.select({
    ios: `shadow-color: #000; shadow-offset: 0px 6px; shadow-opacity: 0.12; shadow-radius: 8px;`,
    android: '',
  })}
`;

/* bottom details */
const Content = styled.View`
  padding: 18px 16px 18px 16px;
  background-color: ${CARD_BG};
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  ${Platform.select({
    ios: `border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;`,
    android: '',
  })}
`;

/* title and subtitle */
const Title = styled.Text`
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.2px;
  margin-bottom: 6px;
`;

const SubtitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

/* small meta text */
const Meta = styled.Text`
  font-size: 13px;
  color: ${MUTED};
  margin-top: 8px;
`;

/* rating chip */
const RatingChip = styled.View`
  margin-top: 10px;
  align-self: flex-start;
  background-color: ${SUCCESS};
  padding-vertical: 4px;
  padding-horizontal: 10px;
  border-radius: 12px;
`;

/* bottom row - star + rating number */
const BottomRow = styled.View`
  margin-top: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

/* main CTA (Add to cart / Notify) */
const ActionButton = styled.TouchableOpacity`
  background-color: ${BRAND};
  padding-vertical: 12px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
`;

/* small text inside price pill & rating */
const PriceText = styled.Text`
  color: #fff;
  font-weight: 900;
  font-size: 14px;
`;

const SoldText = styled.Text`
  color: #fff;
  font-weight: 700;
  font-size: 12px;
`;

const WishIconInner = styled.Text`
  font-size: 18px;
  color: ${BRAND};
  font-weight: 700;
`;

const PlusText = styled.Text`
  color: #fff;
  font-weight: 900;
  font-size: 22px;
`;

/* container to apply platform shadow */
const ShadowWrap = styled.View`
  ${Platform.select({
    ios: `shadow-color: #000; shadow-offset: 0px 8px; shadow-opacity: 0.12; shadow-radius: 14px;`,
    android: `elevation: 6;`,
  })}
`;

/* ---------- Helper ---------- */
const fmtINR = (n) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n));
  } catch (e) {
    return `₹${Number(n || 0).toFixed(0)}`;
  }
};

/* ---------- Component ---------- */

export default function ComboCard({
  product = {},
  onPress = () => {},
  onAdd = () => {},
  onWishlist = () => {},
}) {
  const price = Number(product.price) || 0;
  const sold = product.sold || product.solds || 0;
  const rating = product.rating || 0;
  const img = product.image || product.images?.[0] || null;
  const title = product.name || product.title || 'Untitled combo';

  return (
    <ShadowWrap style={{ marginRight: 8 }}>
      <Card style={cardShadow}>
        <ImageWrap>
          {img ? (
            <StyledImage
              source={{ uri: img }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <StyledImage
              // fallback: small blank gray
              source={{ uri: 'https://via.placeholder.com/600x400?text=No+Image' }}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}

          <ImageOverlay />

          {/* sold */}
          <SoldBadge>
            <SoldText>{sold} sold</SoldText>
          </SoldBadge>

          {/* wishlist bubble */}
          <WishBubble accessibilityLabel="Add to wishlist" onPress={() => onWishlist(product)}>
            <WishIconInner>♡</WishIconInner>
          </WishBubble>

          {/* price pill */}
          <PricePill>
            <PriceText>{price > 0 ? fmtINR(price) : 'Price on request'}</PriceText>
          </PricePill>

          {/* add floating button */}
          <AddFab onPress={() => onAdd(product)} accessibilityLabel="Add to cart">
            <PlusText>＋</PlusText>
          </AddFab>
        </ImageWrap>

        <Content>
          <Title numberOfLines={2}>{title}</Title>

          <Meta>⏳ 3 days • {product.countInStock > 0 ? `In stock · ${product.countInStock}` : 'Out of stock'}</Meta>

          <RatingChip>
            <PriceText>{`★ ${rating} (${product.numReviews || 0})`}</PriceText>
          </RatingChip>

          <BottomRow>
            <ActionButton
              onPress={() => onPress(product)}
              accessibilityRole="button"
              activeOpacity={0.85}
              style={{ flex: 1, marginRight: 8 }}
            >
              <PriceText style={{ color: '#fff', fontSize: 14 }}>View / Buy</PriceText>
            </ActionButton>

            <ActionButton
              onPress={() => onAdd(product)}
              accessibilityRole="button"
              activeOpacity={0.85}
              style={{ width: 48, height: 48, paddingVertical: 0, borderRadius: 12, justifyContent: 'center' }}
            >
              <PlusText>＋</PlusText>
            </ActionButton>
          </BottomRow>
        </Content>
      </Card>
    </ShadowWrap>
  );
}
