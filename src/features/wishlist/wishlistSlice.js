import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/wishlist';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Toggle wishlist (thêm/bỏ thích)
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/toggle`,
        { productId },
        { headers: getAuthHeader() }
      );
      
      if (response.data.code === 1000) {
        return {
          productId,
          message: response.data.result,
          isAdded: response.data.result.includes('thêm'),
        };
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật wishlist'
      );
    }
  }
);

// Lấy danh sách wishlist của user
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 1000) {
        return response.data.result || [];
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi tải wishlist'
      );
    }
  }
);

// Lấy danh sách sản phẩm được yêu thích nhiều nhất
export const fetchTopLiked = createAsyncThunk(
  'wishlist/fetchTopLiked',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/top-liked`);
      
      if (response.data.code === 1000) {
        return response.data.result || [];
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm yêu thích'
      );
    }
  }
);

const initialState = {
  items: [],
  topLiked: [],
  wishlistProductIds: [], // Danh sách ID sản phẩm đã thích (để check nhanh)
  isLoading: false,
  error: null,
  success: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistProductIds = [];
    },
  },
  extraReducers: (builder) => {
    // Toggle wishlist
    builder
      .addCase(toggleWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        
        const { productId, isAdded } = action.payload;
        
        if (isAdded) {
          // Thêm vào danh sách
          if (!state.wishlistProductIds.includes(productId)) {
            state.wishlistProductIds.push(productId);
          }
        } else {
          // Xóa khỏi danh sách
          state.wishlistProductIds = state.wishlistProductIds.filter(
            id => id !== productId
          );
          state.items = state.items.filter(
            item => item.productId !== productId
          );
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
    // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.wishlistProductIds = action.payload.map(item => item.productId);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
    // Fetch top liked
      .addCase(fetchTopLiked.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopLiked.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topLiked = action.payload;
      })
      .addCase(fetchTopLiked.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectWishlistItems = (state) => state.wishlist?.items || [];
export const selectTopLikedProducts = (state) => state.wishlist?.topLiked || [];
export const selectIsInWishlist = (productId) => (state) => {
  return state.wishlist?.wishlistProductIds?.includes(productId) || false;
};
export const selectWishlistCount = (state) => state.wishlist?.items?.length || 0;

export const { clearMessages, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;