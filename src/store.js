import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import productsReducer from './features/products/productsSlice';
import cartReducer from './features/cart/cartSlice';
import adminProductsReducer from './features/admin/adminProductsSlice';
import metadataReducer from './features/admin/metadataSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import adminVouchersReducer from './features/admin/adminVouchersslice';
import voucherReducer from './features/vouchers/voucherSlice';
import chatReducer from './features/chat/chatSlice';
import adminOrdersReducer from './features/admin/adminOrdersSlice';
import reviewsReducer from './features/reviews/reviewsSlice';
import adminReviewsReducer from './features/admin/adminReviewsSlice';
import adminUsers from './features/admin/adminUsersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    adminProducts: adminProductsReducer,
    adminOrders: adminOrdersReducer,
    metadata: metadataReducer,
    adminVouchers: adminVouchersReducer,
    vouchers: voucherReducer,
    chat: chatReducer,
    reviews: reviewsReducer,
    adminReviews: adminReviewsReducer,
    adminUsers: adminUsers,
  },
});

export default store;