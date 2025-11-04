import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return [];
    
    const parsed = JSON.parse(savedCart);
    
    // Ensure it's always an array
    if (!Array.isArray(parsed)) {
      console.warn('Cart data is not an array, resetting to empty array');
      localStorage.removeItem('cart');
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
      localStorage.removeItem('cart');
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    localStorage.removeItem('cart'); // Clear corrupted data
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items) => {
  try {
    if (!Array.isArray(items)) {
      console.error('Cannot save cart: items is not an array');
      return;
    }
    localStorage.setItem('cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Initial state
const initialState = {
  items: loadCartFromStorage(),
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
      console.log('🔵 CartSlice - addToCart called with:', action.payload);
      
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

      console.log('📦 Current cart items:', state.items);
      console.log('🔍 Items is array?', Array.isArray(state.items));

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
        console.log('🔄 Item already exists, updating quantity');
        // Update quantity if item exists
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity <= stock) {
          existingItem.quantity = newQuantity;
          console.log('✅ Updated quantity to:', newQuantity);
        } else {
          console.error('❌ Exceeds stock:', { newQuantity, stock });
          state.error = `Chỉ còn ${stock} sản phẩm trong kho!`;
          return;
        }
      } else {
        console.log('➕ Adding new item to cart');
        // Add new item
        state.items.push({
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
        });
      }

      console.log('✅ Cart after update:', state.items);
      console.log('📊 Total items:', state.items.length);
      
      saveCartToStorage(state.items);
      state.error = null;
      
      console.log('💾 Saved to localStorage');
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
      saveCartToStorage(state.items);
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
        } else if (quantity <= item.stock) {
          item.quantity = quantity;
        } else {
          state.error = `Chỉ còn ${item.stock} sản phẩm trong kho!`;
          return;
        }
      }

      saveCartToStorage(state.items);
      state.error = null;
    },

    // Clear all items from cart
    clearCart: (state) => {
      state.items = [];
      state.discountCode = null;
      state.discountAmount = 0;
      saveCartToStorage([]);
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
      state.isLoading = false;
      state.error = null;
      state.discountCode = null;
      state.discountAmount = 0;
      localStorage.removeItem('cart');
    },
  },
});

// Selectors with safe fallbacks
export const selectCartItems = (state) => {
  const items = state.cart?.items;
  return Array.isArray(items) ? items : [];
};

export const selectCartItemsCount = (state) => {
  const items = selectCartItems(state);
  return items.reduce((total, item) => {
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return total + quantity;
  }, 0);
};

export const selectCartSubtotal = (state) => {
  const items = selectCartItems(state);
  return items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return total + (price * quantity);
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
  clearCart, 
  clearError,
  applyDiscount,
  removeDiscount,
  resetCart,
} = cartSlice.actions;

// Reducer
export default cartSlice.reducer;