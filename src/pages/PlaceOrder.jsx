import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  User,
  CreditCard,
  Truck,
  Package,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader,
  Gift,
} from 'lucide-react';
import { clearSelectedItems } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from navigation state (passed from Cart)
  const { 
    selectedCartItems, 
    appliedVoucher, 
    discountAmount: passedDiscountAmount 
  } = location.state || {};

  // Use the passed items directly
  const cartItems = selectedCartItems || [];
  
  // Redux state (only for user auth)
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Calculate values from passed data
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.itemTotalPrice || item.price * item.quantity || 0);
  }, 0);
  
  const discountAmount = passedDiscountAmount || 0;
  const discountCode = appliedVoucher?.code || '';

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

  // Payment state
  const [paymentUrl, setPaymentUrl] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null); // Store full order response

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserId = () => {
    if (user?.id) return user.id;
    if (user?.email) return user.email;
    return 'guest';
  };

  // Redirect if no items selected
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      toast.info('Vui lòng chọn sản phẩm cần thanh toán!');
      navigate('/cart');
    }
  }, [cartItems, navigate]);

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

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  // Shipping fee calculation
  const isFreeship = appliedVoucher?.discountType === 'FREESHIP';
  const shippingFee = isFreeship ? 0 : (subtotal >= 500000 ? 0 : 30000);
  const finalTotal = subtotal - discountAmount + shippingFee;

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // Create payment URL using VNPay
  const createPaymentUrl = async (orderId) => {
    setLoadingPayment(true);
    try {
      console.log('Creating payment URL with orderId:', orderId);
      
      const paymentData = {
        orderId: orderId,
        bankCode: 'NCB'
      };
      
      console.log('Payment request data:', paymentData);
      
      const response = await axios.post(
        'http://localhost:8080/api/v1/payments/create',
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Payment API response:', response.data);

      if (response.data && response.data.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
        toast.success('Đã tạo link thanh toán! Vui lòng click vào nút để thanh toán');
        return response.data.paymentUrl;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error) {
      console.error('Error creating payment URL:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        orderId: orderId
      });
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Không thể tạo link thanh toán');
      }
      return null;
    } finally {
      setLoadingPayment(false);
    }
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
      // Build full address string
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      
      // Validate address
      if (fullAddress.length > 500) {
        toast.error('Địa chỉ quá dài! Vui lòng rút gọn địa chỉ.');
        setIsSubmitting(false);
        return;
      }

      // Prepare order data according to API format
      const orderData = {
        paymentMethod: formData.paymentMethod,
        address: fullAddress,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        rewardPointsToUse: 0, // Default to 0, can be enhanced later
        cartItemIds: cartItems.map(item => {
          // Ensure IDs are numbers
          const id = Number(item.id);
          if (isNaN(id)) {
            console.error('Invalid cart item ID:', item.id, item);
            return null;
          }
          return id;
        }).filter(id => id !== null), // Remove any null values
        voucherCodes: discountCode ? [discountCode] : [], // Add voucher code if applied
      };

      // Add note if provided
      if (formData.note && formData.note.trim()) {
        orderData.note = formData.note.trim();
      }

      // Validate cartItemIds
      if (!orderData.cartItemIds || orderData.cartItemIds.length === 0) {
        toast.error('Không tìm thấy sản phẩm trong giỏ hàng!');
        setIsSubmitting(false);
        return;
      }

      console.log('=== ORDER SUBMISSION DEBUG ===');
      console.log('Order Data:', orderData);
      console.log('Cart Items:', cartItems);
      console.log('Cart Item IDs:', orderData.cartItemIds);
      console.log('Full Address:', fullAddress);
      console.log('Token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
      console.log('=============================');

      // Try to call API first
      let orderSaved = false;
      let orderId = null;
      let orderResponse = null;

      try {
        const response = await axios.post('http://localhost:8080/api/orders', orderData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        console.log('Full API Response:', response);
        console.log('Response data:', response.data);
        
        if (response.data.code === 1000) {
          orderResponse = response.data.result;
          orderId = orderResponse.id;
          setOrderResponse(orderResponse); // Store the full response
          orderSaved = true;
          
          console.log('✅ Order created successfully with ID:', orderId);
        } else {
          throw new Error(response.data.message || 'Không thể tạo đơn hàng');
        }

      } catch (apiError) {
        console.error('❌ API ERROR DETAILS:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          requestData: orderData
        });
        
        // Show specific error message from backend
        if (apiError.response?.data?.message) {
          toast.error(apiError.response.data.message);
        } else if (apiError.response?.status === 400) {
          toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!');
        } else if (apiError.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          toast.error('Không thể tạo đơn hàng. Vui lòng thử lại!');
        }
        
        setIsSubmitting(false);
        return; // Stop here, don't proceed
      }

      if (orderSaved && orderId) {
        // If payment method is BANK_TRANSFER, create payment URL
        if (formData.paymentMethod === 'BANK_TRANSFER') {
          console.log('Creating payment URL for order:', orderId);
          
          const paymentUrlResult = await createPaymentUrl(orderId);
          
          if (!paymentUrlResult) {
            toast.error('Đơn hàng đã được tạo nhưng không thể tạo link thanh toán. Vui lòng liên hệ hỗ trợ!');
            setIsSubmitting(false);
            
            // Still navigate to orders since order was created
            setTimeout(() => {
              dispatch(clearSelectedItems());
              navigate('/orders');
            }, 2000);
            return;
          }
          
          // Don't navigate away yet - let user click the payment link
          toast.success('Đơn hàng đã được tạo! Vui lòng thanh toán qua link bên dưới');
          
          // Show reward points info if available
          if (orderResponse && orderResponse.rewardPointsEarned) {
            toast.info(`Bạn sẽ nhận được ${orderResponse.rewardPointsEarned.toLocaleString()} điểm thưởng sau khi thanh toán!`);
          }
        } else {
          // COD - just clear and navigate
          dispatch(clearSelectedItems());
          toast.success('Đặt hàng thành công!');
          
          // Show reward points info if available
          if (orderResponse && orderResponse.rewardPointsEarned) {
            toast.info(`Bạn sẽ nhận được ${orderResponse.rewardPointsEarned.toLocaleString()} điểm thưởng!`);
          }
          
          setTimeout(() => {
            navigate('/orders');
          }, 1500);
        }
      }

    } catch (error) {
      console.error('❌ UNEXPECTED ERROR:', error);
      toast.error(
        error.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening payment URL
  const handleOpenPaymentUrl = () => {
    if (paymentUrl) {
      // Inform user about the flow
      toast.info('Sau khi thanh toán xong, VNPay sẽ tự động chuyển bạn về trang kết quả');
      
      // Open VNPay in same tab (so it can redirect back)
      window.location.href = paymentUrl;
      
      // Note: VNPay will redirect back to /payment-return with payment result
      // No need for polling as VNPay callback will handle everything
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
                        Chuyển khoản qua VNPay (NCB Bank)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Payment URL Display */}
                {paymentUrl && formData.paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-4 p-4 border-2 border-green-300 rounded-lg bg-green-50">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Link thanh toán đã sẵn sàng!
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">
                          Click vào nút bên dưới để chuyển đến trang thanh toán VNPay
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenPaymentUrl}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Thanh toán ngay
                        </button>
                        <p className="text-xs text-gray-600 mt-3">
                          💡 Sau khi thanh toán, bạn sẽ được tự động chuyển về trang kết quả
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {loadingPayment && (
                  <div className="mt-4 p-4 border border-blue-300 rounded-lg bg-blue-50 flex items-center gap-3">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-800">
                      Đang tạo link thanh toán...
                    </span>
                  </div>
                )}
              </div>
            </div>
  
            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-[#3A6FB5]" />
                  Thông tin đơn hàng ({cartItems.length} sản phẩm)
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.variantId}-${index}`}
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
                      <span>Giảm giá {discountCode && `(${discountCode})`}:</span>
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
                {!paymentUrl && (
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
                )}

                {/* Reward Points Info (after order created) */}
                {orderResponse && orderResponse.rewardPointsEarned > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Gift className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">
                          Điểm thưởng
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Bạn sẽ nhận được <span className="font-bold">{orderResponse.rewardPointsEarned.toLocaleString()}</span> điểm sau khi hoàn thành đơn hàng
                        </p>
                        {orderResponse.userRemainingRewardPoints !== undefined && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Điểm hiện tại: {orderResponse.userRemainingRewardPoints.toLocaleString()} điểm
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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