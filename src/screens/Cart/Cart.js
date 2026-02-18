import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../theme';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCartItems,
  updateCartItem,
} from '../../redux/cartSlice';
import normalizeUri from '../../utils/normalizeUri';

/* ---------------- Styled ---------------- */

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.subtle};
  padding: 16px;
`;

const Header = styled.Text`
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 16px;
`;

const Card = styled.View`
  background-color: #fff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 14px;
  elevation: 4;
`;

const CardRow = styled.View`
  flex-direction: row;
`;

const ProductImage = styled.Image`
  width: 76px;
  height: 76px;
  border-radius: 12px;
  background-color: #f1f1f1;
`;

const Info = styled.View`
  flex: 1;
  margin-left: 12px;
  padding-right: 36px;
`;

const Name = styled.Text`
  font-weight: 800;
  font-size: 14px;
  color: #111;
`;

const Price = styled.Text`
  margin-top: 6px;
  font-weight: 700;
  color: ${theme.colors.brand};
`;

const QtyRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
`;

const QtyButton = styled.TouchableOpacity`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: ${theme.colors.brand};
  align-items: center;
  justify-content: center;
`;

const QtyText = styled.Text`
  margin: 0 16px;
  font-size: 16px;
  font-weight: 800;
`;

const DeleteBtn = styled.TouchableOpacity`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #fee2e2;
  align-items: center;
  justify-content: center;
`;

const ComboBox = styled.View`
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f9fafb;
`;

const ComboText = styled.Text`
  font-size: 12px;
  color: #555;
`;

const TotalBox = styled.View`
  padding: 16px;
  border-top-width: 1px;
  border-color: #eee;
`;

const TotalText = styled.Text`
  font-size: 18px;
  font-weight: 900;
  text-align: right;
`;

const CheckoutBtn = styled.TouchableOpacity`
  background-color: ${theme.colors.brand};
  padding: 16px;
  border-radius: 12px;
  margin-top: 12px;
  align-items: center;
`;

const CheckoutText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 900;
`;

/* ---------------- Component ---------------- */

export default function Cart({ navigation }) {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.cart);

  const [deleteItem, setDeleteItem] = useState(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchCartItems());
    }, [dispatch])
  );

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + Number(i.total_price),
        0
      ),
    [items]
  );

  const changeQty = (item, quantity) => {
    dispatch(
      updateCartItem({
        productId: item.product_id,
        productType: item.product_type,
        quantity,
        customData: item.custom_data,
        comboItems: item.combo_items || [],
      })
    );
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <Container>
        <ActivityIndicator
          size="large"
          color={theme.colors.brand}
        />
      </Container>
    );
  }

  /* ---------- Empty ---------- */
  if (items.length === 0) {
    return (
      <Container>
        <Text>Your cart is empty 🛒</Text>
      </Container>
    );
  }

  /* ---------- UI ---------- */
  return (
    <Container>
      <Header>Your Cart</Header>

      <FlatList
        data={items}
        keyExtractor={i => String(i.cart_item_id)}
        renderItem={({ item }) => (
          <Card>
            <DeleteBtn onPress={() => setDeleteItem(item)}>
              <Ionicons
                name="trash-outline"
                size={18}
                color="#E11D48"
              />
            </DeleteBtn>

            <CardRow>
              <ProductImage
                source={{
                  uri: normalizeUri(item.image),
                }}
              />

              <Info>
                <Name>{item.name}</Name>

                <Price>
                  ₹ {item.total_price}
                </Price>

                {/* CUSTOM */}
                {item.product_type === 'CUSTOMIZED' &&
                  item.custom_data && (
                    <ComboBox>
                      <ComboText>
                        🎨 Customized item
                      </ComboText>
                    </ComboBox>
                  )}

                {/* COMBO */}
                {item.product_type === 'COMBO' &&
                  item.combo_items?.length > 0 && (
                    <ComboBox>
                      {item.combo_items.map(c => (
                        <ComboText key={c.product_id}>
                          + {c.name} × {c.quantity}
                        </ComboText>
                      ))}
                    </ComboBox>
                  )}

                <QtyRow>
                  <QtyButton
                    disabled={item.quantity <= 1}
                    style={{
                      opacity:
                        item.quantity <= 1 ? 0.4 : 1,
                    }}
                    onPress={() =>
                      changeQty(
                        item,
                        item.quantity - 1
                      )
                    }
                  >
                    <Text style={{ color: '#fff' }}>
                      −
                    </Text>
                  </QtyButton>

                  <QtyText>{item.quantity}</QtyText>

                  <QtyButton
                    onPress={() =>
                      changeQty(
                        item,
                        item.quantity + 1
                      )
                    }
                  >
                    <Text style={{ color: '#fff' }}>
                      +
                    </Text>
                  </QtyButton>
                </QtyRow>
              </Info>
            </CardRow>
          </Card>
        )}
      />

      <TotalBox>
        <TotalText>Total: ₹ {totalAmount}</TotalText>

        <CheckoutBtn
          onPress={() =>
            navigation.navigate('BillingAddress', {
              checkout: {
                type: 'CART',
                items,
                totalAmount,
              },
            })
          }
        >
          <CheckoutText>
            Proceed to Checkout
          </CheckoutText>
        </CheckoutBtn>
      </TotalBox>

      {/* ---------- DELETE CONFIRMATION (SAFE) ---------- */}
      {deleteItem && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#fff',
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            elevation: 30,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '800',
            }}
          >
            Remove item?
          </Text>

          <Text
            style={{
              marginTop: 6,
              color: '#555',
            }}
          >
            Do you want to remove this item from
            your cart?
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ddd',
                alignItems: 'center',
                marginRight: 8,
              }}
              onPress={() => setDeleteItem(null)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                backgroundColor: '#EF4444',
                alignItems: 'center',
              }}
              onPress={() => {
                changeQty(deleteItem, 0);
                setDeleteItem(null);
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                }}
              >
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Container>
  );
}
