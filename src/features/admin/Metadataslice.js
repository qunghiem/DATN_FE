import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch Brands
export const fetchBrands = createAsyncThunk(
  'metadata/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/brands`, {
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

// Fetch Categories
export const fetchCategories = createAsyncThunk(
  'metadata/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
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

// Fetch Labels
export const fetchLabels = createAsyncThunk(
  'metadata/fetchLabels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/labels`, {
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

// Fetch Colors
export const fetchColors = createAsyncThunk(
  'metadata/fetchColors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/colors`, {
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

// Fetch Sizes
export const fetchSizes = createAsyncThunk(
  'metadata/fetchSizes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/sizes`, {
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

const initialState = {
  brands: [],
  categories: [],
  labels: [],
  colors: [],
  sizes: [],
  isLoading: false,
  error: null,
};

const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Brands
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Labels
      .addCase(fetchLabels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labels = action.payload;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Colors
      .addCase(fetchColors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.colors = action.payload;
      })
      .addCase(fetchColors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Sizes
      .addCase(fetchSizes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sizes = action.payload;
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = metadataSlice.actions;
export default metadataSlice.reducer;