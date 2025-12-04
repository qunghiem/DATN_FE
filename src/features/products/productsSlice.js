import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunks
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/products/${productId}`);
      return response.data.result || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải sản phẩm'
      );
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelated',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/products/${productId}/related`);
      return response.data.result || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải sản phẩm liên quan'
      );
    }
  }
);

// Initial state
const initialState = {
  currentProduct: null,
  relatedProducts: [],
  isLoading: false,
  error: null,
};

// Products slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.relatedProducts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch related products
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct } = productsSlice.actions;
export default productsSlice.reducer;