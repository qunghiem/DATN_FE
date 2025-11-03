import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { 
  login, 
  loginWithGoogle, 
  forgotPassword, 
  verifyOTP, 
  resetPassword, 
  clearMessages 
} from '../features/auth/authSlice';
import logo from '../assets/logo.png';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, isAuthenticated, resetToken } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'forgot', 'otp', 'reset'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && view === 'login') {
      navigate('/');
    }
  }, [isAuthenticated, navigate, view]);

  // Clear messages when view changes
  useEffect(() => {
    dispatch(clearMessages());
  }, [view, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({
      email: formData.email,
      password: formData.password,
      remember_me: rememberMe,
      captcha_response: ''
    }));

    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    // Implement Google OAuth flow here
    // You'll need to get the idToken from Google Sign-In
    console.log('Google login clicked');
    // Example:
    // const idToken = await getGoogleIdToken();
    // dispatch(loginWithGoogle({ idToken }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    const result = await dispatch(forgotPassword({ email: formData.email }));
    
    if (forgotPassword.fulfilled.match(result)) {
      setView('otp');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const result = await dispatch(verifyOTP({
      email: formData.email,
      otp: formData.otp
    }));
    
    if (verifyOTP.fulfilled.match(result)) {
      setView('reset');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    const result = await dispatch(resetPassword({
      email: formData.email,
      resetToken: resetToken,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    }));
    
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => {
        setView('login');
        setFormData({
          email: '',
          password: '',
          otp: '',
          newPassword: '',
          confirmPassword: ''
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
          <p className="text-gray-600 text-sm">Chất lượng tạo nên sự chuyên nghiệp</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          {/* Login View */}
          {view === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng nhập</h2>

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
                      type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                    <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Quên mật khẩu?
                  </button>
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
                    'Đăng nhập'
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Google</span>
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium">
                  Đăng ký ngay
                </Link>
              </p>
            </>
          )}

          {/* Forgot Password View */}
          {view === 'forgot' && (
            <>
              <button
                onClick={() => setView('login')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quên mật khẩu</h2>
              <p className="text-gray-600 mb-6 text-sm">Nhập email để nhận mã OTP xác thực</p>

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
                    'Gửi mã OTP'
                  )}
                </button>
              </form>
            </>
          )}

          {/* OTP Verification View */}
          {view === 'otp' && (
            <>
              <button
                onClick={() => setView('forgot')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực OTP</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Mã OTP đã được gửi đến <span className="font-medium">{formData.email}</span>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition text-center text-2xl tracking-widest outline-none"
                    placeholder="000000"
                    maxLength="6"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Mã OTP có hiệu lực trong 5 phút</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    'Xác thực'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="w-full text-sky-600 hover:text-sky-700 text-sm font-medium"
                >
                  Gửi lại mã OTP
                </button>
              </form>
            </>
          )}

          {/* Reset Password View */}
          {view === 'reset' && (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
              <p className="text-gray-600 mb-6 text-sm">Nhập mật khẩu mới của bạn</p>

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
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="••••••••"
                      required
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 8 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                      placeholder="••••••••"
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
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt lại mật khẩu'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 EGA Sportswear. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;