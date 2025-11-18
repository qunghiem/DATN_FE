import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/cart';

// Helper function to get access token
const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Async thunks for API calls

// Fetch cart from API
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải giỏ hàng'
      );
    }
  }
);

// Add item to cart via API
export const addToCartAPI = createAsyncThunk(
  'cart/addToCartAPI',
  async ({ productVariantId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/add`,
        {
          productVariantId,
          quantity,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể thêm vào giỏ hàng'
      );
    }
  }
);

// Update cart item quantity via API
export const updateCartItemAPI = createAsyncThunk(
  'cart/updateCartItemAPI',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/update/${cartItemId}?quantity=${quantity}`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể cập nhật giỏ hàng'
      );
    }
  }
);

// Remove item from cart via API
export const removeFromCartAPI = createAsyncThunk(
  'cart/removeFromCartAPI',
  async (cartItemId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/remove/${cartItemId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 1000) {
        return response.data.result;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa sản phẩm'
      );
    }
  }
);

// Clear entire cart via API
export const clearCartAPI = createAsyncThunk(
  'cart/clearCartAPI',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/clear`, {
        headers: getAuthHeaders(),
      });
      
      if (response.data.code === 1000) {
        return null;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể xóa giỏ hàng'
      );
    }
  }
);

// Initial state
const initialState = {
  cartId: null,
  items: [],
  totalAmount: 0,
  selectedItems: [], // Danh sách ID của items được chọn để thanh toán
  isLoading: false,
  error: null,
  discountCode: null,
  discountAmount: 0,
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Toggle select item
    toggleSelectItem: (state, action) => {
      const itemId = action.payload;
      
      if (state.selectedItems.includes(itemId)) {
        state.selectedItems = state.selectedItems.filter(id => id !== itemId);
      } else {
        state.selectedItems.push(itemId);
      }
    },

    // Select all items
    selectAllItems: (state) => {
      state.selectedItems = state.items.map(item => item.id);
    },

    // Deselect all items
    deselectAllItems: (state) => {
      state.selectedItems = [];
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Apply discount code
    applyDiscount: (state, action) => {
      state.discountCode = action.payload.code;
      state.discountAmount = action.payload.amount;
    },

    // Remove discount code
    removeDiscount: (state) => {
      state.discountCode = null;
      state.discountAmount = 0;
    },

    // Clear selected items after checkout
    clearSelectedItems: (state) => {
      state.selectedItems = [];
      state.discountCode = null;
      state.discountAmount = 0;
    },

    // Reset cart state
    resetCart: (state) => {
      state.cartId = null;
      state.items = [];
      state.totalAmount = 0;
      state.selectedItems = [];
      state.isLoading = false;
      state.error = null;
      state.discountCode = null;
      state.discountAmount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cartId = action.payload.cartId;
          state.items = action.payload.items || [];
          state.totalAmount = action.payload.totalAmount || 0;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Add to cart
    builder
      .addCase(addToCartAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cartId = action.payload.cartId;
          state.items = action.payload.items || [];
          state.totalAmount = action.payload.totalAmount || 0;
          
          // Tự động chọn item mới thêm vào
          const newItems = action.payload.items || [];
          if (newItems.length > 0) {
            const latestItem = newItems[newItems.length - 1];
            if (!state.selectedItems.includes(latestItem.id)) {
              state.selectedItems.push(latestItem.id);
            }
          }
        }
      })
      .addCase(addToCartAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update cart item
    builder
      .addCase(updateCartItemAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cartId = action.payload.cartId;
          state.items = action.payload.items || [];
          state.totalAmount = action.payload.totalAmount || 0;
        }
      })
      .addCase(updateCartItemAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Remove from cart
    builder
      .addCase(removeFromCartAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.cartId = action.payload.cartId;
          state.items = action.payload.items || [];
          state.totalAmount = action.payload.totalAmount || 0;
        }
      })
      .addCase(removeFromCartAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Clear cart
    builder
      .addCase(clearCartAPI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCartAPI.fulfilled, (state) => {
        state.isLoading = false;
        state.cartId = null;
        state.items = [];
        state.totalAmount = 0;
        state.selectedItems = [];
        state.discountCode = null;
        state.discountAmount = 0;
      })
      .addCase(clearCartAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectCartItems = (state) => {
  return state.cart?.items || [];
};

export const selectSelectedItems = (state) => {
  return state.cart?.selectedItems || [];
};

export const selectCartItemsCount = (state) => {
  const items = selectCartItems(state);
  return items.reduce((total, item) => {
    return total + (item.quantity || 0);
  }, 0);
};

export const selectSelectedItemsCount = (state) => {
  const items = selectCartItems(state);
  const selectedItems = selectSelectedItems(state);
  
  return items.reduce((total, item) => {
    if (selectedItems.includes(item.id)) {
      return total + (item.quantity || 0);
    }
    return total;
  }, 0);
};

export const selectCartSubtotal = (state) => {
  const items = selectCartItems(state);
  const selectedItems = selectSelectedItems(state);
  
  return items.reduce((total, item) => {
    if (selectedItems.includes(item.id)) {
      return total + (item.itemTotalPrice || 0);
    }
    return total;
  }, 0);
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const discount = state.cart?.discountAmount || 0;
  return Math.max(0, subtotal - discount);
};

// Actions
export const { 
  toggleSelectItem,
  selectAllItems,
  deselectAllItems,
  clearError,
  applyDiscount,
  removeDiscount,
  clearSelectedItems,
  resetCart,
} = cartSlice.actions;

// Reducer
export default cartSlice.reducer;