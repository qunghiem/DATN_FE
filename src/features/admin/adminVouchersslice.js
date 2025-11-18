import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all vouchers
export const fetchAllVouchers = createAsyncThunk(
  'adminVouchers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Fetch active vouchers
export const fetchActiveVouchers = createAsyncThunk(
  'adminVouchers/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers/active`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Fetch voucher by ID
export const fetchVoucherById = createAsyncThunk(
  'adminVouchers/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers/${id}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Fetch voucher by code
export const fetchVoucherByCode = createAsyncThunk(
  'adminVouchers/fetchByCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers/code/${code}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Validate voucher
export const validateVoucher = createAsyncThunk(
  'adminVouchers/validate',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers/validate/${code}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data;
      }
      return rejectWithValue(response.data.message || 'Voucher không hợp lệ');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Create voucher
export const createVoucher = createAsyncThunk(
  'adminVouchers/create',
  async (voucherData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/vouchers`, voucherData, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Update voucher
export const updateVoucher = createAsyncThunk(
  'adminVouchers/update',
  async ({ id, ...voucherData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/vouchers/${id}`, voucherData, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Delete voucher
export const deleteVoucher = createAsyncThunk(
  'adminVouchers/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/vouchers/${id}`, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return id;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

// Update expired vouchers
export const updateExpiredVouchers = createAsyncThunk(
  'adminVouchers/updateExpired',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/vouchers/update-expired`, {}, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.message;
      }
      return rejectWithValue(response.data.message || 'Có lỗi xảy ra');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  }
);

const initialState = {
  vouchers: [],
  currentVoucher: null,
  isLoading: false,
  error: null,
  success: null,
};

const adminVouchersSlice = createSlice({
  name: 'adminVouchers',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setCurrentVoucher: (state, action) => {
      state.currentVoucher = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all vouchers
      .addCase(fetchAllVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllVouchers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchAllVouchers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch active vouchers
      .addCase(fetchActiveVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveVouchers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchActiveVouchers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch voucher by ID
      .addCase(fetchVoucherById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVoucherById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVoucher = action.payload;
      })
      .addCase(fetchVoucherById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Validate voucher
      .addCase(validateVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateVoucher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload.message;
      })
      .addCase(validateVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create voucher
      .addCase(createVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vouchers.push(action.payload);
        state.success = 'Tạo voucher thành công';
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update voucher
      .addCase(updateVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateVoucher.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.vouchers.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vouchers[index] = action.payload;
        }
        state.success = 'Cập nhật voucher thành công';
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete voucher
      .addCase(deleteVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vouchers = state.vouchers.filter(v => v.id !== action.payload);
        state.success = 'Xóa voucher thành công';
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update expired vouchers
      .addCase(updateExpiredVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExpiredVouchers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload;
      })
      .addCase(updateExpiredVouchers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessages, setCurrentVoucher } = adminVouchersSlice.actions;
export default adminVouchersSlice.reducer;