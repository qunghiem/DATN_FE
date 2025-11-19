import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import {
  login,
  loginWithGoogle,
  forgotPassword,
  verifyOTP,
  resetPassword,
  clearMessages,
} from "../features/auth/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../assets/logo.png";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, isAuthenticated, resetToken } =
    useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState("login"); // 'login', 'forgot', 'otp', 'reset'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
    captcha_response: "",
  });

  const [countdown, setCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Hàm format thời gian
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Hàm reset countdown khi gửi lại OTP
  const handleResendOTP = () => {
    if (canResend) {
      handleForgotPassword();
      setCountdown(300);
      setCanResend(false);
    }
  };

  // kiểm tra role để redirect trang
  useEffect(() => {
    if (isAuthenticated && view === "login") {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user?.role);
      if (user?.role === "ADMIN") {
        navigate("/admin/products"); // Admin → dashboard admin
      } else if (user?.role === "EMPLOYEE") {
        navigate("/employee/chat"); // Employee → giao diện chat
      } else {
        navigate("/"); // Customer → trang chủ
      }
    }
  }, [isAuthenticated, navigate, view]);

  useEffect(() => {
    dispatch(clearMessages());
  }, [view, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      login({
        email: formData.email,
        password: formData.password,
        remember_me: rememberMe,
        captcha_response: formData.captcha_response,
      })
    );

    if (login.fulfilled.match(result)) {
      const user = result.payload.user;
      if (user?.role === "ADMIN") {
        navigate("/admin/products");
      } else if (user?.role === "EMPLOYEE") {
        navigate("/employee/chat");
      } else {
        navigate("/");
      }
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (idToken) {
      const result = await dispatch(loginWithGoogle({ idToken }));
      if (loginWithGoogle.fulfilled.match(result)) {
        const user = result.payload.user;
        if (user?.role === "ADMIN") {
          navigate("/admin/products");
        } else if (user?.role === "EMPLOYEE") {
          navigate("/employee/chat");
        } else {
          navigate("/");
        }
      }
    }
  };

  const handleGoogleLoginError = () => {
    console.log("Google login failed");
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword({ email: formData.email }));
    if (forgotPassword.fulfilled.match(result)) {
      setView("otp");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      verifyOTP({
        email: formData.email,
        otp: formData.otp,
      })
    );
    if (verifyOTP.fulfilled.match(result)) {
      setView("reset");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }
    const result = await dispatch(
      resetPassword({
        email: formData.email,
        resetToken: resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    );
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        setView("login");
        setFormData({
          email: "",
          password: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
          captcha_response: "",
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-4 pt-20">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src={logo} alt="EGA Sportswear" className="h-12 mx-auto" />
          </Link>
          <p className="text-gray-600 text-sm">
            Chất lượng tạo nên sự chuyên nghiệp
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Login View */}
          {view === "login" && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Đăng nhập
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                    <span className="text-sm text-gray-600">
                      Ghi nhớ đăng nhập
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <div className="mt-4 flex justify-center">
                  <ReCAPTCHA
                    sitekey="6Lc1lwAsAAAAAKLMPjj46NxekGoIwzEvePUjVKRO"
                    onChange={(value) => {
                      console.log("Captcha token nhận được:", value);
                      setFormData({ ...formData, captcha_response: value });
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />
              </div>

              <p className="text-center text-sm text-gray-600 mt-6">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-sky-600 hover:text-sky-700 font-medium"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </>
          )}

          {view === "forgot" && (
            <>
              <button
                onClick={() => setView("login")}
                className="flex items-center text-sky-600 hover:text-sky-700 mb-6 transition"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại đăng nhập
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Quên mật khẩu
              </h2>
              <p className="text-gray-600 text-sm text-center mb-6">
                Nhập email của bạn để nhận mã OTP
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi mã OTP"
                  )}
                </button>
              </form>
            </>
          )}

          {/* OTP Verification View */}
          {view === "otp" && (
            <>
              <button
                onClick={() => setView("forgot")}
                className="flex items-center text-sky-600 hover:text-sky-700 mb-6 transition"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Xác minh OTP
              </h2>
              <p className="text-gray-600 text-sm text-center mb-6">
                Nhập mã OTP đã được gửi đến email{" "}
                <span className="font-medium text-gray-800">
                  {formData.email}
                </span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã OTP
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none text-center text-2xl tracking-widest font-semibold"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {countdown > 0 ? (
                      <>
                        Mã OTP có hiệu lực trong{" "}
                        <span className="font-semibold text-sky-600">
                          {formatTime(countdown)}
                        </span>
                      </>
                    ) : (
                      <span className="text-red-500 font-medium">
                        Mã OTP đã hết hạn. Vui lòng gửi lại.
                      </span>
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xác minh...
                    </>
                  ) : (
                    "Xác minh"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="w-full text-sky-600 hover:text-sky-700 py-2 text-sm font-medium transition"
                >
                  {canResend
                    ? "Gửi lại mã OTP"
                    : `Gửi lại sau ${formatTime(countdown)}`}
                </button>
              </form>
            </>
          )}

          {/* Reset Password View */}
          {view === "reset" && (
            <>
              <button
                onClick={() => setView("otp")}
                className="flex items-center text-sky-600 hover:text-sky-700 mb-6 transition"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Đặt lại mật khẩu
              </h2>
              <p className="text-gray-600 text-sm text-center mb-6">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="••••••••"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="••••••••"
                      required
                      minLength="6"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Lưu ý:</strong> Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 EGA Sportswear. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;