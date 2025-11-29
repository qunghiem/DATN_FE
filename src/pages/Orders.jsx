import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  RotateCcw,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  User,
  X,
  CreditCard,
  Box,
  Gift,
  Tag,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import ReviewModal from "../components/ReviewModal";

// Helper function to get orders for current user
const getUserOrders = (userId) => {
  try {
    const ordersKey = `orders_${userId}`;
    const savedOrders = localStorage.getItem(ordersKey);
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error("Error loading user orders:", error);
    return [];
  }
};

// Helper function to save orders for current user
const saveUserOrders = (userId, orders) => {
  try {
    const ordersKey = `orders_${userId}`;
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving user orders:", error);
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // State declarations
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewedItems, setReviewedItems] = useState(new Set());

  // Order statuses
  const orderStatuses = [
    { id: "ALL", name: "Tất cả", icon: Package, color: "gray" },
    { id: "PENDING", name: "Chờ xác nhận", icon: Clock, color: "yellow" },
    { id: "CONFIRMED", name: "Đã xác nhận", icon: CheckCircle, color: "blue" },
    { id: "SHIPPED", name: "Đang giao", icon: Truck, color: "purple" },
    { id: "DELIVERED", name: "Đã giao", icon: CheckCircle, color: "green" },
    { id: "CANCELLED", name: "Đã hủy", icon: XCircle, color: "red" },
  ];

  // Helper functions
  const getUserId = () => {
    return user?.id || user?.email || "guest";
  };

  const enrichOrderItems = async (orders) => {
    console.log("🔄 Enriching order items with productId and images...");
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const enrichedItems = await Promise.all(
          order.items.map(async (item) => {
            if (
              item.productId &&
              item.image &&
              !item.image.includes("placeholder")
            ) {
              return item;
            }
            try {
              const response = await axios.get(
                `http://localhost:8080/api/product-variants/${item.variantId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "access_token"
                    )}`,
                  },
                }
              );
              if (response.data.code === 1000) {
                const variant = response.data.result;
                return {
                  ...item,
                  productId: variant.productId,
                  image: variant.imageUrl || variant.image || item.image,
                };
              }
            } catch (error) {
              console.warn(
                `⚠️ Could not fetch variant ${item.variantId}:`,
                error.message
              );
            }
            return item;
          })
        );
        return { ...order, items: enrichedItems };
      })
    );
    console.log("✅ Order items enriched");

    return enrichedOrders;

  };

  const getTrackingTimeline = (order) => {
    const timeline = [];
    const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (order.status === "CANCELLED") {
      return [
        {
          status: "PENDING",
          time: order.orderDate || order.createdAt,
          description: "Đơn hàng đã được đặt",
          completed: true,
        },
        {
          status: "CANCELLED",
          time: order.updatedAt || order.orderDate || order.createdAt,
          description: order.cancelReason
            ? `Đơn hàng đã bị hủy. Lý do: ${order.cancelReason}`
            : "Đơn hàng đã bị hủy",
          completed: true,
        },
      ];
    }

    const currentStatusIndex = statuses.indexOf(order.status);
    statuses.forEach((status, index) => {
      const statusLabels = {
        PENDING: "Đơn hàng đã được đặt",
        CONFIRMED: "Đơn hàng đã được xác nhận",
        SHIPPED: "Đơn hàng đang được giao",
        DELIVERED: "Đơn hàng đã được giao thành công",
      };
      timeline.push({
        status: status,
        time:
          index <= currentStatusIndex
            ? order.orderDate || order.createdAt
            : null,
        description: statusLabels[status],
        completed: index <= currentStatusIndex,
      });
    });
    return timeline;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusInfo = (status) => {
    return orderStatuses.find((s) => s.id === status) || orderStatuses[0];
  };

  const getStatusColorClass = (status) => {
    const colors = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      green: "bg-green-100 text-green-800 border-green-200",
      red: "bg-red-100 text-red-800 border-red-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    const statusInfo = getStatusInfo(status);
    return colors[statusInfo.color] || colors.gray;
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn!");
      return;
    }
    try {
      const userId = getUserId();
      const cancelTime = new Date().toISOString();
      const updatedOrders = orders.map((order) => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: "CANCELLED",
            tracking: [
              ...(order.tracking || []),
              {
                status: "CANCELLED",
                time: cancelTime,
                description: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`,
              },
            ],
          };
        }
        return order;
      });
      setOrders(updatedOrders);
      saveUserOrders(userId, updatedOrders);
      toast.success("Đã hủy đơn hàng thành công!");
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Không thể hủy đơn hàng. Vui lòng thử lại!");
    }
  };

  const handleReorder = (order) => {
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    navigate("/cart");
  };

  const checkReviewedItems = async () => {
    try {
      const reviewed = localStorage.getItem("reviewed_items");
      if (reviewed) {
        setReviewedItems(new Set(JSON.parse(reviewed)));
      }
    } catch (error) {
      console.error("Error loading reviewed items:", error);
    }
  };

  const handleOpenReview = (order, item) => {
    setSelectedOrder(order);
    setSelectedReviewItem(item);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    const key = `${selectedOrder.id}_${selectedReviewItem.variantId}`;
    const newReviewed = new Set(reviewedItems);
    newReviewed.add(key);
    setReviewedItems(newReviewed);
    localStorage.setItem("reviewed_items", JSON.stringify([...newReviewed]));
  };

  const isItemReviewed = (orderId, variantId) => {
    const key = `${orderId}_${variantId}`;
    return reviewedItems.has(key);
  };

  // useEffect #1: Load reviewed items khi component mount
  useEffect(() => {
    checkReviewedItems();
  }, []);

  // useEffect #2: Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const userId = getUserId();

        try {
          const response = await axios.get(
            "http://localhost:8080/api/orders/me",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );

          if (response.data.code === 1000 && response.data.result) {
            const ordersData = response.data.result;

            const transformedOrders = ordersData.map((order) => ({
              id: order.id,
              orderDate: order.createdAt,
              status: order.status,
              items: order.items.map((item) => ({
                id: item.id,
                productId: null,
                variantId: item.productVariantId,
                name: item.productName,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                image: item.imageUrl, 
                price: item.unitPrice,
              })),
              shipping: {
                fullName: order.fullName,
                phone: order.phone,
                email: user.email,
                address: order.address,
              },
              payment: {
                method: order.paymentMethod,
                subtotal: order.subtotal,
                shippingFee: order.shippingFee,
                discount: order.discountAmount,
                total: order.totalAmount,
                status:
                  order.payment?.status ||
                  (order.paymentMethod === "COD" ? "UNPAID" : "PENDING"),
              },
              vouchers: order.vouchers || [],
              note: order.note || "",
              tracking: order.tracking || [],
              cancelReason: order.cancelReason || "",
            }));

            const enrichedOrders = await enrichOrderItems(transformedOrders);
            setOrders(enrichedOrders);
            setFilteredOrders(enrichedOrders);
            saveUserOrders(userId, enrichedOrders);

            if (enrichedOrders.length > 0) {
              toast.success(`Đã tải ${enrichedOrders.length} đơn hàng`);
            }
            return;
          }
        } catch (apiError) {
          console.error(
            "❌ API error:",
            apiError.response?.status,
            apiError.message
          );
          if (apiError.response?.status === 401) {
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            navigate("/login");
            return;
          }
        }

        const localOrders = getUserOrders(userId);
        setOrders(localOrders);
        setFilteredOrders(localOrders);
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
        toast.error("Không thể tải danh sách đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  // useEffect #3: Filter orders
  useEffect(() => {
    let filtered = [...orders];
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(query) ||
          (order.items &&
            order.items.length > 0 &&
            order.items.some((item) =>
              item.name?.toLowerCase().includes(query)
            ))
      );
    }
    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5] mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b">
            {orderStatuses.map((status) => {
              const Icon = status.icon;
              const count = orders.filter(
                (order) => status.id === "ALL" || order.status === status.id
              ).length;

              return (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition whitespace-nowrap ${
                    selectedStatus === status.id
                      ? "border-[#3A6FB5] text-[#3A6FB5]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{status.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedStatus === status.id
                        ? "bg-[#3A6FB5] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "Không tìm thấy đơn hàng phù hợp"
                : selectedStatus === "ALL"
                ? "Bạn chưa có đơn hàng nào"
                : `Bạn không có đơn hàng nào ở trạng thái này`}
            </p>
            <button
              onClick={() => navigate("/collection")}
              className="px-6 py-2 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">
                              {order.id}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(
                                order.status
                              )}`}
                            >
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusInfo.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Đặt ngày: {formatDate(order.orderDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="flex items-center gap-2 px-4 py-2 text-[#3A6FB5] border border-[#3A6FB5] rounded-lg hover:bg-[#3A6FB5] hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>

                        {order.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy đơn
                          </button>
                        )}

                        {order.status === "DELIVERED" && (
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Mua lại
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div
                            key={`${order.id}-${item.productId}-${
                              item.variantId || index
                            }`}
                            className="flex gap-4 pb-3 border-b border-gray-100 last:border-0"
                          >
                            <div
                              className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden cursor-pointer"
                              onClick={() =>
                                navigate(`/product/${item.productId}`)
                              }
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4
                                className="font-medium text-gray-900 mb-1 hover:text-[#3A6FB5] cursor-pointer"
                                onClick={() =>
                                  navigate(`/product/${item.productId}`)
                                }
                              >
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {item.color} / {item.size}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-600">
                                  x{item.quantity}
                                </span>
                                <span className="font-bold text-gray-900">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>

                              {order.status === "DELIVERED" && (
                                <div className="mt-2">
                                  {isItemReviewed(order.id, item.variantId) ? (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Đã đánh giá
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleOpenReview(order, item)
                                      }
                                      className="text-xs text-[#3A6FB5] hover:text-[#2E5C99] font-medium flex items-center gap-1"
                                    >
                                      <MessageCircle className="w-3 h-3" />
                                      Đánh giá sản phẩm
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          Không có sản phẩm
                        </p>
                      )}
                    </div>

                    {/* Vouchers Display - CHỖ NÀY THÊM MỚI */}
                    {order.vouchers && order.vouchers.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            Mã giảm giá đã áp dụng
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {order.vouchers.map((voucher, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                                voucher.voucherType === "PRODUCT"
                                  ? "bg-green-50 border-green-200"
                                  : "bg-purple-50 border-purple-200"
                              }`}
                            >
                              {voucher.voucherType === "PRODUCT" ? (
                                <Tag className="w-3 h-3 text-green-600" />
                              ) : (
                                <Truck className="w-3 h-3 text-purple-600" />
                              )}
                              <span
                                className={`text-xs font-medium ${
                                  voucher.voucherType === "PRODUCT"
                                    ? "text-green-800"
                                    : "text-purple-800"
                                }`}
                              >
                                {voucher.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="mr-4">
                            {order.items?.length || 0} sản phẩm
                          </span>
                          {order.payment?.method === "COD" ? (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              Thanh toán khi nhận hàng
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Đã thanh toán
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            Tổng tiền:
                          </p>
                          <p className="text-xl font-bold text-red-600">
                            {formatPrice(order.payment?.total || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {order.status === "SHIPPING" && order.estimatedDelivery && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Dự kiến giao hàng:{" "}
                          <span className="font-medium">
                            {new Date(
                              order.estimatedDelivery
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết đơn hàng
                </h2>
                <p className="text-gray-600 mt-1">Mã đơn: {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Order Status */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Trạng thái đơn hàng
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedOrder.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <>
                          <div
                            className={`p-3 rounded-full ${getStatusColorClass(
                              selectedOrder.status
                            )}`}
                          >
                            <StatusIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {statusInfo.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Cập nhật: {formatDate(selectedOrder.orderDate)}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Tracking Timeline */}
                  {(() => {
                    const timeline = getTrackingTimeline(selectedOrder);
                    return (
                      timeline.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {timeline.map((track, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    track.completed
                                      ? "bg-green-100 text-green-600"
                                      : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {track.completed ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <Clock className="w-5 h-5" />
                                  )}
                                </div>
                                {index < timeline.length - 1 && (
                                  <div
                                    className={`w-0.5 h-12 ${
                                      track.completed
                                        ? "bg-green-200"
                                        : "bg-gray-200"
                                    }`}
                                  ></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p
                                  className={`font-medium ${
                                    track.completed
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {track.description}
                                </p>
                                {track.time && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {formatDate(track.time)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>

              {/* Shipping Information */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Thông tin giao hàng
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Người nhận</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shipping?.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shipping?.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shipping?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Địa chỉ</p>
                      <p className="font-medium text-gray-900">
                        {selectedOrder.shipping?.address}
                      </p>
                    </div>
                  </div>
                  {selectedOrder.note && (
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Ghi chú</p>
                        <p className="font-medium text-gray-900">
                          {selectedOrder.note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <Box className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Sản phẩm ({selectedOrder.items?.length || 0})
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-3 border-b border-gray-200 last:border-0"
                      >
                        <div className="w-20 h-20 flex-shrink-0 bg-white rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.color} / {item.size}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">
                              x{item.quantity}
                            </span>
                            <span className="font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Không có sản phẩm
                    </p>
                  )}
                </div>
              </div>

              {/* Applied Vouchers - THÊM MỚI CHO MODAL */}
              {selectedOrder.vouchers && selectedOrder.vouchers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Gift className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                    Mã giảm giá đã áp dụng
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedOrder.vouchers.map((voucher, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            voucher.voucherType === "PRODUCT"
                              ? "bg-green-50 border-green-200"
                              : "bg-purple-50 border-purple-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {voucher.voucherType === "PRODUCT" ? (
                              <Tag className="w-4 h-4 text-green-600" />
                            ) : (
                              <Truck className="w-4 h-4 text-purple-600" />
                            )}
                            <div>
                              <p
                                className={`font-medium text-sm ${
                                  voucher.voucherType === "PRODUCT"
                                    ? "text-green-800"
                                    : "text-purple-800"
                                }`}
                              >
                                {voucher.code}
                              </p>
                              <p
                                className={`text-xs ${
                                  voucher.voucherType === "PRODUCT"
                                    ? "text-green-600"
                                    : "text-purple-600"
                                }`}
                              >
                                {voucher.voucherType === "PRODUCT"
                                  ? "Giảm tiền hàng"
                                  : "Giảm phí ship"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Thanh toán
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-medium">
                      {formatPrice(selectedOrder.payment?.subtotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">
                      {selectedOrder.payment?.shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(selectedOrder.payment?.shippingFee || 0)
                      )}
                    </span>
                  </div>
                  {selectedOrder.payment?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-medium">
                        -{formatPrice(selectedOrder.payment?.discount)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(selectedOrder.payment?.total || 0)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        selectedOrder.payment?.method === "COD"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedOrder.payment?.method === "COD"
                        ? "Thanh toán khi nhận hàng"
                        : "Chuyển khoản ngân hàng"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Đóng
              </button>
              {selectedOrder.status === "PENDING" && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleCancelOrder(selectedOrder);
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Hủy đơn hàng
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mã đơn: {selectedOrder.id}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy đơn <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                  placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Không, giữ đơn hàng
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrder && selectedReviewItem && (
        <ReviewModal
          order={selectedOrder}
          item={selectedReviewItem}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedReviewItem(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default Orders;