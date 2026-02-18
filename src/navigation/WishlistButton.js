import React, { useState } from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../theme';

const FavWrap = styled.Pressable`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255,255,255,0.98);
  align-items: center;
  justify-content: center;
`;

export default function WishlistButton({
  userId,
  onSuccess,
  onRemove,
  onError,
}) {
  const [fav, setFav] = useState(false);

  const toggleWishlist = () => {
    if (!userId) {
      onError?.('Login to use wishlist');
      return;
    }

    setFav(prev => !prev);
    fav
      ? onRemove?.('Removed from wishlist')
      : onSuccess?.('Added to wishlist');
  };

  return (
    <FavWrap onPress={toggleWishlist}>
      <Text
        style={{
          color: fav ? theme.colors.brand : '#888',
          fontSize: 18,
          fontWeight: '900',
        }}
      >
        {fav ? '♥' : '♡'}
      </Text>
    </FavWrap>
  );
}
