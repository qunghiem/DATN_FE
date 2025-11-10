import { createSlice } from '@reduxjs/toolkit';

// Get current user ID
const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.id || user?.email || 'guest';
  } catch (error) {
    return 'guest';
  }
};

// Load cart from localStorage for current user
const loadCartFromStorage = () => {
  try {
    const userId = getCurrentUserId();
    const savedCart = localStorage.getItem(`cart_${userId}`);
    if (!savedCart) return [];
    
    const parsed = JSON.parse(savedCart);
    
    // Ensure it's always an array
    if (!Array.isArray(parsed)) {
      console.warn('Cart data is not an array, resetting to empty array');
      localStorage.removeItem(`cart_${userId}`);
      return [];
    }
    
    // Validate each item has required fields
    const isValid = parsed.every(item => 
      item && 
      typeof item === 'object' &&
      item.productId &&
      item.variantId &&
      typeof item.quantity === 'number'
    );
    
    if (!isValid) {
      console.warn('Cart data is invalid, resetting to empty array');
      localStorage.removeItem(`cart_${userId}`);
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    const userId = getCurrentUserId();
    localStorage.removeItem(`cart_${userId}`); // Clear corrupted data
    return [];
  }
};

// Load selected items from localStorage for current user
const loadSelectedItemsFromStorage = () => {
  try {
    const userId = getCurrentUserId();
    const savedSelected = localStorage.getItem(`selectedItems_${userId}`);
    if (!savedSelected) return [];
    
    const parsed = JSON.parse(savedSelected);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading selected items:', error);
    return [];
  }
};

// Save cart to localStorage for current user
const saveCartToStorage = (items) => {
  try {
    if (!Array.isArray(items)) {
      console.error('Cannot save cart: items is not an array');
      return;
    }
    const userId = getCurrentUserId();
    localStorage.setItem(`cart_${userId}`, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Save selected items to localStorage for current user
const saveSelectedItemsToStorage = (selectedItems) => {
  try {
    if (!Array.isArray(selectedItems)) {
      console.error('Cannot save selected items: not an array');
      return;
    }
    const userId = getCurrentUserId();
    localStorage.setItem(`selectedItems_${userId}`, JSON.stringify(selectedItems));
  } catch (error) {
    console.error('Error saving selected items to localStorage:', error);
  }
};

// Initial state
const initialState = {
  items: loadCartFromStorage(),
  selectedItems: loadSelectedItemsFromStorage(), // Danh sách productId-variantId được chọn
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
    // Add item to cart
    addToCart: (state, action) => {
      const { 
        productId, 
        variantId, 
        name, 
        price, 
        image, 
        color, 
        size, 
        quantity,
        stock 
      } = action.payload;

      // Ensure items is always an array
      if (!Array.isArray(state.items)) {
        console.warn('⚠️ Cart items was not an array, resetting to empty array');
        state.items = [];
      }

      // console.log('Current cart items:', state.items);
      // console.log('Items is array?', Array.isArray(state.items));

      // Validate input
      if (!productId || !variantId) {
        console.error('❌ Invalid product info');
        state.error = 'Thông tin sản phẩm không hợp lệ';
        return;
      }

      if (typeof quantity !== 'number' || quantity <= 0) {
        console.error('❌ Invalid quantity:', quantity);
        state.error = 'Số lượng không hợp lệ';
        return;
      }

      // Check if item already exists in cart
      const existingItem = state.items.find(
        item => item.productId === productId && item.variantId === variantId
      );

      if (existingItem) {
        // console.log('Item already exists, updating quantity');
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= stock) {
          existingItem.quantity = newQuantity;
          // console.log('Updated quantity to:', newQuantity);
        } else {
          console.error('Exceeds stock:', { newQuantity, stock });
          state.error = `Chỉ còn ${stock} sản phẩm trong kho!`;
          return;
        }
      } else {
        // console.log('Adding new item to cart');
        // Add new item
        const newItem = {
          productId,
          variantId,
          name,
          price,
          image,
          color,
          size,
          quantity,
          stock,
          addedAt: new Date().toISOString(),
        };
        state.items.push(newItem);
        
        // Tự động chọn item mới thêm vào
        const itemKey = `${productId}-${variantId}`;
        if (!state.selectedItems.includes(itemKey)) {
          state.selectedItems.push(itemKey);
        }
      }

      // console.log('Cart after update:', state.items);
      console.log('Total items:', state.items.length);
      
      saveCartToStorage(state.items);
      saveSelectedItemsToStorage(state.selectedItems);
      state.error = null;
      
      // console.log('Saved to localStorage');
    },

    // Remove item from cart
    removeFromCart: (state, action) => {
      const { productId, variantId } = action.payload;
      
      // Ensure items is an array
      if (!Array.isArray(state.items)) {
        state.items = [];
        return;
      }
      
      state.items = state.items.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      );
      
      // Xóa khỏi danh sách đã chọn
      const itemKey = `${productId}-${variantId}`;
      state.selectedItems = state.selectedItems.filter(key => key !== itemKey);
      
      saveCartToStorage(state.items);
      saveSelectedItemsToStorage(state.selectedItems);
    },

    // Update item quantity
    updateQuantity: (state, action) => {
      const { productId, variantId, quantity } = action.payload;
      
      // Ensure items is an array
      if (!Array.isArray(state.items)) {
        state.items = [];
        return;
      }
      
      const item = state.items.find(
        item => item.productId === productId && item.variantId === variantId
      );

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items = state.items.filter(
            item => !(item.productId === productId && item.variantId === variantId)
          );
          // Xóa khỏi danh sách đã chọn
          const itemKey = `${productId}-${variantId}`;
          state.selectedItems = state.selectedItems.filter(key => key !== itemKey);
        } else if (quantity <= item.stock) {
          item.quantity = quantity;
        } else {
          state.error = `Chỉ còn ${item.stock} sản phẩm trong kho!`;
          return;
        }
      }

      saveCartToStorage(state.items);
      saveSelectedItemsToStorage(state.selectedItems);
      state.error = null;
    },

    // Toggle select item
    toggleSelectItem: (state, action) => {
      const { productId, variantId } = action.payload;
      const itemKey = `${productId}-${variantId}`;
      
      if (state.selectedItems.includes(itemKey)) {
        state.selectedItems = state.selectedItems.filter(key => key !== itemKey);
      } else {
        state.selectedItems.push(itemKey);
      }
      
      saveSelectedItemsToStorage(state.selectedItems);
    },

    // Select all items
    selectAllItems: (state) => {
      state.selectedItems = state.items.map(
        item => `${item.productId}-${item.variantId}`
      );
      saveSelectedItemsToStorage(state.selectedItems);
    },

    // Deselect all items
    deselectAllItems: (state) => {
      state.selectedItems = [];
      saveSelectedItemsToStorage(state.selectedItems);
    },

    // Remove selected items
    removeSelectedItems: (state) => {
      state.items = state.items.filter(
        item => !state.selectedItems.includes(`${item.productId}-${item.variantId}`)
      );
      state.selectedItems = [];
      saveCartToStorage(state.items);
      saveSelectedItemsToStorage(state.selectedItems);
    },

    // Clear only selected items after checkout
    clearSelectedItems: (state) => {
      state.items = state.items.filter(
        item => !state.selectedItems.includes(`${item.productId}-${item.variantId}`)
      );
      state.selectedItems = [];
      state.discountCode = null;
      state.discountAmount = 0;
      saveCartToStorage(state.items);
      saveSelectedItemsToStorage(state.selectedItems);
    },

    // Clear all items from cart
    clearCart: (state) => {
      state.items = [];
      state.selectedItems = [];
      state.discountCode = null;
      state.discountAmount = 0;
      saveCartToStorage([]);
      saveSelectedItemsToStorage([]);
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
    
    // Reset cart to safe state (for debugging)
    resetCart: (state) => {
      state.items = [];
      state.selectedItems = [];
      state.isLoading = false;
      state.error = null;
      state.discountCode = null;
      state.discountAmount = 0;
      const userId = getCurrentUserId();
      localStorage.removeItem(`cart_${userId}`);
      localStorage.removeItem(`selectedItems_${userId}`);
    },

    // Reload cart when user changes
    reloadCart: (state) => {
      state.items = loadCartFromStorage();
      state.selectedItems = loadSelectedItemsFromStorage();
      state.discountCode = null;
      state.discountAmount = 0;
      state.error = null;
    },
  },
});

// Selectors with safe fallbacks
export const selectCartItems = (state) => {
  const items = state.cart?.items;
  return Array.isArray(items) ? items : [];
};

export const selectSelectedItems = (state) => {
  return state.cart?.selectedItems || [];
};

export const selectCartItemsCount = (state) => {
  const items = selectCartItems(state);
  return items.reduce((total, item) => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return total + quantity;
  }, 0);
};

export const selectSelectedItemsCount = (state) => {
  const items = selectCartItems(state);
  const selectedItems = selectSelectedItems(state);
  
  return items.reduce((total, item) => {
    const itemKey = `${item.productId}-${item.variantId}`;
    if (selectedItems.includes(itemKey)) {
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return total + quantity;
    }
    return total;
  }, 0);
};

export const selectCartSubtotal = (state) => {
  const items = selectCartItems(state);
  const selectedItems = selectSelectedItems(state);
  
  return items.reduce((total, item) => {
    const itemKey = `${item.productId}-${item.variantId}`;
    if (selectedItems.includes(itemKey)) {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return total + (price * quantity);
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
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  toggleSelectItem,
  selectAllItems,
  deselectAllItems,
  removeSelectedItems,
  clearSelectedItems,
  clearCart, 
  clearError,
  applyDiscount,
  removeDiscount,
  resetCart,
  reloadCart,
} = cartSlice.actions;

// Reducer
export default cartSlice.reducer;