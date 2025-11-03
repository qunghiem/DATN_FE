import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { register, clearMessages } from '../features/auth/authSlice';
import logo from '../assets/logo.png';
import ReCAPTCHA from 'react-google-recaptcha';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear messages on mount
  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    // Validate phone number (Vietnamese format)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam.');
      return;
    }

    // Log object trước khi gửi
  const registerData = {
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password,
    confirmPassword: formData.confirmPassword,
    phone: formData.phone,
    captcha_token: 'dummy-captcha-token'
  };
  console.log('Register Data:', registerData);

    const result = await dispatch(register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
      captcha_token: 'dummy-captcha-token'
    }));

    if (register.fulfilled.match(result)) {
      navigate('/');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng ký tài khoản</h2>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                  placeholder="0987654321"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Định dạng: 03/05/07/08/09 + 8 số</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mt-1"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
                  Chính sách bảo mật
                </a>
              </label>
            </div>
<div className="mt-4 flex justify-center">
                    <ReCAPTCHA
                      sitekey="6Lc1lwAsAAAAAKLMPjj46NxekGoIwzEvePUjVKRO" // 👈 thay bằng site key thật của bạn
                      onChange={(value) =>
                        setFormData({ ...formData, captcha_response: value })
                      }
                    />
                  </div>
            {/* Submit Button */}
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
                'Đăng ký'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc đăng ký với</span>
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
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
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 EGA Sportswear. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;