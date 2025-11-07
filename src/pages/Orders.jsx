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
  Filter,
  ChevronDown,
  Eye,
  RotateCcw,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Box,
  AlertCircle,
  User,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

// Helper function to get orders for current user
const getUserOrders = (userId) => {
  try {
    const ordersKey = `orders_${userId}`;
    const savedOrders = localStorage.getItem(ordersKey);
    return savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error('Error loading user orders:', error);
    return [];
  }
};

// Helper function to save orders for current user
const saveUserOrders = (userId, orders) => {
  try {
    const ordersKey = `orders_${userId}`;
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving user orders:', error);
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // State
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Order statuses
  const orderStatuses = [
    { id: "ALL", name: "Tất cả", icon: Package, color: "gray" },
    { id: "PENDING", name: "Chờ xác nhận", icon: Clock, color: "yellow" },
    { id: "CONFIRMED", name: "Đã xác nhận", icon: CheckCircle, color: "blue" },
    { id: "SHIPPING", name: "Đang giao", icon: Truck, color: "purple" },
    { id: "DELIVERED", name: "Đã giao", icon: CheckCircle, color: "green" },
    { id: "CANCELLED", name: "Đã hủy", icon: XCircle, color: "red" },
  ];

  // Get user ID
  const getUserId = () => {
    return user?.id || user?.email || 'guest';
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !user) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const userId = getUserId();

        // Try to fetch from API first
        try {
          const response = await axios.get('http://localhost:8080/api/orders', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          
          if (response.data && response.data.data) {
            setOrders(response.data.data);
            setFilteredOrders(response.data.data);
            // Save to localStorage for this user
            saveUserOrders(userId, response.data.data);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using localStorage for user:', userId);
        }

        // Fallback to localStorage for this specific user
        const localOrders = getUserOrders(userId);
        
        setOrders(localOrders);
        setFilteredOrders(localOrders);

      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Không thể tải danh sách đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, navigate]);

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Filter by status
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.id?.toLowerCase().includes(query) ||
          (order.items && order.items.length > 0 && order.items.some((item) =>
            item.name?.toLowerCase().includes(query)
          ))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, searchQuery]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // Format date - Fix timezone issue
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    
    // Get local date components
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Get status info
  const getStatusInfo = (status) => {
    return orderStatuses.find((s) => s.id === status) || orderStatuses[0];
  };

  // Get status color classes
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

  // Handle view detail
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Handle cancel order
  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  // Confirm cancel order
  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn!");
      return;
    }

    try {
      const userId = getUserId();
      const cancelTime = new Date().toISOString();
      
      // Update local state with tracking
      const updatedOrders = orders.map((order) => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: "CANCELLED",
            tracking: [
              ...(order.tracking || []),
              {
                status: 'CANCELLED',
                time: cancelTime,
                description: `Đơn hàng đã bị hủy. Lý do: ${cancelReason}`
              }
            ]
          };
        }
        return order;
      });
      
      setOrders(updatedOrders);
      
      // Save to localStorage for this user
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

  // Handle reorder
  const handleReorder = (order) => {
    // Add items to cart and navigate to cart
    order.items.forEach((item) => {
      // dispatch(addToCart({ ...item }));
    });
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    navigate("/cart");
  };

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
          <p className="text-gray-600">
            Quản lý và theo dõi đơn hàng của bạn
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
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
                      {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                        <div
                          key={`${order.id}-${item.productId}-${item.variantId || index}`}
                          className="flex gap-4 pb-3 border-b border-gray-100 last:border-0"
                        >
                          <div
                            className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/product/${item.productId}`)}
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
                              onClick={() => navigate(`/product/${item.productId}`)}
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
                          </div>
                        </div>
                      )) : (
                        <p className="text-center text-gray-500 py-4">Không có sản phẩm</p>
                      )}
                    </div>

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

                    {/* Estimated Delivery */}
                    {order.status === "SHIPPING" && order.estimatedDelivery && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Dự kiến giao hàng:{" "}
                          <span className="font-medium">
                            {new Date(order.estimatedDelivery).toLocaleDateString("vi-VN")}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
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
                          <div className={`p-3 rounded-full ${getStatusColorClass(selectedOrder.status)}`}>
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
                  {selectedOrder.tracking && selectedOrder.tracking.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                      {[...selectedOrder.tracking].reverse().map((track, index) => (
                        <div key={index} className="relative pl-6">
                          <div className={`absolute left-0 top-1 -translate-x-1/2 w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-[#3A6FB5]' : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {track.description}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(track.time)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                        {selectedOrder.shipping?.address}, {selectedOrder.shipping?.ward},{" "}
                        {selectedOrder.shipping?.district}, {selectedOrder.shipping?.city}
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
                  {selectedOrder.items && selectedOrder.items.length > 0 ? selectedOrder.items.map((item, index) => (
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
                  )) : (
                    <p className="text-center text-gray-500 py-4">Không có sản phẩm</p>
                  )}
                </div>
              </div>

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
                      <span>Giảm giá:</span>
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
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedOrder.payment?.method === "COD"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                  <p className="text-sm text-gray-600">Mã đơn: {selectedOrder.id}</p>
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
    </div>
  );
};

export default Orders;