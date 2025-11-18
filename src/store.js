import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productsReducer from './features/products/productsSlice';
import cartReducer from './features/cart/cartSlice';
import adminProductsReducer from './features/admin/adminProductsSlice';
// import adminOrdersReducer from './features/admin/adminOrdersSlice';
// import adminCustomersReducer from './features/admin/adminCustomersSlice';
// import adminRevenueReducer from './features/admin/adminRevenueSlice';
import metadataReducer from './features/admin/metadataSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import adminVouchersReducer from './features/admin/adminVouchersslice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    adminProducts: adminProductsReducer,
    // adminOrders: adminOrdersReducer,
    // adminCustomers: adminCustomersReducer,
    // adminRevenue: adminRevenueReducer,
    metadata: metadataReducer,
    adminVouchers: adminVouchersReducer,
  },
});

export default store;