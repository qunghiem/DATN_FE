import { useState } from "react";
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
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
  applyDiscount,
  removeDiscount,
  clearError,
} from "../features/cart/cartSlice";
import { toast } from "react-toastify";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const { error, discountCode, discountAmount } = useSelector(
    (state) => state.cart
  );

  const [voucherCode, setVoucherCode] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Handle quantity change
  const handleQuantityChange = (productId, variantId, newQuantity, stock) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId, variantId);
      return;
    }

    if (newQuantity > stock) {
      toast.warning(`Chỉ còn ${stock} sản phẩm trong kho!`);
      return;
    }

    dispatch(updateQuantity({ productId, variantId, quantity: newQuantity }));
  };

  // Handle remove item
  const handleRemoveItem = (productId, variantId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      dispatch(removeFromCart({ productId, variantId }));
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    dispatch(clearCart());
    setShowClearConfirm(false);
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
      FREESHIP: { freeship: true, minOrder: 300000 }, // FREESHIP chỉ miễn ship
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

    // Nếu là mã freeship, không giảm tiền hàng, chỉ miễn phí vận chuyển
    let discount = 0;
    if (voucher.freeship) {
      discount = 0; // <-- sửa ở đây: không đặt 30000 nữa
    } else {
      discount =
        voucher.amount || Math.floor((subtotal * voucher.percent) / 100);
    }

    dispatch(applyDiscount({ code, amount: discount }));
    setVoucherCode("");
  };

  // Handle remove voucher
  const handleRemoveVoucher = () => {
    dispatch(removeDiscount());
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống!");
      return;
    }

    navigate("/place-order");
  };

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

  // 🚚 Ship cost mặc định 30.000đ
  const shippingFee = 30000;
  const hasFreeShip = discountCode === "FREESHIP";
  const finalShipping = hasFreeShip ? 0 : shippingFee;

  // Tổng tiền cuối cùng (subtotal - discount + ship)
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
            {/* Clear cart button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Xóa tất cả
              </button>
            </div>

            {/* Items list */}
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div
                    className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3
                      className="font-medium text-gray-900 mb-1 hover:text-[#3A6FB5] cursor-pointer line-clamp-2"
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.name}
                    </h3>

                    <div className="text-sm text-gray-600 mb-2">
                      <span>Màu: {item.color}</span>
                      <span className="mx-2">|</span>
                      <span>Size: {item.size}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                              item.stock
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 font-medium min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                              item.stock
                            )
                          }
                          className="px-3 py-1 hover:bg-gray-100 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPrice(item.price)} x {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() =>
                      handleRemoveItem(item.productId, item.variantId)
                    }
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Thông tin đơn hàng
              </h2>

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
                  <span>Tạm tính:</span>
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
                className="w-full mt-6 px-6 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Tiến hành thanh toán
              </button>

              {/* Free shipping notice */}
              {!hasFreeShip && subtotal < 300000 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  Mua thêm {formatPrice(300000 - subtotal)} để dùng mã FREESHIP!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear cart confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
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
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
