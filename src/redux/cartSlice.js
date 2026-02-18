// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GET_CART_URL =
  'https://wishandsurprise.com/backend/get_cart_items.php';

const UPDATE_CART_URL =
  'https://wishandsurprise.com/backend/cart/add_update_cart.php';

/* ---------------- FETCH CART ---------------- */

export const fetchCartItems = createAsyncThunk(
  'cart/fetch',
  async () => {
    const stored = await AsyncStorage.getItem('userData');
    const userId = JSON.parse(stored || '{}')?.id;

    const res = await axios.get(GET_CART_URL, {
      params: { user_id: userId },
    });

    return res.data; // { items, total_items, total_amount }
  }
);

/* ---------------- UPDATE CART ---------------- */

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async (
    {
      productId,
      productType,
      quantity,
      customData = null,
      comboItems = [],
    },
    { dispatch }
  ) => {
    const stored = await AsyncStorage.getItem('userData');
    const userId = JSON.parse(stored || '{}')?.id;

    await axios.post(UPDATE_CART_URL, {
      user_id: userId,
      product_id: productId,
      product_type: productType,   // ✅ MUST SEND
      quantity,
      custom_data: customData,
      combo_items: comboItems,
    });

    dispatch(fetchCartItems()); // 🔥 Always refresh
  }
);

/* ---------------- SLICE ---------------- */

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    loading: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCartItems.pending, state => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.totalAmount = action.payload.total_amount || 0;
        state.totalItems = action.payload.total_items || 0;
      })
      .addCase(fetchCartItems.rejected, state => {
        state.loading = false;
      });
  },
});

export default cartSlice.reducer;
