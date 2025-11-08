import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';
// const API_URL = 'https://fnzv9bcp-8080.asse.devtunnels.ms/api/auth';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, remember_me, captcha_response }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
        remember_me,
        captcha_response,
      });
      
      if (response.data.code === 1000) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.result.tokens.access_token);
        localStorage.setItem('refresh_token', response.data.result.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.result.user));
        
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login/google`, { idToken });
      
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.data.tokens.access_token);
        localStorage.setItem('refresh_token', response.data.data.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password, confirmPassword, phone, captcha_token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        fullName,
        email,
        password,
        confirmPassword,
        phone,
        captcha_token,
      });
      
      if (response.data.code === 1000) {
        localStorage.setItem('access_token', response.data.result.data.tokens.access_token);
        localStorage.setItem('refresh_token', response.data.result.data.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.result.data.user));
        
        return response.data.result.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgot-password',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      // Xử lý lỗi từ server (code !== 1000)
      if (error.response?.data?.code) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      // Xử lý lỗi từ server (code !== 1000)
      if (error.response?.data?.code) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, resetToken, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        resetToken,
        newPassword,
        confirmPassword,
      });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      // Xử lý lỗi từ server (code !== 1000)
      if (error.response?.data?.code) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  access_token: localStorage.getItem('access_token') || null,
  refresh_token: localStorage.getItem('refresh_token') || null,
  isLoading: false,
  error: null,
  success: null,
  resetToken: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      state.resetToken = null; // Clear reset token khi logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setResetToken: (state, action) => {
      state.resetToken = action.payload;
    },
    // Thêm action để clear error khi chuyển view
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null; // Clear success message
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.tokens.access_token;
        state.refresh_token = action.payload.tokens.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Login with Google
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.tokens.access_token;
        state.refresh_token = action.payload.tokens.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.tokens.access_token;
        state.refresh_token = action.payload.tokens.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
        state.success = 'Đăng ký thành công!';
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = null;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.resetToken = action.payload.resetToken;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = null;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
        state.resetToken = null; // Clear reset token sau khi thành công
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = null;
      });
  },
});

export const { logout, clearMessages, setResetToken, clearError } = authSlice.actions;
export default authSlice.reducer;