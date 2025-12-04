import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Async thunks
export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ orderId, productVariantId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/api/reviews`,
        { orderId, productVariantId, rating, comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể gửi đánh giá'
      );
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchByProduct',
  async ({ productId, rating, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (rating) params.append('rating', rating);
      
      const response = await axios.get(
        `${VITE_API_URL}/api/reviews/product/${productId}?${params.toString()}`
      );
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải đánh giá'
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${VITE_API_URL}/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.data.code === 1000) {
        return reviewId;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa đánh giá'
      );
    }
  }
);

// Initial state
const initialState = {
  reviews: [],
  averageRating: 0,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  isLoading: false,
  error: null,
  success: null,
};

// Reviews slice
const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.averageRating = 0;
      state.totalElements = 0;
    },
  },
  extraReducers: (builder) => {
    // Create review
    builder
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Đánh giá thành công!';
        state.reviews.unshift(action.payload);
        state.totalElements += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch product reviews
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data || [];
        state.averageRating = action.payload.extra?.averageRating || 0;
        state.totalElements = action.payload.totalElements || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.page || 0;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete review
    builder
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = state.reviews.filter(
          (review) => review.id !== action.payload
        );
        state.totalElements -= 1;
        state.success = 'Xóa đánh giá thành công!';
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;