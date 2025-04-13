import { configureStore, createSlice } from '@reduxjs/toolkit';
import productReducer from './productSlice';
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
  },
  reducers: {
    saveUserData(state, action) {
      state.user = action.payload;
    },
    clearUserData(state) {
      state.user = null;
    },
    updateRequests(state, action) {
      if (state.user) {
        state.user.requests = action.payload; // Update the requests in user data
      }
    },
  },
});

export const { saveUserData, clearUserData, updateRequests } = userSlice.actions;

export const store = configureStore({
  reducer: {
    products: productReducer,
    user: userSlice.reducer,
  },
});
