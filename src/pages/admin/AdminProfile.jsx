import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { logout, setUser } from "../../features/auth/authSlice";

const AdminProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, access_token } = useSelector(
    (state) => state.auth
  );

  // State for active tab
  const [activeTab, setActiveTab] = useState("info");

  // State for personal info change
  const [infoData, setInfoData] = useState({
    fullName: "",
    phone: "",
  });

  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for password change
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // log kiểm tra debug
  useEffect(() => {
    console.log("=== ADMIN PROFILE DEBUG ===");
    console.log("Redux user:", user);
    console.log("Redux isAuthenticated:", isAuthenticated);
    console.log("Redux access_token:", access_token);
    console.log(
      "LocalStorage user:",
      JSON.parse(localStorage.getItem("user") || "null")
    );
    console.log(
      "LocalStorage access_token:",
      localStorage.getItem("access_token")
    );
    console.log("==========================");
  }, [user, isAuthenticated, access_token]);

  useEffect(() => {
    console.log("🔍 AdminProfile mounted - Auth state:", {
      user,
      isAuthenticated,
      access_token: access_token ? "exists" : "missing",
    });

    // Log khi component unmount (bị redirect)
    return () => {
      console.log("⚠️ AdminProfile UNMOUNTING - Possible redirect");
      console.log("Current URL will be:", window.location.href);
    };
  }, []);

  // Fetch user profile data from API on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.code === 1000) {
          const userData = response.data.result;
          setInfoData({
            fullName: userData.fullName || "",
            phone: userData.phone || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          dispatch(logout());
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    if (access_token) {
      fetchUserProfile();
    }
  }, [access_token, dispatch]);

  // Get initials from full name
  const getInitials = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  };

  const initials = getInitials(user?.fullName || infoData.fullName);

  // Handle info input change
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate info form
  const validateInfoForm = () => {
    if (!infoData.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên!");
      return false;
    }

    if (!infoData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return false;
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(infoData.phone)) {
      toast.error("Số điện thoại không hợp lệ!");
      return false;
    }

    return true;
  };

  // Handle info update submit - FIXED VERSION
  const handleInfoSubmit = async (e) => {
    e.preventDefault();

    if (!validateInfoForm()) {
      return;
    }

    setIsSubmittingInfo(true);

    try {
      const response = await axios.put(
        "/api/users/update-profile",
        {
          fullName: infoData.fullName,
          phone: infoData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 1000) {
        toast.success("Cập nhật thông tin thành công!");

        // Fetch updated user profile
        const profileResponse = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (profileResponse.data.code === 1000) {
          const updatedUserProfile = profileResponse.data.result;

          console.log("🔄 API Response user:", updatedUserProfile);
          console.log("📋 Current Redux user before update:", user);

          // FIX CRITICAL: MERGE thay vì REPLACE
          const mergedUser = {
            ...user, // Giữ TẤT CẢ field cũ
            ...updatedUserProfile, // Cập nhật/chỉ thay đổi 4 field từ API
          };

          console.log("✅ Merged user after update:", mergedUser);

          dispatch(setUser(mergedUser));

          // Đồng bộ localStorage
          localStorage.setItem("user", JSON.stringify(mergedUser));
        }
      } else {
        toast.error(response.data.message || "Cập nhật thông tin thất bại!");
      }
    } catch (error) {
      console.error("Error updating info:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        dispatch(logout());
        window.location.href = "/login";
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau!");
      }
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validate password form
  const validatePasswordForm = () => {
    if (!passwordData.oldPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu cũ!");
      return false;
    }

    if (!passwordData.newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự!");
      return false;
    }

    if (passwordData.newPassword === passwordData.oldPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu cũ!");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return false;
    }

    return true;
  };

  // Handle password change submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/users/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 1000) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          dispatch(logout());
          window.location.href = "/login";
        }, 2000);
      } else {
        toast.error(response.data.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        dispatch(logout());
        window.location.href = "/login";
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get role label
  const getRoleLabel = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "OWNER":
        return "Chủ sở hữu";
      case "EMPLOYEE":
        return "Nhân viên";
      default:
        return role;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Thông tin tài khoản
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin cá nhân và bảo mật
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
                  activeTab === "info"
                    ? "border-[#3A6FB5] text-[#3A6FB5]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition ${
                  activeTab === "password"
                    ? "border-[#3A6FB5] text-[#3A6FB5]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Shield className="w-5 h-5" />
                Đổi mật khẩu
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Admin Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {initials || "U"}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {user?.fullName || infoData.fullName}
                      </h2>
                      <p className="text-gray-600">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        <Shield className="w-4 h-4 mr-1" />
                        {getRoleLabel(user?.role)}
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        Họ và tên <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={infoData.fullName}
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition"
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        Số điện thoại{" "}
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={infoData.phone}
                        onChange={handleInfoChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition"
                        placeholder="0987654321"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Định dạng: 03/05/07/08/09 + 8 số
                      </p>
                    </div>

                    {/* Email (read-only) */}
                    <div className="md:col-span-2">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email không thể thay đổi
                      </p>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setInfoData({
                          fullName: user?.fullName || "",
                          phone: user?.phone || "",
                        });
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Hủy thay đổi
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingInfo}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingInfo ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Cập nhật thông tin
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Đổi mật khẩu
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho
                    người khác
                  </p>
                </div>

                {/* Old Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPasswords.old ? "text" : "password"}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition"
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("old")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.old ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition"
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mật khẩu phải có ít nhất 8 ký tự
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Lưu ý bảo mật</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Mật khẩu mới phải khác mật khẩu hiện tại</li>
                        <li>Không sử dụng mật khẩu quá đơn giản</li>
                        <li>Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordData({
                        oldPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Đổi mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
