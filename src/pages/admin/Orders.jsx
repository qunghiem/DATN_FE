import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrders,
  updateOrderStatus,
  clearMessages,
  setFilterStatus,
  setSearchKeyword,
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
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Hàm fetch chi tiết đơn hàng
const fetchOrderDetail = async (orderId) => {
  const token = localStorage.getItem("access_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
  try {
    const response = await fetch(
      `${VITE_API_URL}/api/orders/${orderId}`,
      { headers }
    );
    const data = await response.json();
    
    if (data.code === 1000) {
      return data.result;
    } else {
      throw new Error(data.message || "Có lỗi xảy ra");
    }
  } catch (error) {
    console.error("Error fetching order detail:", error);
    throw error;
  }
};

const AdminOrders = () => {
  const dispatch = useDispatch();
  const {
    orders = [],
    currentPage = 0,
    pageSize = 10,
    totalPages = 0,
    totalElements = 0,
    filterStatus,
    searchKeyword,
    isLoading,
    error,
    success,
  } = useSelector((state) => state.adminOrders || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  // Fetch orders khi component mount hoặc khi filter/search thay đổi
  useEffect(() => {
    dispatch(
      fetchAllOrders({
        page: currentPage,
        size: pageSize,
        status: statusFilter || null,
        keyword: debouncedSearchTerm,
        fromDate: fromDate || null,
        toDate: toDate || null,
      })
    );
  }, [dispatch, currentPage, pageSize, statusFilter, debouncedSearchTerm, fromDate, toDate]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      try {
        const statusToFetch = statusFilter || null;
        const params = new URLSearchParams();
        params.append("page", 0);
        params.append("size", 1);
        
        if (statusToFetch) {
          params.append("status", statusToFetch);
        }
        if (debouncedSearchTerm && debouncedSearchTerm.trim() !== "") {
          params.append("keyword", debouncedSearchTerm.trim());
        }
        if (fromDate) {
          params.append("fromDate", fromDate);
        }
        if (toDate) {
          params.append("toDate", toDate);
        }
        
        const res = await fetch(
          `${VITE_API_URL}/api/orders/search?${params.toString()}`,
          { headers }
        );
        const data = await res.json();
        
        setOrderStats(prev => {
          if (statusToFetch === null) {
            return { ...prev, total: data.result?.totalElements || 0 };
          } else {
            return { 
              ...prev, 
              [statusToFetch.toLowerCase()]: data.result?.totalElements || 0 
            };
          }
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, [statusFilter, debouncedSearchTerm, fromDate, toDate]);

  // Handle messages
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
          status: statusFilter || null,
          keyword: debouncedSearchTerm,
          fromDate: fromDate || null,
          toDate: toDate || null,
        })
      );
    }
  }, [error, success, dispatch, currentPage, pageSize, statusFilter, debouncedSearchTerm, fromDate, toDate]);

  // Hàm xem chi tiết đơn hàng
  const handleViewOrderDetail = async (orderId) => {
    setIsLoadingDetail(true);
    try {
      const orderDetail = await fetchOrderDetail(orderId);
      setSelectedOrder(orderDetail);
      setShowDetailModal(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết đơn hàng: " + error.message);
    } finally {
      setIsLoadingDetail(false);
    }
  };

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
      fetchAllOrders({ 
        page: newPage, 
        size: pageSize, 
        status: statusFilter || null,
        keyword: debouncedSearchTerm,
        fromDate: fromDate || null,
        toDate: toDate || null,
      })
    );
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    dispatch(setFilterStatus(status));
    dispatch(
      fetchAllOrders({ 
        page: 0, 
        size: pageSize, 
        status: status || null,
        keyword: debouncedSearchTerm,
        fromDate: fromDate || null,
        toDate: toDate || null,
      })
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(setSearchKeyword(value));
  };

  const handleDateFilterApply = () => {
    if (fromDate && toDate && fromDate > toDate) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    dispatch(
      fetchAllOrders({ 
        page: 0, 
        size: pageSize, 
        status: statusFilter || null,
        keyword: debouncedSearchTerm,
        fromDate: fromDate || null,
        toDate: toDate || null,
      })
    );
  };

  const handleClearDateFilter = () => {
    setFromDate("");
    setToDate("");
    dispatch(
      fetchAllOrders({ 
        page: 0, 
        size: pageSize, 
        status: statusFilter || null,
        keyword: debouncedSearchTerm,
        fromDate: null,
        toDate: null,
      })
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
              <p className="text-2xl font-bold text-gray-800">{orderStats.total}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ xác nhận</p>
              <p className="text-2xl font-bold text-yellow-700">
                {orderStats.pending}
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
                {orderStats.confirmed}
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
                {orderStats.shipped}
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
                {orderStats.delivered}
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
                {orderStats.cancelled}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo mã đơn, tên hoặc SĐT khách hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  dispatch(setSearchKeyword(""));
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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

        {/* Date Filter Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center gap-2 text-gray-700 hover:text-sky-600 font-medium"
            >
              <Calendar className="w-5 h-5" />
              <span>Lọc theo ngày</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-90' : ''}`} />
            </button>
            {(fromDate || toDate) && (
              <button
                onClick={handleClearDateFilter}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          
          {showDateFilter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleDateFilterApply}
                  className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition font-medium"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchTerm || fromDate || toDate) && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Đang lọc:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                Từ khóa: "{searchTerm}"
              </span>
            )}
            {fromDate && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Từ: {new Date(fromDate).toLocaleDateString('vi-VN')}
              </span>
            )}
            {toDate && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Đến: {new Date(toDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        )}
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
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-12 text-gray-500"
                      >
                        {searchTerm || fromDate || toDate ? 
                          "Không tìm thấy đơn hàng nào với bộ lọc đã chọn" : 
                          "Không có đơn hàng nào"}
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
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
                                    e.target.value = "";
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
                            onClick={() => handleViewOrderDetail(order.id)}
                            disabled={isLoadingDetail}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoadingDetail && selectedOrder?.id === order.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
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
                Trang {currentPage + 1} / {totalPages} - Hiển thị {orders.length} / {totalElements} đơn hàng
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
                  disabled={currentPage >= totalPages - 1}
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
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Chi tiết đơn hàng #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedOrder(null);
                  }}
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
                          src={item.imageUrl}
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
                          <p className="text-sm text-gray-500">
                            SKU: {item.productSku}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatPrice(item.unitPrice)} x {item.quantity}
                        </div>
                        <div className="font-bold text-lg">
                          {formatPrice(item.totalPrice)}
                        </div>
                      </div>
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
                    <span>{formatPrice(selectedOrder.shippingFeeOriginal)}</span>
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

              {/* Reward Points */}
              {(selectedOrder.rewardPointsUsed !== null || selectedOrder.rewardPointsEarned !== null) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Điểm thưởng
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {selectedOrder.rewardPointsUsed !== null && (
                      <div className="flex justify-between">
                        <span>Điểm đã sử dụng:</span>
                        <span className="text-red-600">-{selectedOrder.rewardPointsUsed} điểm</span>
                      </div>
                    )}
                    {selectedOrder.rewardPointsEarned !== null && (
                      <div className="flex justify-between">
                        <span>Điểm tích lũy từ đơn:</span>
                        <span className="text-green-600">+{selectedOrder.rewardPointsEarned} điểm</span>
                      </div>
                    )}
                    {selectedOrder.userRemainingRewardPoints !== null && (
                      <div className="flex justify-between font-medium">
                        <span>Điểm còn lại của khách hàng:</span>
                        <span>{selectedOrder.userRemainingRewardPoints} điểm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Thời gian
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Thời gian đặt:</span>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Cập nhật lần cuối:</span>{" "}
                    {formatDate(selectedOrder.updatedAt)}
                  </p>
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