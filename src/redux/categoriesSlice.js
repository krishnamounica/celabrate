// redux/categoriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await fetch('https://wishandsurprise.com/backend/get-categories.php');
    // assume the endpoint returns JSON array: [{ id: 1, name: "Keychains" }, ...]
    return response.json();
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: [],     // array of { id, name, ... }
    loading: false,
    error: null,
  },
  reducers: {
    // optional local reducers if you need them
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || 'Failed to load categories';
      });
  },
});

export default categoriesSlice.reducer;

// Selectors
export const selectCategories = (state) => state.categories?.items || [];
export const selectCategoriesLoading = (state) => state.categories?.loading || false;
