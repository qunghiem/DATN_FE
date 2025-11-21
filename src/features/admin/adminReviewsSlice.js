import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/reviews';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all reviews with pagination and filters
export const fetchAllReviews = createAsyncThunk(
  'adminReviews/fetchAll',
  async ({ page = 0, size = 10, rating = null, productId = null }, { rejectWithValue }) => {
    try {
      let url;
      const params = new URLSearchParams({ page, size });
      
      // Xác định endpoint dựa trên điều kiện lọc
      if (productId && rating) {
        // Có cả productId và rating: sử dụng /product/{productId}?rating=X
        params.append('rating', rating);
        url = `${API_URL}/product/${productId}`;
      } else if (productId) {
        // Chỉ có productId: sử dụng /product/{productId}
        url = `${API_URL}/product/${productId}`;
      } else if (rating) {
        // Chỉ có rating: sử dụng /admin/filter?rating=X
        params.append('rating', rating);
        url = `${API_URL}/admin/filter`;
      } else {
        // Không có filter: lấy tất cả reviews từ /admin
        url = `${API_URL}/admin`;
      }
      
      // Chỉ thêm Authorization header nếu không phải endpoint public
      const headers = (productId && !rating) || (productId && rating) ? {} : getAuthHeader();
      
      const response = await axios.get(`${url}?${params.toString()}`, {
        headers,
      });
      
      if (response.data.code === 1000) {
        const result = response.data.result;
        return {
          reviews: result.data || [],
          totalPages: result.totalPages || 0,
          totalElements: result.totalElements || 0,
          currentPage: result.page || 0,
          averageRating: result.extra?.averageRating || 0,
        };
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Fetch reviews by product ID
export const fetchReviewsByProduct = createAsyncThunk(
  'adminReviews/fetchByProduct',
  async ({ productId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, size });
      const url = `${API_URL}/product/${productId}`;
      
      const response = await axios.get(`${url}?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 1000) {
        const result = response.data.result;
        return {
          reviews: result.data || [],
          totalPages: result.totalPages || 0,
          totalElements: result.totalElements || 0,
          currentPage: result.page || 0,
          averageRating: result.extra?.averageRating || 0,
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
      // Fetch reviews by product
      .addCase(fetchReviewsByProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.currentPage = action.payload.currentPage;
        state.averageRating = action.payload.averageRating;
      })
      .addCase(fetchReviewsByProduct.rejected, (state, action) => {
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