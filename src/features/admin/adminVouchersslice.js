import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to format date from YYYY-MM-DD to dd/MM/yyyy for API
const formatDateForAPI = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Fetch all vouchers (no filter)
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

// Fetch vouchers by status (ACTIVE, INACTIVE, EXPIRED, OUT_OF_STOCK)
export const fetchVouchersByStatus = createAsyncThunk(
  'adminVouchers/fetchByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/vouchers?status=${status}`, {
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
      const response = await axios.get(`${API_URL}/vouchers?status=ACTIVE`, {
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
      return rejectWithValue(response.data.message || 'Không tìm thấy voucher');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy voucher');
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
      return rejectWithValue(response.data.message || 'Không tìm thấy voucher');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không tìm thấy voucher');
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
      return rejectWithValue(error.response?.data?.message || 'Voucher không hợp lệ');
    }
  }
);

// Create voucher
export const createVoucher = createAsyncThunk(
  'adminVouchers/create',
  async (voucherData, { rejectWithValue }) => {
    try {
      // Format dates to dd/MM/yyyy for API
      const formattedData = {
        code: voucherData.code,
        discountType: voucherData.discountType,
        discountValue: voucherData.discountValue,
        usageLimit: voucherData.usageLimit,
        startDate: formatDateForAPI(voucherData.startDate),
        endDate: formatDateForAPI(voucherData.endDate),
      };

      // Add optional fields if they exist
      if (voucherData.maxDiscountValue) {
        formattedData.maxDiscountValue = voucherData.maxDiscountValue;
      }
      if (voucherData.minOrderValue) {
        formattedData.minOrderValue = voucherData.minOrderValue;
      }
      if (voucherData.description) {
        formattedData.description = voucherData.description;
      }
      
      const response = await axios.post(`${API_URL}/vouchers`, formattedData, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Không thể tạo voucher');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo voucher');
    }
  }
);

// Update voucher
export const updateVoucher = createAsyncThunk(
  'adminVouchers/update',
  async ({ id, ...voucherData }, { rejectWithValue }) => {
    try {
      // Format dates to dd/MM/yyyy if they exist
      const formattedData = { ...voucherData };
      
      if (voucherData.startDate) {
        formattedData.startDate = formatDateForAPI(voucherData.startDate);
      }
      if (voucherData.endDate) {
        formattedData.endDate = formatDateForAPI(voucherData.endDate);
      }
      
      const response = await axios.put(`${API_URL}/vouchers/${id}`, formattedData, {
        headers: getAuthHeader(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      }
      return rejectWithValue(response.data.message || 'Không thể cập nhật voucher');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật voucher');
    }
  }
);

// Delete voucher (soft delete - changes status to INACTIVE)
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
      return rejectWithValue(response.data.message || 'Không thể xóa voucher');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa voucher');
    }
  }
);

// Initial state
const initialState = {
  vouchers: [],
  currentVoucher: null,
  isLoading: false,
  error: null,
  success: null,
};

// Slice
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
    clearCurrentVoucher: (state) => {
      state.currentVoucher = null;
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
      
      // Fetch vouchers by status
      .addCase(fetchVouchersByStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVouchersByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchersByStatus.rejected, (state, action) => {
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
      
      // Fetch voucher by code
      .addCase(fetchVoucherByCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVoucherByCode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentVoucher = action.payload;
      })
      .addCase(fetchVoucherByCode.rejected, (state, action) => {
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
        state.currentVoucher = action.payload;
        state.success = 'Cập nhật voucher thành công';
      })
      .addCase(updateVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete voucher (soft delete)
      .addCase(deleteVoucher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteVoucher.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the voucher status to INACTIVE in the list
        const index = state.vouchers.findIndex(v => v.id === action.payload);
        if (index !== -1) {
          state.vouchers[index].status = 'INACTIVE';
        }
        state.success = 'Xóa voucher thành công';
      })
      .addCase(deleteVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { 
  clearMessages, 
  setCurrentVoucher, 
  clearCurrentVoucher 
} = adminVouchersSlice.actions;

// Export reducer
export default adminVouchersSlice.reducer;