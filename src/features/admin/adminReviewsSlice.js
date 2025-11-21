import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reviews';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all reviews with pagination
export const fetchAllReviews = createAsyncThunk(
  'adminReviews/fetchAll',
  async ({ page = 0, size = 10, rating = null, productId = null }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (rating) params.append('rating', rating);
      
      // Nếu có productId, sử dụng endpoint product-specific
      // Ngược lại, sử dụng endpoint admin để lấy tất cả reviews
      let url = productId 
        ? `${API_URL}/product/${productId}`
        : `${API_URL}/admin`;
      
      const response = await axios.get(`${url}?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 1000) {
        return {
          reviews: response.data.result.data || [],
          totalPages: response.data.result.totalPages || 0,
          totalElements: response.data.result.totalElements || 0,
          currentPage: response.data.result.page || 0,
          averageRating: response.data.result.extra?.averageRating || 0,
        };
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Delete review (Admin only)
export const deleteReviewAdmin = createAsyncThunk(
  'adminReviews/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/${reviewId}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 1000) {
        return reviewId;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa đánh giá');
    }
  }
);

const initialState = {
  reviews: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  averageRating: 0,
  isLoading: false,
  error: null,
  success: null,
};

const adminReviewsSlice = createSlice({
  name: 'adminReviews',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.averageRating = action.payload.averageRating;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete review
      .addCase(deleteReviewAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReviewAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(review => review.id !== action.payload);
        state.totalElements -= 1;
        state.success = 'Xóa đánh giá thành công';
      })
      .addCase(deleteReviewAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages } = adminReviewsSlice.actions;
export default adminReviewsSlice.reducer;