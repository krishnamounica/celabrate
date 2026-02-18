import React, { useState } from 'react';
import { Text, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import { theme } from '../../theme';
import { emitCartUpdated } from '../utils/cartEvents';

const CART_API =
  'https://wishandsurprise.com/backend/cart/add_update_cart.php';

const CartButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${theme.colors.brand};
  align-items: center;
  justify-content: center;
`;

export default function AddToCartButton({
  userId,
  item,
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!userId) {
      onError?.('Please login to add items');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(CART_API, {
        user_id: userId,
        product_id: item.id,
        quantity: 1,
      });
       emitCartUpdated();
      console.log(CART_API,'Add to cart response', res.data, {user_id: userId,
        product_id: item.id,
        quantity: 1,});

      if (res.data?.success) {
        onSuccess?.('Added to cart 🛒');
      } else {
        onError?.('Failed to add to cart');
      }
    } catch (err) {
      console.error('Add to cart error', err);
      onError?.('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartButton onPress={handleAddToCart} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>
          ＋
        </Text>
      )}
    </CartButton>
  );
}
