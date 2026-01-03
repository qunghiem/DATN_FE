import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
  updateExpiredVouchers,
  clearMessages,
} from "../../features/admin/adminVouchersSlice";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Ticket,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

const Vouchers = () => {
  const dispatch = useDispatch();
  const {
    vouchers = [],
    isLoading,
    error,
    success,
  } = useSelector((state) => state.adminVouchers || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, PERCENTAGE, FIXED_AMOUNT, FREESHIP
  const [filterStatus, setFilterStatus] = useState("all"); // all, ACTIVE, INACTIVE
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "FIXED_AMOUNT",
    discountValue: "",
    maxDiscountValue: "",
    minOrderValue: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchAllVouchers());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
  }, [error, success, dispatch]);

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "FIXED_AMOUNT",
      discountValue: "",
      maxDiscountValue: "",
      minOrderValue: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
      description: "",
    });
    setEditMode(false);
    setCurrentVoucher(null);
  };

  const handleEdit = (voucher) => {
    setEditMode(true);
    setCurrentVoucher(voucher);
    setFormData({
      code: voucher.code || "",
      discountType: voucher.discountType || "FIXED_AMOUNT",
      discountValue: voucher.discountValue || "",
      maxDiscountValue: voucher.maxDiscountValue || "",
      minOrderValue: voucher.minOrderValue || "",
      usageLimit: voucher.usageLimit || "",
      startDate: voucher.startDate ? voucher.startDate.split("T")[0] : "",
      endDate: voucher.endDate ? voucher.endDate.split("T")[0] : "",
      status: voucher.status || "ACTIVE",
      description: voucher.description || "",
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
      dispatch(deleteVoucher(id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (!formData.code.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    if (!formData.discountValue || formData.discountValue <= 0) {
      toast.error("Giá trị giảm giá phải lớn hơn 0");
      return;
    }
    if (!formData.usageLimit || formData.usageLimit < 1) {
      toast.error("Số lần sử dụng phải lớn hơn hoặc bằng 1");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      usageLimit: Number(formData.usageLimit),
      startDate: formData.startDate,
      endDate: formData.endDate,
    };

    // Optional fields
    if (formData.maxDiscountValue) {
      payload.maxDiscountValue = Number(formData.maxDiscountValue);
    }
    if (formData.minOrderValue) {
      payload.minOrderValue = Number(formData.minOrderValue);
    }
    if (formData.description.trim()) {
      payload.description = formData.description.trim();
    }
    if (editMode) {
      payload.status = formData.status;
    }

    if (editMode && currentVoucher) {
      dispatch(updateVoucher({ id: currentVoucher.id, ...payload })).then(
        (result) => {
          if (!result.error) {
            setShowModal(false);
            resetForm();
            dispatch(fetchAllVouchers());
          }
        }
      );
    } else {
      dispatch(createVoucher(payload)).then((result) => {
        if (!result.error) {
          setShowModal(false);
          resetForm();
          dispatch(fetchAllVouchers());
        }
      });
    }
  };

  const handleUpdateExpired = () => {
    if (window.confirm("Cập nhật trạng thái các voucher đã hết hạn?")) {
      dispatch(updateExpiredVouchers()).then(() => {
        dispatch(fetchAllVouchers());
      });
    }
  };

  const getDiscountTypeLabel = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return "Phần trăm";
      case "FIXED_AMOUNT":
        return "Số tiền cố định";
      case "FREESHIP":
        return "Miễn phí ship";
      default:
        return type;
    }
  };

  const getDiscountDisplay = (voucher) => {
    switch (voucher.discountType) {
      case "PERCENTAGE":
        return `${voucher.discountValue}%${
          voucher.maxDiscountValue
            ? ` (tối đa ${voucher.maxDiscountValue.toLocaleString()}₫)`
            : ""
        }`;
      case "FIXED_AMOUNT":
        return `${voucher.discountValue.toLocaleString()}₫`;
      case "FREESHIP":
        return `Miễn phí ship (${voucher.discountValue.toLocaleString()}₫)`;
      default:
        return "N/A";
    }
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchSearch =
      voucher.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType =
      filterType === "all" || voucher.discountType === filterType;
    const matchStatus =
      filterStatus === "all" || voucher.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // Stats
  const stats = {
    total: vouchers.length,
    active: vouchers.filter((v) => v.isActive && !v.isExpired).length,
    expired: vouchers.filter((v) => v.isExpired).length,
    totalUsage: vouchers.reduce((sum, v) => sum + (v.usageCount || 0), 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Voucher</h1>
        <div className="flex gap-2">
          <button
            onClick={handleUpdateExpired}
            className="flex items-center bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            title="Cập nhật voucher hết hạn"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Cập nhật hết hạn
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm voucher
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng voucher</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã hết hạn</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Lượt sử dụng</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalUsage}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm voucher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả loại</option>
            <option value="PERCENTAGE">Phần trăm</option>
            <option value="FIXED_AMOUNT">Số tiền cố định</option>
            <option value="FREESHIP">Miễn phí ship</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Mã voucher
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Loại
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Giảm giá
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Đơn tối thiểu
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Số lần dùng
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Thời gian
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Không tìm thấy voucher nào
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr
                      key={voucher.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-semibold text-sky-600 text-lg">
                            {voucher.code}
                          </span>
                          {voucher.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {voucher.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {getDiscountTypeLabel(voucher.discountType)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        {getDiscountDisplay(voucher)}
                      </td>
                      <td className="py-3 px-4">
                        {voucher.minOrderValue > 0
                          ? `${voucher.minOrderValue.toLocaleString()}₫`
                          : "Không"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-blue-600">
                              {voucher.usageCount}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-600">
                              {voucher.usageLimit}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Còn: {voucher.remainingUses}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-600">
                            {new Date(voucher.startDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                          <span className="text-gray-400">đến</span>
                          <span className="text-gray-600">
                            {new Date(voucher.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              voucher.isActive && !voucher.isExpired
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {voucher.status === "ACTIVE"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </span>
                          {voucher.isExpired && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              Hết hạn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {/* Chỉ hiển thị icon chỉnh sửa khi voucher chưa hết hạn, còn lượt sử dụng và đang ACTIVE */}
                          {!voucher.isExpired &&
                            voucher.remainingUses > 0 &&
                            voucher.status === "ACTIVE" && (
                              <button
                                onClick={() => handleEdit(voucher)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}
                          <button
                            onClick={() => handleDelete(voucher.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Count */}
      {filteredVouchers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số:{" "}
          <span className="font-semibold">{filteredVouchers.length}</span>{" "}
          voucher
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <VoucherModal
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          editMode={editMode}
          isLoading={isLoading}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
        />
      )}
    </div>
  );
};

// Component Modal
const VoucherModal = ({
  formData,
  setFormData,
  handleSubmit,
  editMode,
  isLoading,
  onClose,
}) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {editMode ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mã voucher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã voucher <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none uppercase"
              placeholder="VD: GIAM50K, FREESHIP1"
              required
              disabled={editMode}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mã voucher phải là duy nhất và không chứa khoảng trắng
            </p>
          </div>

          {/* Loại voucher */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại voucher <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleChange("discountType", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              required
            >
              <option value="FIXED_AMOUNT">Giảm số tiền cố định</option>
              <option value="PERCENTAGE">Giảm theo phần trăm</option>
              <option value="FREESHIP">Miễn phí vận chuyển</option>
            </select>
          </div>

          {/* Giá trị giảm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá trị giảm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleChange("discountValue", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder={
                  formData.discountType === "PERCENTAGE" ? "35" : "50000"
                }
                required
                min="0"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                {formData.discountType === "PERCENTAGE" ? "%" : "₫"}
              </span>
            </div>
          </div>

          {/* Giảm tối đa (chỉ cho PERCENTAGE) */}
          {formData.discountType === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giảm tối đa (₫)
              </label>
              <input
                type="number"
                value={formData.maxDiscountValue}
                onChange={(e) =>
                  handleChange("maxDiscountValue", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="50000"
                min="0"
              />
            </div>
          )}

          {/* Đơn hàng tối thiểu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá trị đơn hàng tối thiểu (₫)
            </label>
            <input
              type="number"
              value={formData.minOrderValue}
              onChange={(e) => handleChange("minOrderValue", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Số lần sử dụng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới hạn số lần sử dụng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => handleChange("usageLimit", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="100"
              required
              min="1"
            />
          </div>

          {/* Ngày bắt đầu và kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Trạng thái (chỉ khi edit) */}
          {editMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
          )}

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none resize-none"
              rows="3"
              placeholder="Mô tả chi tiết về voucher..."
            />
          </div>

          {/* Preview */}
          {formData.code && (
            <div className="bg-gradient-to-r from-sky-50 to-purple-50 p-4 rounded-lg border border-sky-200">
              <p className="text-xs text-gray-600 mb-2 font-medium">
                Preview voucher:
              </p>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-sky-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xl text-sky-600">
                      {formData.code}
                    </h4>
                    {formData.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {formData.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formData.discountType === "PERCENTAGE"
                        ? `${formData.discountValue}%`
                        : `${Number(formData.discountValue).toLocaleString()}₫`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.discountType === "FREESHIP" && "Miễn phí ship"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>{editMode ? "Cập nhật" : "Thêm mới"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Vouchers;
