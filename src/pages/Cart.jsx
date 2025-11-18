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
  Gift,
} from "lucide-react";
import {
  fetchCart,
  updateCartItemAPI,
  removeFromCartAPI,
  clearCartAPI,
  selectCartItems,
  selectSelectedItems,
  selectCartSubtotal,
  toggleSelectItem,
  selectAllItems,
  deselectAllItems,
  clearError,
} from "../features/cart/cartSlice";
import {
  fetchActiveVouchers,
  validateVoucher,
  removeAppliedVoucher,
  updateDiscountAmount,
  selectActiveVouchers,
  selectAppliedVoucher,
  selectDiscountAmount,
  selectValidationError,
  clearValidationError,
  calculateDiscount,
} from "../features/vouchers/voucherSlice";
import { toast } from "react-toastify";
import axios from "axios";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const selectedItems = useSelector(selectSelectedItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { error, isLoading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Voucher state from Redux
  const activeVouchers = useSelector(selectActiveVouchers);
  const appliedVoucher = useSelector(selectAppliedVoucher);
  const discountAmount = useSelector(selectDiscountAmount);
  const validationError = useSelector(selectValidationError);

  const [itemToRemove, setItemToRemove] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveSelectedConfirm, setShowRemoveSelectedConfirm] = useState(false);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // State để lưu thông tin variant đã fetch
  const [variantDetails, setVariantDetails] = useState({});

  // Fetch variant details nếu thiếu productId
  useEffect(() => {
    const fetchMissingProductIds = async () => {
      const itemsNeedingFetch = cartItems.filter(
        item => !item.productId && item.variantId
      );

      if (itemsNeedingFetch.length === 0) return;

      try {
        const fetchPromises = itemsNeedingFetch.map(async (item) => {
          if (variantDetails[item.variantId]) {
            return null; // Already fetched
          }

          try {
            const response = await axios.get(
              `http://localhost:8080/api/product-variants/${item.variantId}`
            );
            
            if (response.data.code === 1000) {
              return {
                variantId: item.variantId,
                productId: response.data.result.productId,
              };
            }
          } catch (err) {
            console.error(`Error fetching variant ${item.variantId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(fetchPromises);
        const newVariantDetails = {};
        
        results.forEach((result) => {
          if (result) {
            newVariantDetails[result.variantId] = result.productId;
          }
        });

        if (Object.keys(newVariantDetails).length > 0) {
          setVariantDetails(prev => ({ ...prev, ...newVariantDetails }));
        }
      } catch (error) {
        console.error("Error fetching variant details:", error);
      }
    };

    if (cartItems.length > 0) {
      fetchMissingProductIds();
    }
  }, [cartItems]);

  // Helper function to get productId for an item
  const getProductId = (item) => {
    // Try item.productId first
    if (item.productId) return item.productId;
    
    // Try variantDetails cache
    if (item.variantId && variantDetails[item.variantId]) {
      return variantDetails[item.variantId];
    }
    
    // Fallback
    return null;
  };

  // Fetch cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchActiveVouchers());
    }
  }, [dispatch, isAuthenticated]);

  // Update discount amount when subtotal changes
  useEffect(() => {
    if (appliedVoucher && subtotal > 0) {
      const newDiscount = calculateDiscount(appliedVoucher, subtotal);
      dispatch(updateDiscountAmount(subtotal));
    }
  }, [subtotal, appliedVoucher, dispatch]);

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
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.info("Vui lòng nhập mã giảm giá!");
      return;
    }

    if (subtotal === 0 || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng voucher!");
      return;
    }

    try {
      await dispatch(
        validateVoucher({
          code: voucherCode.toUpperCase(),
          orderValue: subtotal,
        })
      ).unwrap();

      toast.success("Đã áp dụng mã giảm giá!");
      setVoucherCode("");
      setShowVoucherList(false);
    } catch (error) {
      toast.error(error);
    }
  };

  // Handle select voucher from list
  const handleSelectVoucher = async (voucher) => {
    if (subtotal === 0 || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng voucher!");
      return;
    }

    try {
      await dispatch(
        validateVoucher({
          code: voucher.code,
          orderValue: subtotal,
        })
      ).unwrap();

      toast.success("Đã áp dụng mã giảm giá!");
      setShowVoucherList(false);
    } catch (error) {
      toast.error(error);
    }
  };

  // Handle remove voucher
  const handleRemoveVoucher = () => {
    dispatch(removeAppliedVoucher());
    toast.info("Đã gỡ mã giảm giá!");
  };

  // Handle checkout
  const handleCheckout = () => {
    console.log('=== CHECKOUT DEBUG ===');
    console.log('Cart items:', cartItems);
    console.log('Selected items (IDs):', selectedItems);
    console.log('Selected items length:', selectedItems.length);
    console.log('Variant details cache:', variantDetails);
    
    // Enrich cart items with productId
    const enrichedItems = cartItems.map(item => ({
      ...item,
      productId: getProductId(item) || item.productId
    }));
    console.log('Enriched items with productId:', enrichedItems);
    
    if (cartItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm cần thanh toán!");
      return;
    }

    // Navigate với state để pass thông tin voucher và enriched items
    navigate("/place-order", {
      state: {
        appliedVoucher,
        discountAmount,
        enrichedItems, // Pass enriched items with productId
      }
    });
  };

  // Get voucher type badge
  const getVoucherTypeBadge = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Giảm %
          </span>
        );
      case "FIXED_AMOUNT":
        return (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            Giảm tiền
          </span>
        );
      case "FREESHIP":
        return (
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
            Freeship
          </span>
        );
      default:
        return null;
    }
  };

  // Get voucher description
  const getVoucherDescription = (voucher) => {
    if (!voucher) return "";

    switch (voucher.discountType) {
      case "PERCENTAGE":
        return `Giảm ${voucher.discountValue}%${
          voucher.maxDiscountValue
            ? ` tối đa ${formatPrice(voucher.maxDiscountValue)}`
            : ""
        }`;
      case "FIXED_AMOUNT":
        return `Giảm ${formatPrice(voucher.discountValue)}`;
      case "FREESHIP":
        return `Miễn phí vận chuyển tối đa ${formatPrice(voucher.discountValue)}`;
      default:
        return "";
    }
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
  const isFreeship = appliedVoucher?.discountType === "FREESHIP";
  const finalShipping = isFreeship ? 0 : shippingFee;
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

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <span className="text-yellow-700 text-sm">{validationError}</span>
            <button
              onClick={() => dispatch(clearValidationError())}
              className="text-yellow-700 hover:text-yellow-800"
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
              const productId = getProductId(item);
              
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
                      onClick={() => productId && navigate(`/product/${productId}`)}
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
                        onClick={() => productId && navigate(`/product/${productId}`)}
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
              );
            })}
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

              {/* Voucher Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>

                {!appliedVoucher ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) =>
                          setVoucherCode(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
                      />
                      <button
                        onClick={handleApplyVoucher}
                        disabled={!voucherCode.trim() || selectedItems.length === 0}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {/* Available vouchers button */}
                    {activeVouchers.length > 0 && (
                      <button
                        onClick={() => setShowVoucherList(!showVoucherList)}
                        className="mt-2 text-sm text-[#3A6FB5] hover:text-[#2E5C99] flex items-center gap-1"
                      >
                        <Gift className="w-4 h-4" />
                        Xem {activeVouchers.length} mã giảm giá khả dụng
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          {appliedVoucher.code}
                        </p>
                        <p className="text-xs text-green-600">
                          {getVoucherDescription(appliedVoucher)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Voucher List Modal */}
                {showVoucherList && (
                  <div className="mt-3 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {activeVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectVoucher(voucher)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">
                                {voucher.code}
                              </span>
                              {getVoucherTypeBadge(voucher.discountType)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {voucher.description ||
                                getVoucherDescription(voucher)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Còn lại: {voucher.remainingUses}/{voucher.usageLimit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    <span>
                      Giảm giá
                      {appliedVoucher && ` (${appliedVoucher.code})`}:
                    </span>
                    <span className="font-medium">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">
                    {isFreeship ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
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
            </div>
          </div>
        </div>
      </div>

      {/* All modals remain the same ... */}
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

      {showRemoveSelectedConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Xóa sản phẩm đã chọn?
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa {selectedItems.length} sản phẩm đã chọn không?
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