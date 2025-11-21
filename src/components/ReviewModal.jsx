import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Star } from 'lucide-react';
import { createReview, clearMessages } from '../features/reviews/reviewsSlice';
import { toast } from 'react-toastify';

const ReviewModal = ({ order, item, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading, error, success } = useSelector((state) => state.reviews);

  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
      if (onSuccess) onSuccess();
      onClose();
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [success, error, dispatch, onClose, onSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.warning('Vui lòng nhập nhận xét!');
      return;
    }

    if (comment.trim().length < 10) {
      toast.warning('Nhận xét phải có ít nhất 10 ký tự!');
      return;
    }

    try {
      await dispatch(
        createReview({
          orderId: order.id,
          productVariantId: item.variantId,
          rating,
          comment: comment.trim(),
        })
      ).unwrap();
    } catch (err) {
      // Error handled in useEffect
    }
  };

  const getRatingLabel = (value) => {
    const labels = {
      1: 'Rất không hài lòng',
      2: 'Không hài lòng',
      3: 'Bình thường',
      4: 'Hài lòng',
      5: 'Rất hài lòng',
    };
    return labels[value] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-20 h-20 flex-shrink-0 bg-white rounded overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {item.color} / {item.size}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              {getRatingLabel(hoveredRating || rating)}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét của bạn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none resize-none"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Tối thiểu 10 ký tự, tối đa 500 ký tự
              </p>
              <p className="text-xs text-gray-500">
                {comment.length}/500
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>💡 Mẹo viết đánh giá hay:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
              <li>Chia sẻ trải nghiệm thực tế của bạn</li>
              <li>Đánh giá chất lượng sản phẩm, độ vừa vặn, chất liệu</li>
              <li>Cho biết ưu điểm và nhược điểm (nếu có)</li>
              <li>Sử dụng ngôn ngữ lịch sự, tránh từ ngữ không phù hợp</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || !comment.trim() || comment.trim().length < 10}
              className="flex-1 px-6 py-3 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;