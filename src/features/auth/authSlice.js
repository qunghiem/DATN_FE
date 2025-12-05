import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Biến lưu trữ dispatch để interceptor có thể sử dụng
let storeDispatch = null;

// Interceptor để tự động logout khi token hết hạn
let authInterceptor = null;

const setupAuthInterceptor = (dispatch) => {
  // Lưu dispatch để sử dụng trong interceptor
  storeDispatch = dispatch;
  
  // Xóa interceptor cũ nếu có
  if (authInterceptor !== null) {
    axios.interceptors.request.eject(authInterceptor);
  }

  // Interceptor cho request: tự động thêm token
  authInterceptor = axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor cho response: xử lý lỗi 401 toàn cục
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token hết hạn, tự động logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (storeDispatch) {
          storeDispatch(logout());
        }
        
        // Redirect đến trang login nếu đang ở client side
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, remember_me, captcha_response }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/api/auth/login`, {
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
        
        // Thiết lập interceptor sau khi login thành công
        setupAuthInterceptor(dispatch);
        
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
  async ({ idToken }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/api/auth/login/google`, { idToken });
      
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.data.tokens.access_token);
        localStorage.setItem('refresh_token', response.data.data.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Thiết lập interceptor sau khi login thành công
        setupAuthInterceptor(dispatch);
        
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
  async ({ fullName, email, password, confirmPassword, phone, captcha_token }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/api/auth/register`, {
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
        
        // Thiết lập interceptor sau khi register thành công
        setupAuthInterceptor(dispatch);
        
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
      const response = await axios.post(`${VITE_API_URL}/api/auth/forgot-password`, { email });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
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
      const response = await axios.post(`${VITE_API_URL}/api/auth/verify-otp`, { email, otp });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
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
      const response = await axios.post(`${VITE_API_URL}/api/auth/reset-password`, {
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
      if (error.response?.data?.code) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }
);

// Thêm async thunk để fetch user profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const { access_token } = auth;
      
      if (!access_token) {
        return rejectWithValue('Không có token xác thực');
      }
      
      const response = await axios.get(`${VITE_API_URL}/api/users/profile`);

      if (response.data.code === 1000) {
        const userProfile = response.data.result;
        localStorage.setItem('user', JSON.stringify(userProfile));
        return userProfile;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      // Interceptor global sẽ xử lý lỗi 401, ở đây chỉ cần trả về lỗi thông thường
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin người dùng!');
    }
  }
);

// Thêm async thunk để update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async ({ fullName, phone }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const { access_token } = auth;
      
      if (!access_token) {
        return rejectWithValue('Không có token xác thực');
      }
      
      const response = await axios.put(
        `${VITE_API_URL}/api/users/update-profile`,
        {
          fullName,
          phone,
        }
      );

      if (response.data.code === 1000) {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = {
          ...currentUser,
          fullName,
          phone,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      // Interceptor global sẽ xử lý lỗi 401
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
    }
  }
);

// Thêm async thunk để refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const { refresh_token } = auth;
      
      if (!refresh_token) {
        return rejectWithValue('Không có refresh token');
      }
      
      const response = await axios.post(`${VITE_API_URL}/api/auth/refresh-token`, {
        refresh_token: refresh_token,
      });
      
      if (response.data.code === 1000) {
        const { access_token, refresh_token: newRefreshToken } = response.data.result.tokens;
        
        // Cập nhật tokens mới
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        return {
          access_token,
          refresh_token: newRefreshToken,
        };
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể làm mới token');
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
      state.resetToken = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      // Xóa interceptor khi logout
      if (authInterceptor !== null) {
        axios.interceptors.request.eject(authInterceptor);
        authInterceptor = null;
        storeDispatch = null;
      }
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setResetToken: (state, action) => {
      state.resetToken = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    // Thêm action để thiết lập interceptor khi khởi tạo app
    initializeAuth: (state, action) => {
      const { dispatch } = action.payload;
      if (state.access_token && !authInterceptor) {
        setupAuthInterceptor(dispatch);
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
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
        state.resetToken = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = null;
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update User Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.success = 'Cập nhật thông tin thành công!';
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.access_token = action.payload.access_token;
        state.refresh_token = action.payload.refresh_token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  logout, 
  clearMessages, 
  setResetToken, 
  clearError, 
  setUser, 
  updateUser,
  initializeAuth
} = authSlice.actions;
export default authSlice.reducer;