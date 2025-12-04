import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { clearSelectedItems } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const PaymentReturn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Get all query parameters from URL
        const queryString = window.location.search;
        
        console.log('=== PAYMENT RETURN DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Query String:', queryString);
        
        // Call backend to verify payment
        const response = await axios.get(
          `${VITE_API_URL}/api/v1/payments/return${queryString}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );

        console.log('Payment verification response:', response.data);

        if (response.data && response.data.success) {
          // Payment successful
          setPaymentInfo(response.data);
          setStatus('success');
          
          // Clear cart
          dispatch(clearSelectedItems());
          
          // Show success message
          toast.success('Thanh toán thành công!');
          
          // Redirect to orders after 3 seconds
          setTimeout(() => {
            navigate('/orders');
          }, 10000);
          
        } else {
          // Payment failed
          setStatus('error');
          setError(response.data?.message || 'Thanh toán thất bại');
          toast.error('Thanh toán thất bại!');
          
          // Redirect to orders after 5 seconds
          setTimeout(() => {
            navigate('/orders');
          }, 5000);
        }
        
      } catch (error) {
        console.error('Error processing payment return:', error);
        setStatus('error');
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực thanh toán');
        toast.error('Có lỗi xảy ra khi xác thực thanh toán');
        
        // Redirect to orders after 5 seconds
        setTimeout(() => {
          navigate('/orders');
        }, 5000);
      }
    };

    processPaymentReturn();
  }, [dispatch, navigate]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + '₫';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Processing State */}
        {status === 'processing' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Đang xác thực thanh toán
            </h2>
            <p className="text-gray-600">
              Vui lòng đợi trong giây lát...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && paymentInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Thanh toán thành công!
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              Đơn hàng của bạn đã được thanh toán thành công
            </p>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium text-gray-900">#{paymentInfo.orderId}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatPrice(paymentInfo.amount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ngân hàng:</span>
                <span className="font-medium text-gray-900">{paymentInfo.bankCode}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mã giao dịch VNPay:</span>
                <span className="font-medium text-gray-900">
                  {paymentInfo.vnpayTransactionNo}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Mã giao dịch:</span>
                <span className="font-medium text-gray-900 text-xs">
                  {paymentInfo.transactionId}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full px-6 py-3 bg-[#3A6FB5] text-white rounded-lg font-medium hover:bg-[#2E5C99] transition"
              >
                Xem đơn hàng
              </button>
              
              <button
                onClick={() => navigate('/collection')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Tự động chuyển về trang đơn hàng sau 10 giây...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Thanh toán thất bại
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              {error || 'Đã có lỗi xảy ra trong quá trình thanh toán'}
            </p>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium mb-1">
                    Có thể do một trong các lý do sau:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>Hủy thanh toán trên trang VNPay</li>
                    <li>Số dư tài khoản không đủ</li>
                    <li>Phiên giao dịch hết hạn</li>
                    <li>Thông tin thanh toán không chính xác</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
              >
                Xem đơn hàng
              </button>
              
              <button
                onClick={() => navigate('/cart')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Quay lại giỏ hàng
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Tự động chuyển về trang đơn hàng sau 10 giây...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;