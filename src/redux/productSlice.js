import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    const response = await fetch(
      'https://wishandsurprise.com/backend/get-products.php'
    );
    const data = await response.json();

    const normalizedProducts = [];

    data.forEach((product) => {
      if (
        product.category_id &&
        product.category_id.toString().includes(',')
      ) {
        // 🔹 MULTI CATEGORY → DUPLICATE ROWS
        const categories = product.category_id
          .toString()
          .split(',')
          .map((c) => c.trim());

        categories.forEach((catId) => {
          normalizedProducts.push({
            ...product,
            category_id: catId, // ✅ single category per row
          });
        });
      } else {
        // 🔹 SINGLE CATEGORY → KEEP AS IS
        normalizedProducts.push(product);
      }
    });

    return normalizedProducts;
  }
);



const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
