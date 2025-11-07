import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Truck,
  Package,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  selectCartItems,
  selectSelectedItems,
  selectCartSubtotal,
  selectCartTotal,
  clearSelectedItems,
} from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';
import qrCode from "../assets/qr.png"


const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const allCartItems = useSelector(selectCartItems);
  const selectedItemKeys = useSelector(selectSelectedItems);
  const subtotal = useSelector(selectCartSubtotal);
  const total = useSelector(selectCartTotal);
  const { discountCode, discountAmount } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Filter only selected items
  const cartItems = allCartItems.filter(item => 
    selectedItemKeys.includes(`${item.productId}-${item.variantId}`)
  );

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    ward: '',
    wardCode: '',
    district: '',
    districtCode: '',
    city: '',
    cityCode: '',
    note: '',
    paymentMethod: 'COD',
  });

  // Address data state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?.email) return user.email;
    return 'guest';
  };

  // Load provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(response.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        toast.error('Không thể tải danh sách tỉnh/thành phố');
      }
    };

    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.cityCode) {
        setDistricts([]);
        setWards([]);
        return;
      }

      setLoadingDistricts(true);
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/p/${formData.cityCode}?depth=2`
        );
        setDistricts(response.data.districts || []);
        setWards([]);
        
        // Reset district and ward when province changes
        setFormData(prev => ({
          ...prev,
          district: '',
          districtCode: '',
          ward: '',
          wardCode: ''
        }));
      } catch (error) {
        console.error('Error fetching districts:', error);
        toast.error('Không thể tải danh sách quận/huyện');
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [formData.cityCode]);

  // Load wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.districtCode) {
        setWards([]);
        return;
      }

      setLoadingWards(true);
      try {
        const response = await axios.get(
          `https://provinces.open-api.vn/api/d/${formData.districtCode}?depth=2`
        );
        setWards(response.data.wards || []);
        
        // Reset ward when district changes
        setFormData(prev => ({
          ...prev,
          ward: '',
          wardCode: ''
        }));
      } catch (error) {
        console.error('Error fetching wards:', error);
        toast.error('Không thể tải danh sách phường/xã');
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [formData.districtCode]);

  // Load user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Redirect if no items selected
  useEffect(() => {
    if (cartItems.length === 0 || selectedItemKeys.length === 0) {
      toast.info('Vui lòng chọn sản phẩm cần thanh toán!');
      navigate('/cart');
    }
  }, [cartItems, selectedItemKeys, navigate]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Shipping fee calculation
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const finalTotal = total + shippingFee;

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle province change
  const handleProvinceChange = (e) => {
    const selectedCode = e.target.value;
    const selectedProvince = provinces.find(p => p.code.toString() === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      cityCode: selectedCode,
      city: selectedProvince ? selectedProvince.name : '',
      districtCode: '',
      district: '',
      wardCode: '',
      ward: ''
    }));

    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }));
    }
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    const selectedCode = e.target.value;
    const selectedDistrict = districts.find(d => d.code.toString() === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      districtCode: selectedCode,
      district: selectedDistrict ? selectedDistrict.name : '',
      wardCode: '',
      ward: ''
    }));

    if (errors.district) {
      setErrors(prev => ({ ...prev, district: '' }));
    }
  };

  // Handle ward change
  const handleWardChange = (e) => {
    const selectedCode = e.target.value;
    const selectedWard = wards.find(w => w.code.toString() === selectedCode);
    
    setFormData(prev => ({
      ...prev,
      wardCode: selectedCode,
      ward: selectedWard ? selectedWard.name : ''
    }));

    if (errors.ward) {
      setErrors(prev => ({ ...prev, ward: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data with only selected items
      const orderData = {
        customer: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        payment: {
          method: formData.paymentMethod,
          subtotal: subtotal,
          shippingFee: shippingFee,
          discount: discountAmount,
          total: finalTotal,
        },
        note: formData.note,
        discountCode: discountCode,
      };

      console.log('Order Data:', orderData);

      // Try to call API first
      let orderSaved = false;
      try {
        const response = await axios.post('http://localhost:8080/api/orders', orderData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        console.log('Order created via API:', response.data);
        orderSaved = true;

      } catch (apiError) {
        console.log('API not available, saving to localStorage:', apiError.message);
        
        // Fallback: Save to localStorage for current user
        const userId = getUserId();
        const ordersKey = `orders_${userId}`;
        const existingOrders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        
        const newOrder = {
          id: `ORD-${Date.now()}`,
          orderDate: new Date().toISOString(),
          status: 'PENDING',
          items: orderData.items,
          shipping: {
            fullName: orderData.customer.fullName,
            phone: orderData.customer.phone,
            email: orderData.customer.email,
            address: orderData.shippingAddress.address,
            ward: orderData.shippingAddress.ward,
            district: orderData.shippingAddress.district,
            city: orderData.shippingAddress.city,
          },
          payment: orderData.payment,
          tracking: [
            {
              status: 'PENDING',
              time: new Date().toISOString(),
              description: 'Đơn hàng đã được đặt'
            }
          ],
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          note: orderData.note || '',
        };

        existingOrders.unshift(newOrder);
        localStorage.setItem(ordersKey, JSON.stringify(existingOrders));
        orderSaved = true;
      }

      if (orderSaved) {
        // Clear only selected items from cart
        dispatch(clearSelectedItems());

        // Show success message
        toast.success('Đặt hàng thành công!');

        // Redirect to orders page
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng</h1>
          <div className="flex items-center text-sm text-gray-600">
            <span
              onClick={() => navigate('/cart')}
              className="hover:text-[#3A6FB5] cursor-pointer"
            >
              Giỏ hàng
            </span>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-400">Thông tin giao hàng</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Shipping Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Thông tin khách hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0987654321"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Địa chỉ giao hàng
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* City/Province */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="cityCode"
                        value={formData.cityCode}
                        onChange={handleProvinceChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn Tỉnh/TP</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="districtCode"
                        value={formData.districtCode}
                        onChange={handleDistrictChange}
                        disabled={!formData.cityCode || loadingDistricts}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}
                        </option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      {errors.district && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.district}
                        </p>
                      )}
                    </div>

                    {/* Ward */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phường/Xã <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="wardCode"
                        value={formData.wardCode}
                        onChange={handleWardChange}
                        disabled={!formData.districtCode || loadingWards}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                          errors.ward ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}
                        </option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                      {errors.ward && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.ward}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ cụ thể <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (không bắt buộc)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none transition resize-none"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  {/* COD */}
                  <label className={`flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg transition hover:border-[#3A6FB5] ${
                    formData.paymentMethod === 'COD' ? 'border-[#3A6FB5] bg-blue-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#3A6FB5] mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`flex items-start space-x-3 cursor-pointer p-4 border-2 rounded-lg transition hover:border-[#3A6FB5] ${
                    formData.paymentMethod === 'BANK_TRANSFER' ? 'border-[#3A6FB5] bg-blue-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === 'BANK_TRANSFER'}
                      onChange={handleChange}
                      className="w-5 h-5 text-[#3A6FB5] mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          Chuyển khoản ngân hàng
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Chuyển khoản qua ngân hàng hoặc ví điện tử
                      </p>
                    </div>
                  </label>
                </div>

                {formData.paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50 text-center">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Quét mã QR để thanh toán
                    </h3>
                    <img
                      src={qrCode}
                      alt="QR chuyển khoản"
                      className="w-56 h-56 mx-auto mb-3 rounded-lg border"
                    />
                    <p className="text-sm text-gray-700">
                      💳 <span className="font-medium">Ngân hàng:</span> MB Bank
                      <br />
                      👤 <span className="font-medium">Chủ tài khoản:</span> NGHIEM XUAN QUAN
                      <br />
                      💰 <span className="font-medium">Số tiền:</span> {formatPrice(finalTotal)}  
                      <br />
                      📝 <span className="font-medium">Nội dung:</span> {formData.fullName || 'Tên khách hàng'}
                    </p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Thông tin đơn hàng ({cartItems.length} sản phẩm đã chọn)
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.color} / {item.size}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            x{item.quantity}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({discountCode}):</span>
                      <span className="font-medium">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 px-6 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Đặt hàng
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    Thông tin cá nhân của bạn sẽ được bảo mật tuyệt đối
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;