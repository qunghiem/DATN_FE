import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const fetchAllProducts = createAsyncThunk(
  'adminProducts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: getAuthHeader(), // khi có token thì trả về data private
      });
      return response.data.data || response.data.result || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Lấy danh sách variants của một product
export const fetchProductVariants = createAsyncThunk(
  'adminProducts/fetchVariants',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product-variants/product/${productId}`);
      if (response.data.code === 1000) {
        return response.data.result || [];
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
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
      if (response.data.code === 1000) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Cập nhật variant
export const updateProductVariant = createAsyncThunk(
  'adminProducts/updateVariant',
  async ({ variantId, colorId, sizeId, stock, images }, { rejectWithValue }) => {
    try {
      const payload = {};
      if (colorId !== undefined) payload.colorId = colorId;
      if (sizeId !== undefined) payload.sizeId = sizeId;
      if (stock !== undefined) payload.stock = stock;
      if (images !== undefined) payload.images = images;

      const response = await axios.put(
        `${API_URL}/product-variants/${variantId}`,
        payload,
        { headers: getAuthHeader() }
      );
      
      if (response.data.code === 1000) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Xóa variant
export const deleteProductVariant = createAsyncThunk(
  'adminProducts/deleteVariant',
  async (variantId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/product-variants/${variantId}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 1000) {
        return variantId;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'adminProducts/update',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: getAuthHeader(),
      });
      return response.data.result;
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
  currentProduct: null,
  productVariants: [],
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
    clearProductVariants: (state) => {
      state.productVariants = [];
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
      // Fetch product variants
      .addCase(fetchProductVariants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productVariants = action.payload;
      })
      .addCase(fetchProductVariants.rejected, (state, action) => {
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
        state.currentProduct = action.payload;
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
      // Update product variant
      .addCase(updateProductVariant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProductVariant.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.productVariants.findIndex(
          v => v.id === action.payload.id
        );
        if (index !== -1) {
          state.productVariants[index] = action.payload;
        }
        state.success = 'Cập nhật biến thể thành công';
      })
      .addCase(updateProductVariant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete product variant
      .addCase(deleteProductVariant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProductVariant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productVariants = state.productVariants.filter(
          v => v.id !== action.payload
        );
        state.success = 'Xóa biến thể thành công';
      })
      .addCase(deleteProductVariant.rejected, (state, action) => {
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

export const { clearMessages, setCurrentProduct, clearProductVariants } = adminProductsSlice.actions;
export default adminProductsSlice.reducer;