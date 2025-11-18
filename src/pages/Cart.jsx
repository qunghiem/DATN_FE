import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Tag,
  X,
} from "lucide-react";
import {
  fetchCart,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI,
  selectCartItems,
  selectSelectedItems,
  selectCartSubtotal,
  selectCartTotal,
  applyDiscount,
  removeDiscount,
  clearError,
  toggleSelectItem,
  selectAllItems,
  deselectAllItems,
} from "../features/cart/cartSlice";
import { toast } from "react-toastify";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const selectedItems = useSelector(selectSelectedItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const { error, discountCode, discountAmount, isLoading } = useSelector(
    (state) => state.cart
  );
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [itemToRemove, setItemToRemove] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveSelectedConfirm, setShowRemoveSelectedConfirm] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để xem giỏ hàng");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Check if item is selected
  const isItemSelected = (itemId) => {
    return selectedItems.includes(itemId);
  };

  // Check if all items are selected
  const isAllSelected = () => {
    return cartItems.length > 0 && selectedItems.length === cartItems.length;
  };

  // Handle toggle select item
  const handleToggleSelect = (itemId) => {
    dispatch(toggleSelectItem(itemId));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected()) {
      dispatch(deselectAllItems());
    } else {
      dispatch(selectAllItems());
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    try {
      await dispatch(updateCartItemAPI({ cartItemId, quantity: newQuantity })).unwrap();
      toast.success("Đã cập nhật số lượng!");
    } catch (error) {
      toast.error(error || "Không thể cập nhật số lượng");
    }
  };

  // Handle remove item
  const handleRemoveItem = (cartItemId) => {
    setItemToRemove(cartItemId);
  };

  // Confirm remove item
  const confirmRemoveItem = async () => {
    if (itemToRemove) {
      try {
        await dispatch(removeFromCartAPI(itemToRemove)).unwrap();
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
        setItemToRemove(null);
      } catch (error) {
        toast.error(error || "Không thể xóa sản phẩm");
      }
    }
  };

  // Handle remove selected items
  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) {
      toast.info("Vui lòng chọn sản phẩm cần xóa!");
      return;
    }
    setShowRemoveSelectedConfirm(true);
  };

  const confirmRemoveSelected = async () => {
    try {
      // Xóa từng item đã chọn
      for (const itemId of selectedItems) {
        await dispatch(removeFromCartAPI(itemId)).unwrap();
      }
      setShowRemoveSelectedConfirm(false);
      dispatch(deselectAllItems());
      toast.success("Đã xóa sản phẩm đã chọn!");
    } catch (error) {
      toast.error(error || "Không thể xóa sản phẩm");
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    try {
      await dispatch(clearCartAPI()).unwrap();
      setShowClearConfirm(false);
      toast.success("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      toast.error(error || "Không thể xóa giỏ hàng");
    }
  };

  // Handle apply voucher
  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast.info("Vui lòng nhập mã giảm giá!");
      return;
    }

    const vouchers = {
      GIAM50K: { amount: 50000, minOrder: 600000 },
      GIAM10: { percent: 10, minOrder: 1000000 },
      GIAM15: { percent: 15, minOrder: 1500000 },
      FREESHIP: { freeship: true, minOrder: 300000 },
    };

    const code = voucherCode.toUpperCase();
    const voucher = vouchers[code];

    if (!voucher) {
      toast.error("Mã giảm giá không hợp lệ!");
      return;
    }

    if (subtotal < voucher.minOrder) {
      toast.warning(
        `Đơn hàng tối thiểu ${formatPrice(voucher.minOrder)} để áp dụng mã này!`
      );
      return;
    }

    let discount = 0;
    if (voucher.freeship) {
      discount = 0;
    } else {
      discount = voucher.amount || Math.floor((subtotal * voucher.percent) / 100);
    }

    dispatch(applyDiscount({ code, amount: discount }));
    setVoucherCode("");
    toast.success("Đã áp dụng mã giảm giá!");
  };

  // Handle remove voucher
  const handleRemoveVoucher = () => {
    dispatch(removeDiscount());
    toast.info("Đã gỡ mã giảm giá!");
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm cần thanh toán!");
      return;
    }

    navigate("/place-order");
  };

  // Loading state
  if (isLoading && cartItems.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5] mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }
  
  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  const shippingFee = 30000;
  const hasFreeShip = discountCode === "FREESHIP";
  const finalShipping = hasFreeShip ? 0 : shippingFee;
  const finalTotal = subtotal - discountAmount + finalShipping;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Giỏ hàng của bạn ({cartItems.length} sản phẩm)
          </h1>
          <button
            onClick={() => navigate("/collection")}
            className="flex items-center gap-2 text-[#3A6FB5] hover:text-[#2E5C99] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Tiếp tục mua sắm
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-600 text-sm">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select all and bulk actions */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected()}
                    onChange={handleSelectAll}
                    className="w-5 h-5 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
                  />
                  <span className="font-medium text-gray-700">
                    Chọn tất cả ({cartItems.length})
                  </span>
                </label>

                <div className="flex gap-3">
                  {selectedItems.length > 0 && (
                    <button
                      onClick={handleRemoveSelected}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Xóa đã chọn ({selectedItems.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </div>
            </div>

            {/* Items list */}
            {cartItems.map((item) => {
              console.log("Cart item:", item);
return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition ${
                  isItemSelected(item.id) ? "ring-2 ring-[#3A6FB5]" : ""
                }`}
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isItemSelected(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-5 h-5 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
                    />
                  </div>

                  {/* Image */}
                  <div
                    className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3
                      className="font-medium text-gray-900 mb-1 hover:text-[#3A6FB5] cursor-pointer line-clamp-2"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.productName}
                    </h3>

                    <div className="text-sm text-gray-600 mb-2">
                      <span>Màu: {item.colorName}</span>
                      <span className="mx-2">|</span>
                      <span>Size: {item.sizeName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition"
                          disabled={isLoading}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition"
                          disabled={isLoading}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {formatPrice(item.itemTotalPrice)}
                        </div>
                        {item.price !== item.discountPrice && (
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatPrice(item.discountPrice)} x {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )
            }
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin đơn hàng
              </h2>

              {selectedItems.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                  Vui lòng chọn sản phẩm cần thanh toán
                </div>
              )}

              {/* Voucher */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    disabled={!!discountCode}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none disabled:bg-gray-100"
                  />
                  {!discountCode ? (
                    <button
                      onClick={handleApplyVoucher}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Áp dụng
                    </button>
                  ) : (
                    <button
                      onClick={handleRemoveVoucher}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {discountCode && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <Tag className="w-4 h-4" />
                    <span>Đã áp dụng mã: {discountCode}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">
                    {hasFreeShip ? "Miễn phí" : formatPrice(shippingFee)}
                  </span>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0 || isLoading}
                className="w-full mt-6 px-6 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Tiến hành thanh toán ({selectedItems.length})
              </button>

              {/* Free shipping notice */}
              {!hasFreeShip &&
                subtotal < 300000 &&
                selectedItems.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    Mua thêm {formatPrice(300000 - subtotal)} để dùng mã
                    FREESHIP!
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear cart confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xóa tất cả sản phẩm?
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleClearCart}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-300"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove selected confirmation modal */}
      {showRemoveSelectedConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xóa sản phẩm đã chọn?
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa {selectedItems.length} sản phẩm đã chọn
              không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveSelectedConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmRemoveSelected}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-300"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove single item confirmation modal */}
      {itemToRemove && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xóa sản phẩm này?
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToRemove(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmRemoveItem}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-300"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;