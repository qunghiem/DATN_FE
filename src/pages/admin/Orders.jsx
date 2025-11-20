import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  updateOrderStatus,
  clearMessages,
  setFilterStatus,
} from "../../features/admin/adminOrdersSlice";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  X,
  User,
  Phone,
  MapPin,
  Box,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const {
    orders = [],
    currentPage = 0,
    pageSize = 10,
    filterStatus,
    isLoading,
    error,
    success,
  } = useSelector((state) => state.adminOrders || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  // Order statuses
  const orderStatuses = [
    { id: "", name: "Tất cả", icon: Package, color: "gray" },
    { id: "PENDING", name: "Chờ xác nhận", icon: Clock, color: "yellow" },
    { id: "CONFIRMED", name: "Xác nhận", icon: CheckCircle, color: "blue" },
    { id: "SHIPPED", name: "Đang giao", icon: Truck, color: "purple" },
    { id: "DELIVERED", name: "Đã giao", icon: CheckCircle, color: "green" },
    { id: "CANCELLED", name: "Hủy", icon: XCircle, color: "red" },
  ];

  // Valid status transitions
  const validTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  useEffect(() => {
    dispatch(
      fetchAllOrders({
        page: currentPage,
        size: pageSize,
        status: statusFilter,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
      // Refresh orders after status update
      dispatch(
        fetchAllOrders({
          page: currentPage,
          size: pageSize,
          status: statusFilter,
        })
      );
    }
  }, [error, success, dispatch, currentPage, pageSize, statusFilter]);

  const handleStatusChange = (orderId, newStatus) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${getStatusLabel(
          newStatus
        )}"?`
      )
    ) {
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(
      fetchAllOrders({ page: newPage, size: pageSize, status: statusFilter })
    );
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    dispatch(setFilterStatus(status));
    dispatch(
      fetchAllOrders({ page: 0, size: pageSize, status: status || null })
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
      SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-100 text-green-700 border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const statusInfo = orderStatuses.find((s) => s.id === status);
    return statusInfo ? statusInfo.name : status;
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

  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.id?.toString().includes(searchTerm) ||
      order.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm);
    return matchSearch;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý đơn hàng
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-yellow-700">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã xác nhận</p>
              <p className="text-2xl font-bold text-blue-700">
                {stats.confirmed}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đang giao</p>
              <p className="text-2xl font-bold text-purple-700">
                {stats.shipped}
              </p>
            </div>
            <Truck className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã giao</p>
              <p className="text-2xl font-bold text-green-700">
                {stats.delivered}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã hủy</p>
              <p className="text-2xl font-bold text-red-700">
                {stats.cancelled}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn, tên hoặc SĐT khách hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            >
              {orderStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Mã đơn
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Khách hàng
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Ngày đặt
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Tổng tiền
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Thanh toán
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Trạng thái
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Xem
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-gray-500"
                      >
                        Không tìm thấy đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">#{order.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{order.fullName}</div>
                            <div className="text-sm text-gray-500">
                              {order.phone}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.payment?.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.paymentMethod === "COD" ? "COD" : "Đã thanh toán"}
                          </span>
                        </td>
                           <td className="py-3 px-4">
                          {validTransitions[order.status]?.length === 0 ? (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          ) : (
                            <div className="relative inline-block">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusChange(order.id, e.target.value);
                                    e.target.value = ""; // Reset về trạng thái ban đầu
                                  }
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-medium border outline-none cursor-pointer appearance-none ${getStatusColor(
                                  order.status
                                )}`}
                                style={{ paddingRight: '24px' }}
                              >
                                <option value="" hidden>
                                  {getStatusLabel(order.status)}
                                </option>
                                {validTransitions[order.status]?.map((status) => (
                                  <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                  </option>
                                ))}
                              </select>
                              <ChevronRight className="w-3 h-3 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none rotate-90" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-600">
                Trang {currentPage + 1} - Hiển thị {filteredOrders.length} đơn
                hàng
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={filteredOrders.length < pageSize}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Trạng thái đơn hàng
                </h3>
                <div
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusLabel(selectedOrder.status)}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Thông tin khách hàng
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Tên:</span>{" "}
                    {selectedOrder.fullName}
                  </p>
                  <p>
                    <span className="font-medium">Số điện thoại:</span>{" "}
                    {selectedOrder.phone}
                  </p>
                  <p>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {selectedOrder.address}
                  </p>
                  {selectedOrder.note && (
                    <p>
                      <span className="font-medium">Ghi chú:</span>{" "}
                      {selectedOrder.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Sản phẩm ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={`http://localhost:8080/${item.imageUrl}`}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/64?text=No+Image";
                          }}
                        />
                        <div>
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            {item.color} / {item.size} - x{item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Tổng kết đơn hàng
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{formatPrice(selectedOrder.shippingFee)}</span>
                  </div>
                  {selectedOrder.shippingDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm phí vận chuyển:</span>
                      <span>
                        -{formatPrice(selectedOrder.shippingDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span className="text-red-600">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Thông tin thanh toán
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Phương thức:</span>{" "}
                    {selectedOrder.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Chuyển khoản"}
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.payment?.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedOrder.payment?.status === "PAID"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </p>
                  {selectedOrder.payment?.transactionId && (
                    <p>
                      <span className="font-medium">Mã giao dịch:</span>{" "}
                      {selectedOrder.payment.transactionId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
