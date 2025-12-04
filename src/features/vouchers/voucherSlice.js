import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Async thunks for API calls

// Fetch all active vouchers
export const fetchActiveVouchers = createAsyncThunk(
  'vouchers/fetchActiveVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/vouchers/active`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message || 'Không thể tải danh sách voucher');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách voucher'
      );
    }
  }
);

// Validate voucher code
export const validateVoucher = createAsyncThunk(
  'vouchers/validateVoucher',
  async ({ code, orderValue }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/vouchers/validate/${code}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 0) {
        const voucher = response.data.result;
        
        // Check minimum order value
        if (orderValue < voucher.minOrderValue) {
          return rejectWithValue(
            `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(voucher.minOrderValue)}₫ để áp dụng mã này!`
          );
        }
        
        return voucher;
      } else {
        return rejectWithValue(response.data.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Mã giảm giá không hợp lệ'
      );
    }
  }
);

// Get voucher by code
export const getVoucherByCode = createAsyncThunk(
  'vouchers/getVoucherByCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/vouchers/code/${code}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 0) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message || 'Không tìm thấy voucher');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không tìm thấy voucher'
      );
    }
  }
);

// Calculate discount amount based on voucher
export const calculateDiscount = (voucher, orderValue) => {
  if (!voucher) return 0;
  
  let discount = 0;
  
  switch (voucher.discountType) {
    case 'FIXED_AMOUNT':
      discount = voucher.discountValue;
      break;
      
    case 'PERCENTAGE':
      discount = Math.floor((orderValue * voucher.discountValue) / 100);
      // Apply max discount limit if exists
      if (voucher.maxDiscountValue) {
        discount = Math.min(discount, voucher.maxDiscountValue);
      }
      break;
      
    case 'FREESHIP':
      // For freeship, return the shipping fee value
      discount = voucher.discountValue;
      break;
      
    default:
      discount = 0;
  }
  
  return discount;
};

// Initial state
const initialState = {
  activeVouchers: [],
  appliedVoucher: null,
  discountAmount: 0,
  isLoading: false,
  error: null,
  validationError: null,
};

// Voucher slice
const voucherSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {
    // Apply voucher manually
    applyVoucherManually: (state, action) => {
      const { voucher, orderValue } = action.payload;
      state.appliedVoucher = voucher;
      state.discountAmount = calculateDiscount(voucher, orderValue);
      state.validationError = null;
    },
    
    // Remove applied voucher
    removeAppliedVoucher: (state) => {
      state.appliedVoucher = null;
      state.discountAmount = 0;
      state.validationError = null;
    },
    
    // Update discount amount when order value changes
    updateDiscountAmount: (state, action) => {
      if (state.appliedVoucher) {
        state.discountAmount = calculateDiscount(state.appliedVoucher, action.payload);
      }
    },
    
    // Clear validation error
    clearValidationError: (state) => {
      state.validationError = null;
    },
    
    // Clear all errors
    clearError: (state) => {
      state.error = null;
      state.validationError = null;
    },
    
    // Reset voucher state
    resetVoucherState: (state) => {
      state.appliedVoucher = null;
      state.discountAmount = 0;
      state.error = null;
      state.validationError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch active vouchers
    builder
      .addCase(fetchActiveVouchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveVouchers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeVouchers = action.payload;
      })
      .addCase(fetchActiveVouchers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Validate voucher
    builder
      .addCase(validateVoucher.pending, (state) => {
        state.isLoading = true;
        state.validationError = null;
      })
      .addCase(validateVoucher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appliedVoucher = action.payload;
        // Discount will be calculated separately based on order value
        state.validationError = null;
      })
      .addCase(validateVoucher.rejected, (state, action) => {
        state.isLoading = false;
        state.validationError = action.payload;
        state.appliedVoucher = null;
        state.discountAmount = 0;
      });

    // Get voucher by code
    builder
      .addCase(getVoucherByCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVoucherByCode.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(getVoucherByCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectActiveVouchers = (state) => state.vouchers.activeVouchers;
export const selectAppliedVoucher = (state) => state.vouchers.appliedVoucher;
export const selectDiscountAmount = (state) => state.vouchers.discountAmount;
export const selectVoucherError = (state) => state.vouchers.error;
export const selectValidationError = (state) => state.vouchers.validationError;
export const selectIsVoucherLoading = (state) => state.vouchers.isLoading;

// Actions
export const {
  applyVoucherManually,
  removeAppliedVoucher,
  updateDiscountAmount,
  clearValidationError,
  clearError,
  resetVoucherState,
} = voucherSlice.actions;

// Reducer
export default voucherSlice.reducer;