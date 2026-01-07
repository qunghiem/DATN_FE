import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Biến lưu trữ dispatch và refresh timer
let storeDispatch = null;
let authInterceptor = null;
let responseInterceptor = null;
let refreshTimer = null;

// Hàm decode JWT để lấy thời gian hết hạn
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Hàm tính thời gian còn lại của token (ms)
const getTokenRemainingTime = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  return expiryTime - currentTime;
};

// Hàm thiết lập auto refresh trước khi token hết hạn
const setupAutoRefresh = (accessToken, dispatch) => {
  // Clear timer cũ nếu có
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  const remainingTime = getTokenRemainingTime(accessToken);
  
  // Refresh token trước 5 phút (300000ms) khi sắp hết hạn
  // Hoặc nếu token còn ít hơn 5 phút thì refresh ngay sau 1 phút
  const refreshBuffer = 5 * 60 * 1000; // 5 minutes
  const minRefreshTime = 60 * 1000; // 1 minute
  
  let refreshTime;
  if (remainingTime > refreshBuffer) {
    refreshTime = remainingTime - refreshBuffer;
  } else if (remainingTime > minRefreshTime) {
    refreshTime = minRefreshTime;
  } else {
    // Token sắp hết hạn, refresh ngay lập tức
    dispatch(refreshToken());
    return;
  }

  console.log(`Auto refresh will trigger in ${Math.round(refreshTime / 1000)} seconds`);
  
  refreshTimer = setTimeout(() => {
    console.log('Auto refreshing token...');
    dispatch(refreshToken());
  }, refreshTime);
};

// Biến để theo dõi trạng thái refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Setup interceptor
const setupAuthInterceptor = (dispatch) => {
  storeDispatch = dispatch;
  
  // Xóa interceptor cũ nếu có
  if (authInterceptor !== null) {
    axios.interceptors.request.eject(authInterceptor);
  }
  if (responseInterceptor !== null) {
    axios.interceptors.response.eject(responseInterceptor);
  }

  // Request interceptor: tự động thêm token
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

  // Response interceptor: xử lý lỗi 401 và tự động refresh token
  responseInterceptor = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Nếu lỗi 401 và chưa retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Không retry cho các endpoint auth
        if (originalRequest.url.includes('/auth/login') || 
            originalRequest.url.includes('/auth/refresh') ||
            originalRequest.url.includes('/auth/register')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Nếu đang refresh, thêm request vào queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshTokenValue = localStorage.getItem('refresh_token');
        
        if (!refreshTokenValue) {
          // Không có refresh token, logout
          isRefreshing = false;
          processQueue(new Error('No refresh token'), null);
          if (storeDispatch) {
            storeDispatch(logout());
          }
          return Promise.reject(error);
        }

        try {
          // Gọi API refresh token
          const response = await axios.post(`${VITE_API_URL}/api/auth/refresh`, {
            refreshToken: refreshTokenValue,
          });

          if (response.data.code === 1000) {
            const { access_token, refresh_token } = response.data.result;
            
            // Lưu token mới
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            
            // Cập nhật token trong Redux
            if (storeDispatch) {
              storeDispatch(setTokens({ 
                access_token, 
                refresh_token 
              }));
              
              // Setup auto refresh cho token mới
              setupAutoRefresh(access_token, storeDispatch);
            }
            
            // Process queue
            processQueue(null, access_token);
            
            // Retry request gốc với token mới
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axios(originalRequest);
          } else {
            throw new Error('Refresh token failed');
          }
        } catch (refreshError) {
          // Refresh thất bại, logout
          processQueue(refreshError, null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          if (storeDispatch) {
            storeDispatch(logout());
          }
          
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
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
        const { access_token, refresh_token } = response.data.result.tokens;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.result.user));
        
        setupAuthInterceptor(dispatch);
        setupAutoRefresh(access_token, dispatch);
        
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
        const { access_token, refresh_token } = response.data.data.tokens;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        setupAuthInterceptor(dispatch);
        setupAutoRefresh(access_token, dispatch);
        
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
        const { access_token, refresh_token } = response.data.result.data.tokens;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.result.data.user));
        
        setupAuthInterceptor(dispatch);
        setupAutoRefresh(access_token, dispatch);
        
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
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin người dùng!');
    }
  }
);

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
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const { auth } = getState();
      const { refresh_token } = auth;
      
      if (!refresh_token) {
        return rejectWithValue('Không có refresh token');
      }
      
      const response = await axios.post(`${VITE_API_URL}/api/auth/refresh`, {
        refreshToken: refresh_token,
      });
      
      if (response.data.code === 1000) {
        const { access_token, refresh_token: newRefreshToken } = response.data.result;
        
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        // Setup auto refresh cho token mới
        setupAutoRefresh(access_token, dispatch);
        
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
      
      // Clear timer và interceptor
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      
      if (authInterceptor !== null) {
        axios.interceptors.request.eject(authInterceptor);
        authInterceptor = null;
      }
      
      if (responseInterceptor !== null) {
        axios.interceptors.response.eject(responseInterceptor);
        responseInterceptor = null;
      }
      
      storeDispatch = null;
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
    setTokens: (state, action) => {
      state.access_token = action.payload.access_token;
      state.refresh_token = action.payload.refresh_token;
    },
    // Action để khởi tạo auth khi app load
    initializeAuth: (state, action) => {
      const { dispatch } = action.payload;
      if (state.access_token) {
        setupAuthInterceptor(dispatch);
        
        // Check và setup auto refresh nếu token còn hợp lệ
        const remainingTime = getTokenRemainingTime(state.access_token);
        if (remainingTime > 0) {
          setupAutoRefresh(state.access_token, dispatch);
        } else {
          // Token đã hết hạn, refresh ngay
          dispatch(refreshToken());
        }
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
        // Nếu refresh thất bại, logout
        state.user = null;
        state.access_token = null;
        state.refresh_token = null;
        state.isAuthenticated = false;
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
  setTokens,
  initializeAuth
} = authSlice.actions;
export default authSlice.reducer;