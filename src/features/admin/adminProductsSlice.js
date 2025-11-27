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
      const response = await axios.get(`${API_URL}/products?active=true`, {
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

// Tạo sản phẩm mới - Gửi FormData
export const createProduct = createAsyncThunk(
  'adminProducts/create',
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append các field thông thường
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('discountPercent', productData.discountPercent);
      formData.append('brandId', productData.brandId);
      
      if (productData.costPrice !== undefined) {
        formData.append('costPrice', productData.costPrice);
      }
      
      // Append arrays
      productData.categoryIds.forEach(id => {
        formData.append('categoryIds', id);
      });
      
      productData.labelIds.forEach(id => {
        formData.append('labelIds', id);
      });
      
      // Append images (File objects)
      productData.images.forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });
      
      // Append imageAltTexts
      productData.imageAltTexts.forEach(altText => {
        formData.append('imageAltTexts', altText);
      });

      const response = await axios.post(`${API_URL}/products`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Tạo biến thể sản phẩm - Gửi FormData
export const createProductVariant = createAsyncThunk(
  'adminProducts/createVariant',
  async (variantData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      formData.append('productId', variantData.productId);
      formData.append('colorId', variantData.colorId);
      formData.append('sizeId', variantData.sizeId);
      formData.append('stock', variantData.stock);
      
      // Append variant images
      variantData.images.forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });

      const response = await axios.post(`${API_URL}/product-variants`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
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

// Cập nhật variant - Gửi FormData
export const updateProductVariant = createAsyncThunk(
  'adminProducts/updateVariant',
  async ({ variantId, colorId, sizeId, stock, images }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      if (colorId !== undefined) formData.append('colorId', colorId);
      if (sizeId !== undefined) formData.append('sizeId', sizeId);
      if (stock !== undefined) formData.append('stock', stock);
      
      // Append images
      if (images && images.length > 0) {
        images.forEach((file) => {
          if (file instanceof File) {
            formData.append('images', file);
          } else if (typeof file === 'string') {
            // Nếu là string (tên file cũ), gửi riêng
            formData.append('existingImages', file);
          }
        });
      }

      const response = await axios.put(
        `${API_URL}/product-variants/${variantId}`,
        formData,
        { 
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data',
          }
        }
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

// Cập nhật sản phẩm - Gửi FormData
export const updateProduct = createAsyncThunk(
  'adminProducts/update',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append các field thông thường
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('discountPercent', productData.discountPercent);
      formData.append('brandId', productData.brandId);
      
      if (productData.costPrice !== undefined) {
        formData.append('costPrice', productData.costPrice);
      }
      
      // Append arrays
      productData.categoryIds.forEach(id => {
        formData.append('categoryIds', id);
      });
      
      productData.labelIds.forEach(id => {
        formData.append('labelIds', id);
      });
      
      // Append images (có thể là File mới hoặc string - tên file cũ)
      productData.images.forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file);
        } else if (typeof file === 'string') {
          formData.append('existingImages', file);
        }
      });
      
      // Append imageAltTexts
      productData.imageAltTexts.forEach(altText => {
        formData.append('imageAltTexts', altText);
      });

      const response = await axios.put(`${API_URL}/products/${id}`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Xóa mềm sản phẩm (set active = false)
export const deleteProduct = createAsyncThunk(
  'adminProducts/delete',
  async (id, { rejectWithValue }) => {
    try {
      // Soft delete: gọi API DELETE để set active = false
      const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeader(),
      });
      
      return id;
    } catch (error) {
      console.error('Delete product error:', error);
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
      // Delete product (soft delete)
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