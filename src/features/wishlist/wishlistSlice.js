import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/wishlist';
const RECOMMENDATION_API_URL = import.meta.env.VITE_RECOMMENDATION_API_URL || 'http://localhost:8000';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Hàm refresh recommendations với better error handling
const refreshUserRecommendations = async (userId) => {
  if (!userId) {
    console.warn('⚠️ No userId provided for recommendation refresh');
    return null;
  }

  try {
    console.log(`🔄 [POST] Triggering recommendation refresh for user ${userId}`);
    console.log(`📍 URL: ${RECOMMENDATION_API_URL}/api/recommendations/user/${userId}/refresh?trigger=wishlist`);
    
    const response = await axios.post(
      `${RECOMMENDATION_API_URL}/api/recommendations/user/${userId}/refresh`,
      null, // POST body (empty)
      { 
        params: { trigger: 'wishlist' },
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Recommendation refresh response:', response.data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.warn('⚠️ Recommendation refresh timeout (this is OK, processing in background)');
    } else if (error.response?.status === 405) {
      console.error('❌ Method Not Allowed - Check if endpoint expects POST:', error.response);
    } else if (error.response?.status === 500) {
      console.error('❌ Server error during refresh:', error.response?.data);
    } else {
      console.warn('⚠️ Failed to refresh recommendations:', error.message);
    }
    return null;
  }
};

// Toggle wishlist (thêm/bỏ thích)
export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await axios.post(
        `${API_URL}/toggle`,
        { productId },
        { headers: getAuthHeader() }
      );
      
      if (response.data.code === 1000) {
        const result = {
          productId,
          message: response.data.result,
          isAdded: response.data.result.includes('thêm'),
        };
        
        // Lấy userId từ state
        const state = getState();
        const userId = state.auth?.user?.id;
        
        console.log(`📝 Wishlist toggled - productId: ${productId}, userId: ${userId}, isAdded: ${result.isAdded}`);
        
        // ✅ Chỉ trigger refresh khi ADD (không cần khi remove)
        if (userId && result.isAdded) {
          // Fire and forget - không block UI
          refreshUserRecommendations(userId)
            .then((refreshResult) => {
              if (refreshResult?.code === 1000) {
                // ✅ Dispatch action để notify components cần reload
                dispatch(triggerRecommendationsRefresh(userId));
                console.log('🔄 Recommendations refreshed, components should reload');
              }
            })
            .catch(() => {
              console.log('Silent fail - recommendation refresh');
            });
        }
        
        return result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật wishlist'
      );
    }
  }
);

// Thêm vào wishlist với userId
export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async ({ productId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${API_URL}/add`,
        { productId, userId },
        { headers: getAuthHeader() }
      );
      
      if (response.data.code === 1000) {
        console.log(`📝 Added product ${productId} to wishlist, userId: ${userId}`);
        
        // Trigger refresh recommendations
        if (userId) {
          refreshUserRecommendations(userId)
            .then((refreshResult) => {
              if (refreshResult?.code === 1000) {
                dispatch(triggerRecommendationsRefresh(userId));
                console.log('🔄 Recommendations refreshed, components should reload');
              }
            })
            .catch(() => {
              console.log('Silent fail - recommendation refresh');
            });
        }
        
        return {
          productId,
          message: response.data.result || 'Đã thêm vào wishlist!',
          isAdded: true
        };
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào wishlist'
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
  wishlistProductIds: [],
  isLoading: false,
  error: null,
  success: null,
  lastAction: null,
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
    triggerRecommendationsRefresh: (state, action) => {
      state.lastAction = {
        type: 'refresh_recommendations',
        timestamp: new Date().toISOString(),
        userId: action.payload
      };
    }
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
          if (!state.wishlistProductIds.includes(productId)) {
            state.wishlistProductIds.push(productId);
          }
        } else {
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
      
    // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        
        const { productId } = action.payload;
        
        if (!state.wishlistProductIds.includes(productId)) {
          state.wishlistProductIds.push(productId);
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
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
export const selectWishlistLoading = (state) => state.wishlist?.isLoading || false;

export const { clearMessages, clearWishlist, triggerRecommendationsRefresh } = wishlistSlice.actions;
export default wishlistSlice.reducer;