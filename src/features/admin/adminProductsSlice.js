import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Sử dụng relative URL để tận dụng Vite proxy
// Vite sẽ tự động proxy /api/* đến http://localhost:8080/api/*
const API_URL = '/api';

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  // Chỉ thêm Authorization header nếu có token
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchAllProducts = createAsyncThunk(
  'adminProducts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      // Backend trả về { success: true, data: [...] }
      // Chuyển đổi sang format mà frontend expect
      return response.data.data || response.data.result || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const createProduct = createAsyncThunk(
  'adminProducts/create',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: getAuthHeader(),
      });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const createProductVariant = createAsyncThunk(
  'adminProducts/createVariant',
  async (variantData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/product-variants`, variantData, {
        headers: getAuthHeader(),
      });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Async thunk updateProduct
export const updateProduct = createAsyncThunk(
  'adminProducts/update',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: getAuthHeader(),
      });
      return response.data.result; // backend trả về product mới
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);


export const deleteProduct = createAsyncThunk(
  'adminProducts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeader(),
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null, // Sản phẩm vừa tạo để add variants
  isLoading: false,
  error: null,
  success: null,
};

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload; // Lưu sản phẩm vừa tạo
        state.success = 'Tạo sản phẩm thành công! Tiếp tục thêm biến thể.';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create product variant
      .addCase(createProductVariant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProductVariant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Thêm biến thể thành công!';
      })
      .addCase(createProductVariant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.success = 'Cập nhật sản phẩm thành công';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        state.success = 'Xóa sản phẩm thành công';
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, setCurrentProduct } = adminProductsSlice.actions;
export default adminProductsSlice.reducer;