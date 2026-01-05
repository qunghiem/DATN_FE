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

// ==================== ASYNC THUNKS ====================

// Fetch all active vouchers
export const fetchActiveVouchers = createAsyncThunk(
  'vouchers/fetchActiveVouchers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/vouchers?status=ACTIVE`, {
        headers: getAuthHeaders(),
      });
      
      console.log("API Response:", response.data); // Thêm log
      
      if (response.data.code === 0) {
        const vouchers = response.data.result || [];
        console.log("Vouchers received:", vouchers.length);
        console.log("Sample voucher:", vouchers[0]);
        return vouchers;
      } else {
        console.error("API error code:", response.data.code);
        return rejectWithValue(response.data.message || 'Không thể tải danh sách voucher');
      }
    } catch (error) {
      console.error("API call failed:", error);
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải danh sách voucher'
      );
    }
  }
);

// Validate voucher code with order value
export const validateVoucher = createAsyncThunk(
  'vouchers/validateVoucher',
  async ({ code, orderValue }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${VITE_API_URL}/api/vouchers/validate/${code}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 0) {
        const voucher = response.data.result;
        
        // Check minimum order value requirement
        if (voucher.minOrderValue && orderValue < voucher.minOrderValue) {
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

// ==================== UTILITY FUNCTIONS ====================

// Calculate discount amount based on voucher type
export const calculateDiscount = (voucher, orderValue) => {
  if (!voucher || !orderValue) return 0;
  
  let discount = 0;
  
  switch (voucher.discountType) {
    case 'FIXED_AMOUNT':
      // Fixed amount discount
      discount = Number(voucher.discountValue);
      break;
      
    case 'PERCENTAGE':
      // Percentage discount
      discount = Math.floor((orderValue * Number(voucher.discountValue)) / 100);
      
      // Apply max discount limit if exists
      if (voucher.maxDiscountValue) {
        discount = Math.min(discount, Number(voucher.maxDiscountValue));
      }
      break;
      
    case 'FREESHIP':
      // Free shipping discount (typically shipping fee value)
      discount = Number(voucher.discountValue);
      break;
      
    default:
      discount = 0;
  }
  
  return discount;
};

// Check if voucher is applicable to current order
export const isVoucherApplicable = (voucher, orderValue) => {
  if (!voucher) return false;
  
  // Check if voucher is active
  if (voucher.status !== 'ACTIVE') return false;
  
  // Check minimum order value
  if (voucher.minOrderValue && orderValue < voucher.minOrderValue) {
    return false;
  }
  
  // Check if voucher has remaining uses
  if (voucher.usageCount >= voucher.usageLimit) {
    return false;
  }
  
  return true;
};

// ==================== INITIAL STATE ====================

const initialState = {
  activeVouchers: [],
  appliedVoucher: null,
  discountAmount: 0,
  isLoading: false,
  error: null,
  validationError: null,
};

// ==================== SLICE ====================

const voucherSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {
    // Apply voucher manually (for selecting from list)
    applyVoucherManually: (state, action) => {
      const { voucher, orderValue } = action.payload;
      
      // Check if voucher is applicable
      if (!isVoucherApplicable(voucher, orderValue)) {
        state.validationError = 'Voucher không khả dụng cho đơn hàng này';
        return;
      }
      
      state.appliedVoucher = voucher;
      state.discountAmount = calculateDiscount(voucher, orderValue);
      state.validationError = null;
      state.error = null;
    },
    
    // Remove applied voucher
    removeAppliedVoucher: (state) => {
      state.appliedVoucher = null;
      state.discountAmount = 0;
      state.validationError = null;
    },
    
    // Update discount amount when order value changes
    updateDiscountAmount: (state, action) => {
      const orderValue = action.payload;
      
      if (state.appliedVoucher) {
        // Recalculate discount with new order value
        const newDiscount = calculateDiscount(state.appliedVoucher, orderValue);
        
        // Check if still meets minimum order value
        if (state.appliedVoucher.minOrderValue && orderValue < state.appliedVoucher.minOrderValue) {
          state.validationError = `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(state.appliedVoucher.minOrderValue)}₫`;
          state.discountAmount = 0;
        } else {
          state.discountAmount = newDiscount;
          state.validationError = null;
        }
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
    
    // Reset voucher state (use when completing order or clearing cart)
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
        state.activeVouchers = action.payload || [];
        state.error = null;
      })
      .addCase(fetchActiveVouchers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.activeVouchers = [];
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
        state.validationError = null;
        state.error = null;
        // Note: discount amount should be calculated separately based on order value
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
        state.error = null;
        // Store in appliedVoucher for potential use
      })
      .addCase(getVoucherByCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// ==================== SELECTORS ====================

export const selectActiveVouchers = (state) => state.vouchers?.activeVouchers || [];
export const selectAppliedVoucher = (state) => state.vouchers?.appliedVoucher;
export const selectDiscountAmount = (state) => state.vouchers?.discountAmount || 0;
export const selectVoucherError = (state) => state.vouchers?.error;
export const selectValidationError = (state) => state.vouchers?.validationError;
export const selectIsVoucherLoading = (state) => state.vouchers?.isLoading || false;

// Selector to check if a voucher is applied
export const selectHasAppliedVoucher = (state) => !!state.vouchers?.appliedVoucher;

// Selector to get applicable vouchers for current order value
export const selectApplicableVouchers = (orderValue) => (state) => {
  return state.vouchers?.activeVouchers?.filter(voucher => 
    isVoucherApplicable(voucher, orderValue)
  ) || [];
};

// ==================== EXPORTS ====================

// Export actions
export const {
  applyVoucherManually,
  removeAppliedVoucher,
  updateDiscountAmount,
  clearValidationError,
  clearError,
  resetVoucherState,
} = voucherSlice.actions;

// Export reducer
export default voucherSlice.reducer;