import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all users with filters and pagination
export const fetchUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async ({ keyword = '', role = '', status = '', page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (role) params.append('role', role);
      if (status) params.append('status', status);
      params.append('page', page);
      params.append('size', size);

      const response = await axios.get(
        `${VITE_API_URL}/api/owner/users?${params.toString()}`,
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

// Create new user (ADMIN or EMPLOYEE)
export const createUser = createAsyncThunk(
  'adminUsers/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${VITE_API_URL}/api/owner/users`,
        userData,
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

// Update user
export const updateUser = createAsyncThunk(
  'adminUsers/updateUser',
  async ({ id, ...userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${VITE_API_URL}/api/owner/users/${id}`,
        userData,
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

// Reset password
export const resetUserPassword = createAsyncThunk(
  'adminUsers/resetPassword',
  async ({ userId, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${VITE_API_URL}/api/owner/users/${userId}/reset-password`,
        { newPassword, confirmPassword },
        { headers: getAuthHeader() }
      );

      if (response.data.code === 1000) {
        return { userId, message: response.data.message };
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

const initialState = {
  users: [],
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
  },
  filters: {
    keyword: '',
    role: '',
    status: '',
  },
  isLoading: false,
  error: null,
  success: null,
};

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { keyword: '', role: '', status: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.content || [];
        state.pagination = {
          totalElements: action.payload.totalElements || 0,
          totalPages: action.payload.totalPages || 0,
          currentPage: action.payload.number || 0,
          pageSize: action.payload.size || 10,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Tạo tài khoản thành công';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.success = 'Cập nhật tài khoản thành công';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset password
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, setFilters, clearFilters } = adminUsersSlice.actions;
export default adminUsersSlice.reducer;