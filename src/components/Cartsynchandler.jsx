import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reloadCart } from '../features/cart/cartSlice';

/**
 * Component này sẽ reload cart mỗi khi user thay đổi (login/logout)
 * Đặt component này trong App.jsx
 */
const CartSyncHandler = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Reload cart khi user thay đổi
    dispatch(reloadCart());
  }, [user, isAuthenticated, dispatch]);

  return null; // Component này không render gì
};

export default CartSyncHandler;