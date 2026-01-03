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
  Truck,
  Package,
  Award,
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

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const selectedItems = useSelector(selectSelectedItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { error, isLoading } = useSelector((state) => state.cart);
  const { isAuthenticated, user, accessToken } = useSelector(
    (state) => state.auth
  );

  // Voucher state
  const activeVouchers = useSelector(selectActiveVouchers);
  const validationError = useSelector(selectValidationError);

  // State cho voucher
  const [productVoucher, setProductVoucher] = useState(null);
  const [shippingVoucher, setShippingVoucher] = useState(null);
  const [productDiscount, setProductDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  // State cho reward points
  const [userRewardPoints, setUserRewardPoints] = useState(0);
  const [isUsingPoints, setIsUsingPoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  const [itemToRemove, setItemToRemove] = useState(null);
  const [productVoucherCode, setProductVoucherCode] = useState("");
  const [shippingVoucherCode, setShippingVoucherCode] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRemoveSelectedConfirm, setShowRemoveSelectedConfirm] =
    useState(false);
  const [showProductVoucherList, setShowProductVoucherList] = useState(false);
  const [showShippingVoucherList, setShowShippingVoucherList] = useState(false);

  const [variantDetails, setVariantDetails] = useState({});

  // Fetch user profile to get reward points
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated) {
        try {
          // Ưu tiên lấy từ Redux state, sau đó mới tìm trong localStorage
          let token =
            accessToken ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            sessionStorage.getItem("access_token") ||
            sessionStorage.getItem("accessToken") ||
            sessionStorage.getItem("token");

          console.log("Token found:", token ? "Yes" : "No");
          console.log("Token source:", accessToken ? "Redux" : "Storage");

          if (!token) {
            console.error("No access token found!");
            toast.error("Vui lòng đăng nhập lại");
            return;
          }

          const response = await axios.get(
            `${VITE_API_URL}/api/users/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("Full API Response:", response.data);
          console.log("Result object:", response.data.result);
          console.log("Reward Points:", response.data.result?.rewardPoints);

          // Thử cả 2 cách check code
          if (response.data.code === 1000 || response.data.code === "1000") {
            const points = response.data.result?.rewardPoints || 0;
            console.log("Setting reward points to:", points);
            setUserRewardPoints(points);
          } else {
            console.warn("Unexpected response code:", response.data.code);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          console.error("Error response:", error.response?.data);
          if (error.response?.status === 403) {
            toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
          }
        }
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, accessToken]);

  // Fetch variant details
  useEffect(() => {
    const fetchMissingProductIds = async () => {
      const itemsNeedingFetch = cartItems.filter(
        (item) => !item.productId && item.variantId
      );

      if (itemsNeedingFetch.length === 0) return;

      try {
        const fetchPromises = itemsNeedingFetch.map(async (item) => {
          if (variantDetails[item.variantId]) {
            return null;
          }

          try {
            const response = await axios.get(
              `${VITE_API_URL}/api/product-variants/${item.variantId}`
            );

            if (response.data.code === 1000) {
              return {
                variantId: item.productVariantId,
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
          setVariantDetails((prev) => ({ ...prev, ...newVariantDetails }));
        }
      } catch (error) {
        console.error("Error fetching variant details:", error);
      }
    };

    if (cartItems.length > 0) {
      fetchMissingProductIds();
    }
  }, [cartItems]);

  const getProductId = (item) => {
    if (item.productId) return item.productId;
    if (item.variantId && variantDetails[item.variantId]) {
      return variantDetails[item.variantId];
    }
    return null;
  };

  // Fetch cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchActiveVouchers());
    }
  }, [dispatch, isAuthenticated]);

  // Tính toán discount khi voucher hoặc subtotal thay đổi
  useEffect(() => {
    if (productVoucher && subtotal > 0) {
      const discount = calculateDiscountAmount(productVoucher, subtotal);
      setProductDiscount(discount);
    } else {
      setProductDiscount(0);
    }
  }, [subtotal, productVoucher]);

  useEffect(() => {
    if (shippingVoucher) {
      const discount = calculateDiscountAmount(shippingVoucher, shippingFee);
      setShippingDiscount(discount);
    } else {
      setShippingDiscount(0);
    }
  }, [shippingVoucher]);

  // Tính toán points discount khi toggle hoặc giá trị đơn hàng thay đổi
  useEffect(() => {
    if (isUsingPoints && userRewardPoints > 0) {
      // Tính giá trị sau khi trừ voucher sản phẩm
      const afterVoucherDiscount = subtotal - productDiscount;
      // Sử dụng tối đa điểm có thể: min(điểm hiện có, giá trị đơn hàng)
      const maxPointsCanUse = Math.min(userRewardPoints, afterVoucherDiscount);
      setPointsToUse(maxPointsCanUse);
      setPointsDiscount(maxPointsCanUse);
    } else {
      setPointsToUse(0);
      setPointsDiscount(0);
    }
  }, [isUsingPoints, userRewardPoints, subtotal, productDiscount]);

  // Helper function để tính discount
  const calculateDiscountAmount = (voucher, amount) => {
    if (!voucher) return 0;

    switch (voucher.discountType) {
      case "PERCENTAGE":
        const percentDiscount = (amount * voucher.discountValue) / 100;
        return voucher.maxDiscountValue
          ? Math.min(percentDiscount, voucher.maxDiscountValue)
          : percentDiscount;
      case "FIXED_AMOUNT":
        return Math.min(voucher.discountValue, amount);
      case "FREESHIP":
        return Math.min(voucher.discountValue, amount);
      default:
        return 0;
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để xem giỏ hàng");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const isItemSelected = (itemId) => {
    return selectedItems.includes(itemId);
  };

  const isAllSelected = () => {
    return cartItems.length > 0 && selectedItems.length === cartItems.length;
  };

  const handleToggleSelect = (itemId) => {
    dispatch(toggleSelectItem(itemId));
  };

  const handleSelectAll = () => {
    if (isAllSelected()) {
      dispatch(deselectAllItems());
    } else {
      dispatch(selectAllItems());
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    const item = cartItems.find((item) => item.id === cartItemId);

    if (item && newQuantity > item.stock) {
      toast.warning(`Chỉ còn ${item.stock} sản phẩm trong kho!`);
      return;
    }

    try {
      await dispatch(
        updateCartItemAPI({ cartItemId, quantity: newQuantity })
      ).unwrap();
      toast.success("Đã cập nhật số lượng!");
    } catch (error) {
      toast.error(error || "Không thể cập nhật số lượng");
    }
  };

  const handleRemoveItem = (cartItemId) => {
    setItemToRemove(cartItemId);
  };

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

  const handleClearCart = async () => {
    try {
      await dispatch(clearCartAPI()).unwrap();
      setShowClearConfirm(false);
      toast.success("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      toast.error(error || "Không thể xóa giỏ hàng");
    }
  };

  // Apply product voucher
  const handleApplyProductVoucher = async () => {
    if (!productVoucherCode.trim()) {
      toast.info("Vui lòng nhập mã giảm giá!");
      return;
    }

    if (subtotal === 0 || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng voucher!");
      return;
    }

    try {
      const response = await axios.get(
        `${VITE_API_URL}/api/vouchers/validate/${productVoucherCode.toUpperCase()}`
      );

      if (response.data.code === 0) {
        const voucher = response.data.result;

        if (voucher.discountType === "FREESHIP") {
          toast.error(
            "Đây là mã giảm ship, vui lòng nhập vào ô phí vận chuyển!"
          );
          return;
        }

        if (subtotal < voucher.minOrderValue) {
          toast.error(
            `Đơn hàng tối thiểu ${formatPrice(
              voucher.minOrderValue
            )} để sử dụng mã này!`
          );
          return;
        }

        setProductVoucher(voucher);
        setProductVoucherCode("");
        setShowProductVoucherList(false);
        toast.success("Đã áp dụng mã giảm giá sản phẩm!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã giảm giá không hợp lệ!");
    }
  };

  // Apply shipping voucher
  const handleApplyShippingVoucher = async () => {
    if (!shippingVoucherCode.trim()) {
      toast.info("Vui lòng nhập mã giảm ship!");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng voucher!");
      return;
    }

    try {
      const response = await axios.get(
        `${VITE_API_URL}/api/vouchers/validate/${shippingVoucherCode.toUpperCase()}`
      );

      if (response.data.code === 0) {
        const voucher = response.data.result;

        if (voucher.discountType !== "FREESHIP") {
          toast.error("Mã này không phải là mã giảm ship!");
          return;
        }

        if (subtotal < voucher.minOrderValue) {
          toast.error(
            `Đơn hàng tối thiểu ${formatPrice(
              voucher.minOrderValue
            )} để sử dụng mã này!`
          );
          return;
        }

        setShippingVoucher(voucher);
        setShippingVoucherCode("");
        setShowShippingVoucherList(false);
        toast.success("Đã áp dụng mã giảm ship!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Mã giảm ship không hợp lệ!"
      );
    }
  };

  // Handle reward points toggle
  const handleTogglePoints = () => {
    if (!isUsingPoints && userRewardPoints === 0) {
      toast.info("Bạn chưa có điểm tích lũy!");
      return;
    }

    if (!isUsingPoints && selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước!");
      return;
    }

    setIsUsingPoints(!isUsingPoints);

    if (!isUsingPoints) {
      const afterVoucherDiscount = subtotal - productDiscount;
      const maxPointsCanUse = Math.min(userRewardPoints, afterVoucherDiscount);

      if (maxPointsCanUse > 0) {
        toast.success(`Đang sử dụng ${maxPointsCanUse.toLocaleString()} điểm!`);
      } else {
        toast.info("Giá trị đơn hàng chưa đủ để sử dụng điểm!");
        setIsUsingPoints(false);
      }
    } else {
      toast.info("Đã tắt sử dụng điểm tích lũy!");
    }
  };

  // Select voucher from list
  const handleSelectProductVoucher = async (voucher) => {
    if (subtotal === 0 || selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng voucher!");
      return;
    }

    if (voucher.discountType === "FREESHIP") {
      toast.error("Đây là mã giảm ship!");
      return;
    }

    if (subtotal < voucher.minOrderValue) {
      toast.error(
        `Đơn hàng tối thiểu ${formatPrice(
          voucher.minOrderValue
        )} để sử dụng mã này!`
      );
      return;
    }

    setProductVoucher(voucher);
    setShowProductVoucherList(false);
    toast.success("Đã áp dụng mã giảm giá sản phẩm!");
  };

  const handleSelectShippingVoucher = async (voucher) => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm trước khi áp dụng voucher!");
      return;
    }

    if (voucher.discountType !== "FREESHIP") {
      toast.error("Mã này không phải là mã giảm ship!");
      return;
    }

    if (subtotal < voucher.minOrderValue) {
      toast.error(
        `Đơn hàng tối thiểu ${formatPrice(
          voucher.minOrderValue
        )} để sử dụng mã này!`
      );
      return;
    }

    setShippingVoucher(voucher);
    setShowShippingVoucherList(false);
    toast.success("Đã áp dụng mã giảm ship!");
  };

  const handleRemoveProductVoucher = () => {
    setProductVoucher(null);
    setProductDiscount(0);
    toast.info("Đã gỡ mã giảm giá sản phẩm!");
  };

  const handleRemoveShippingVoucher = () => {
    setShippingVoucher(null);
    setShippingDiscount(0);
    toast.info("Đã gỡ mã giảm ship!");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.info("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn sản phẩm cần thanh toán!");
      return;
    }

    const selectedCartItems = cartItems
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({
        ...item,
        productId: getProductId(item) || item.productId,
        name: item.productName,
        color: item.colorName,
        size: item.sizeName,
        image: item.imageUrl,
        price: item.discountPrice,
        quantity: item.quantity,
        variantId: item.productVariantId,
      }));

    navigate("/place-order", {
      state: {
        selectedCartItems,
        productVoucher,
        shippingVoucher,
        productDiscount,
        shippingDiscount,
        pointsToUse,
        pointsDiscount,
      },
    });
  };

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
        return `Miễn phí vận chuyển tối đa ${formatPrice(
          voucher.discountValue
        )}`;
      default:
        return "";
    }
  };

  // Lọc voucher theo loại
  const productVouchers = activeVouchers.filter(
  (v) => v.discountType !== "FREESHIP" && v.remainingUses > 0
);
const shippingVouchers = activeVouchers.filter(
  (v) => v.discountType === "FREESHIP" && v.remainingUses > 0
);

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
  const finalShipping = shippingFee - shippingDiscount;
  const finalTotal =
    subtotal - productDiscount - pointsDiscount + finalShipping;
  const totalSavings = productDiscount + shippingDiscount + pointsDiscount;

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
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
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isItemSelected(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-5 h-5 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
                      />
                    </div>

                    <div
                      className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() =>
                        productId && navigate(`/product/${productId}`)
                      }
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3
                        className="font-medium text-gray-900 mb-1 hover:text-[#3A6FB5] cursor-pointer line-clamp-2"
                        onClick={() =>
                          productId && navigate(`/product/${productId}`)
                        }
                      >
                        {item.productName}
                      </h3>

                      <div className="text-sm text-gray-600 mb-2">
                        <span>Màu: {item.colorName}</span>
                        <span className="mx-2">|</span>
                        <span>Size: {item.sizeName}</span>
                      </div>

                      <div className="flex items-center justify-between">
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
                          {/* <span className="px-4 py-1 font-medium min-w-[40px] text-center">
                            {item.quantity}
                          </span> */}
                          <input
                            key={`quantity-${item.id}-${item.quantity}`} // Thêm key này
                            type="number"
                            defaultValue={item.quantity}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              if (value !== item.quantity) {
                                handleQuantityChange(
                                  item.id,
                                  Math.max(1, value)
                                );
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.target.blur();
                              }
                            }}
                            className="w-12 px-2 py-1 text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                            disabled={isLoading}
                          />
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

              {/* Product Voucher Section */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4" />
                  Mã giảm giá sản phẩm
                </label>

                {!productVoucher ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={productVoucherCode}
                        onChange={(e) =>
                          setProductVoucherCode(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none text-sm"
                      />
                      <button
                        onClick={handleApplyProductVoucher}
                        disabled={
                          !productVoucherCode.trim() ||
                          selectedItems.length === 0
                        }
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {productVouchers.length > 0 && (
                      <button
                        onClick={() =>
                          setShowProductVoucherList(!showProductVoucherList)
                        }
                        className="mt-2 text-sm text-[#3A6FB5] hover:text-[#2E5C99] flex items-center gap-1"
                      >
                        <Gift className="w-4 h-4" />
                        Xem {productVouchers.length} mã giảm giá khả dụng
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 text-sm">
                          {productVoucher.code}
                        </p>
                        <p className="text-xs text-green-600">
                          {getVoucherDescription(productVoucher)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveProductVoucher}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {showProductVoucherList && (
                  <div className="mt-3 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {productVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectProductVoucher(voucher)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-sm">
                                {voucher.code}
                              </span>
                              {getVoucherTypeBadge(voucher.discountType)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {voucher.description ||
                                getVoucherDescription(voucher)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Đơn tối thiểu:{" "}
                              {formatPrice(voucher.minOrderValue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Còn lại: {voucher.remainingUses}/
                              {voucher.usageLimit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping Voucher Section */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4" />
                  Mã giảm phí vận chuyển
                </label>

                {!shippingVoucher ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shippingVoucherCode}
                        onChange={(e) =>
                          setShippingVoucherCode(e.target.value.toUpperCase())
                        }
                        placeholder="Nhập mã giảm ship"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none text-sm"
                      />
                      <button
                        onClick={handleApplyShippingVoucher}
                        disabled={
                          !shippingVoucherCode.trim() ||
                          selectedItems.length === 0
                        }
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                      >
                        Áp dụng
                      </button>
                    </div>

                    {shippingVouchers.length > 0 && (
                      <button
                        onClick={() =>
                          setShowShippingVoucherList(!showShippingVoucherList)
                        }
                        className="mt-2 text-sm text-[#3A6FB5] hover:text-[#2E5C99] flex items-center gap-1"
                      >
                        <Gift className="w-4 h-4" />
                        Xem {shippingVouchers.length} mã freeship khả dụng
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-800 text-sm">
                          {shippingVoucher.code}
                        </p>
                        <p className="text-xs text-purple-600">
                          {getVoucherDescription(shippingVoucher)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveShippingVoucher}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {showShippingVoucherList && (
                  <div className="mt-3 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {shippingVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectShippingVoucher(voucher)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 text-sm">
                                {voucher.code}
                              </span>
                              {getVoucherTypeBadge(voucher.discountType)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {voucher.description ||
                                getVoucherDescription(voucher)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Đơn tối thiểu:{" "}
                              {formatPrice(voucher.minOrderValue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Còn lại: {voucher.remainingUses}/
                              {voucher.usageLimit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reward Points Section */}
              <div className="mb-4">
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Điểm tích lũy
                  </span>
                  <span className="text-xs text-blue-600 font-normal">
                    {userRewardPoints.toLocaleString()} điểm
                  </span>
                </label>

                <div
                  onClick={handleTogglePoints}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isUsingPoints
                      ? "bg-blue-50 border-blue-500"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  } ${
                    selectedItems.length === 0 || userRewardPoints === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isUsingPoints ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isUsingPoints ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isUsingPoints ? "text-blue-700" : "text-gray-700"
                        }`}
                      >
                        {isUsingPoints
                          ? "Đang sử dụng điểm"
                          : "Sử dụng điểm tích lũy"}
                      </p>
                      {isUsingPoints && pointsToUse > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          {pointsToUse.toLocaleString()} điểm = -
                          {formatPrice(pointsDiscount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isUsingPoints && (
                    <span className="text-xs text-gray-500">Nhấn để bật</span>
                  )}
                </div>

                {!isUsingPoints && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Bật để tự động dùng tối đa điểm có thể
                  </p>
                )}

                {isUsingPoints && userRewardPoints > pointsToUse && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Chỉ dùng được {pointsToUse.toLocaleString()}/
                    {userRewardPoints.toLocaleString()} điểm (giới hạn bởi giá
                    trị đơn hàng)
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Giảm giá sản phẩm
                      {productVoucher && ` (${productVoucher.code})`}:
                    </span>
                    <span className="font-medium">
                      -{formatPrice(productDiscount)}
                    </span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Giảm giá điểm tích lũy:</span>
                    <span className="font-medium">
                      -{formatPrice(pointsDiscount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <div className="text-right">
                    {shippingDiscount > 0 ? (
                      <>
                        <div className="text-gray-400 line-through text-sm">
                          {formatPrice(shippingFee)}
                        </div>
                        <div className="font-medium">
                          {formatPrice(finalShipping)}
                        </div>
                      </>
                    ) : (
                      <span className="font-medium">
                        {formatPrice(shippingFee)}
                      </span>
                    )}
                  </div>
                </div>

                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>
                      Giảm phí ship
                      {shippingVoucher && ` (${shippingVoucher.code})`}:
                    </span>
                    <span className="font-medium">
                      -{formatPrice(shippingDiscount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="text-sm text-green-600 text-center">
                    🎉 Bạn đã tiết kiệm được {formatPrice(totalSavings)}!
                  </div>
                )}
              </div>

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
