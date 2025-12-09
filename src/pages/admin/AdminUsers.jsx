import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUser,
  resetUserPassword,
  clearMessages,
  setFilters,
  clearFilters,
} from "../../features/admin/adminUsersSlice";
import { Plus, Edit, Trash2, Search, X, Key, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, pagination, filters, isLoading, error, success } = useSelector(
    (state) => state.adminUsers
  );
  const { user: currentUser } = useSelector((state) => state.auth);

  const isOwner = currentUser?.role === "OWNER";
  const isAdmin = currentUser?.role === "ADMIN";

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create' | 'edit' | 'resetPassword'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    status: "ACTIVE",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Role options based on current user
  const getRoleOptions = () => {
    if (isOwner) {
      return [
        { value: "ADMIN", label: "Admin" },
        { value: "EMPLOYEE", label: "Nhân viên" },
        { value: "CUSTOMER", label: "Khách hàng" },
      ];
    }
    if (isAdmin) {
      return [
        { value: "EMPLOYEE", label: "Nhân viên" },
        { value: "CUSTOMER", label: "Khách hàng" },
      ];
    }
    return [];
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "ACTIVE", label: "Hoạt động" },
    { value: "BLOCKED", label: "Đã khóa" },
  ];

  useEffect(() => {
    loadUsers();
  }, [dispatch, pagination.currentPage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
      setShowModal(false);
      resetForm();
      loadUsers();
    }
  }, [error, success, dispatch]);

  const loadUsers = () => {
    dispatch(
      fetchUsers({
        keyword: filters.keyword,
        role: filters.role,
        status: filters.status,
        page: pagination.currentPage,
        size: pagination.pageSize,
      })
    );
  };

  const handleSearch = () => {
    dispatch(
      setFilters({
        keyword: searchTerm,
        role: roleFilter,
        status: statusFilter,
      })
    );
    dispatch(
      fetchUsers({
        keyword: searchTerm,
        role: roleFilter,
        status: statusFilter,
        page: 0,
        size: pagination.pageSize,
      })
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    dispatch(clearFilters());
    dispatch(
      fetchUsers({
        keyword: "",
        role: "",
        status: "",
        page: 0,
        size: pagination.pageSize,
      })
    );
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "",
      status: "ACTIVE",
    });
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setSelectedUser(null);
  };

  const handleCreate = () => {
    setModalType("create");
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalType("edit");
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: "",
      confirmPassword: "",
      role: user.role,
      status: user.status,
    });
    setShowModal(true);
  };

  const handleResetPassword = (user) => {
    setModalType("resetPassword");
    setSelectedUser(user);
    setPasswordForm({
      newPassword: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (modalType === "create") {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Mật khẩu không khớp");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Mật khẩu phải có ít nhất 8 ký tự");
        return;
      }
      dispatch(createUser(formData));
    } else if (modalType === "edit") {
      const updateData = {
        id: selectedUser.id,
        fullName: formData.fullName,
        phone: formData.phone,
        status: formData.status,
      };
      
      // Owner can update role
      if (isOwner) {
        updateData.role = formData.role;
      }
      
      dispatch(updateUser(updateData));
    } else if (modalType === "resetPassword") {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("Mật khẩu không khớp");
        return;
      }
      if (passwordForm.newPassword.length < 8) {
        toast.error("Mật khẩu phải có ít nhất 8 ký tự");
        return;
      }
      dispatch(
        resetUserPassword({
          userId: selectedUser.id,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        })
      );
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(
      fetchUsers({
        keyword: filters.keyword,
        role: filters.role,
        status: filters.status,
        page: newPage,
        size: pagination.pageSize,
      })
    );
  };

  const canResetPassword = (user) => {
    if (user.role === "CUSTOMER") return false;
    if (isOwner && (user.role === "ADMIN" || user.role === "EMPLOYEE")) return true;
    if (isAdmin && user.role === "EMPLOYEE") return true;
    return false;
  };

  const canEditUser = (user) => {
    if (user.id === currentUser?.id) return false; // Can't edit yourself
    if (isOwner) return true;
    if (isAdmin && (user.role === "EMPLOYEE" || user.role === "CUSTOMER")) return true;
    return false;
  };

  const getRoleLabel = (role) => {
    const labels = {
      OWNER: "Chủ sở hữu",
      ADMIN: "Quản trị viên",
      EMPLOYEE: "Nhân viên",
      CUSTOMER: "Khách hàng",
    };
    return labels[role] || role;
  };

  const getStatusBadge = (status) => {
    if (status === "ACTIVE") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Hoạt động
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        Đã khóa
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const colors = {
      OWNER: "bg-purple-100 text-purple-700",
      ADMIN: "bg-blue-100 text-blue-700",
      EMPLOYEE: "bg-yellow-100 text-yellow-700",
      CUSTOMER: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[role]}`}>
        {getRoleLabel(role)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Quản lý người dùng
          {isOwner && <span className="text-sm text-purple-600 ml-2">(Owner)</span>}
          {isAdmin && <span className="text-sm text-blue-600 ml-2">(Admin)</span>}
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo tài khoản
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm theo tên, email, số điện thoại..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="">Tất cả vai trò</option>
            {getRoleOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
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
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Họ tên
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Số điện thoại
                    </th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">
                      Vai trò
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
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">#{user.id}</td>
                        <td className="py-3 px-4 font-medium">{user.fullName}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4 text-gray-600">{user.phone}</td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                        <td className="py-3 px-4 flex gap-2">
                          {canEditUser(user) && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Sửa thông tin"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {canResetPassword(user) && (
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                              title="Reset mật khẩu"
                            >
                              <Key className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">
                  Hiển thị {users.length} / {pagination.totalElements} kết quả
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2">
                    Trang {pagination.currentPage + 1} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">
                {modalType === "create" && "Tạo tài khoản mới"}
                {modalType === "edit" && "Sửa thông tin người dùng"}
                {modalType === "resetPassword" && "Reset mật khẩu"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === "resetPassword" ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg mb-4">
                    <p className="text-sm text-blue-700">
                      Đang reset mật khẩu cho: <strong>{selectedUser?.fullName}</strong>
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      Email: {selectedUser?.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mật khẩu phải có ít nhất 8 ký tự
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                      minLength={8}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                      disabled={modalType === "edit"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                    />
                  </div>

                  {modalType === "create" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu *
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                          required
                          minLength={8}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Mật khẩu phải có ít nhất 8 ký tự
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Xác nhận mật khẩu *
                        </label>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                          required
                          minLength={8}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                      disabled={modalType === "edit" && !isOwner}
                    >
                      <option value="">Chọn vai trò</option>
                      {getRoleOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {modalType === "edit" && !isOwner && (
                      <p className="text-xs text-gray-500 mt-1">
                        Chỉ Owner mới có thể thay đổi vai trò
                      </p>
                    )}
                  </div>

                  {modalType === "edit" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                        required
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="BLOCKED">Khóa tài khoản</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {isLoading
                    ? "Đang xử lý..."
                    : modalType === "create"
                    ? "Tạo tài khoản"
                    : modalType === "edit"
                    ? "Cập nhật"
                    : "Reset mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;