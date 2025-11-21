import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ChevronDown, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { fetchProductReviews, clearReviews } from '../features/reviews/reviewsSlice';

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { reviews, averageRating, totalElements, totalPages, currentPage, isLoading } = useSelector(
    (state) => state.reviews
  );

  const [selectedRating, setSelectedRating] = useState(null);
  const [page, setPage] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [allReviews, setAllReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [overallRating, setOverallRating] = useState(0);

  // Fetch all reviews for summary when component mounts
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews({ productId, rating: null, page: 0, size: 1000 }))
        .unwrap()
        .then((result) => {
          setAllReviews(result.data || []);
          setTotalReviews(result.totalElements || 0);
          setOverallRating(result.extra?.averageRating || 0);
        })
        .catch(() => {
          setAllReviews([]);
          setTotalReviews(0);
          setOverallRating(0);
        });
    }

    return () => {
      dispatch(clearReviews());
    };
  }, [productId, dispatch]);

  // Fetch filtered reviews with pagination
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews({ 
        productId, 
        rating: selectedRating, 
        page, 
        size: 5 
      }));
    }
  }, [productId, selectedRating, page, dispatch]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach((review) => {
      if (distribution.hasOwnProperty(review.rating)) {
        distribution[review.rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  const filterOptions = [
    { value: null, label: 'Tất cả đánh giá' },
    { value: 5, label: '5 sao', stars: 5 },
    { value: 4, label: '4 sao', stars: 4 },
    { value: 3, label: '3 sao', stars: 3 },
    { value: 2, label: '2 sao', stars: 2 },
    { value: 1, label: '1 sao', stars: 1 },
  ];

  const handleFilterChange = (rating) => {
    setSelectedRating(rating);
    setPage(0);
    setIsDropdownOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* First Page */}
        {startPage > 0 && (
          <>
            <button
              onClick={() => handlePageChange(0)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              1
            </button>
            {startPage > 1 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}

        {/* Page Numbers */}
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-4 py-2 rounded-lg border transition ${
              pageNum === page
                ? 'bg-[#3A6FB5] text-white border-[#3A6FB5]'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* Last Page */}
        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages - 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (isLoading && page === 0 && allReviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6FB5]"></div>
        <p className="text-gray-600 mt-2">Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá sản phẩm</h2>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {overallRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(overallRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">{totalReviews} đánh giá</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div
                    key={rating}
                    className="w-full flex items-center gap-2 text-sm p-2"
                  >
                    <div className="flex items-center gap-1 w-16">
                      <span className="font-medium">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter Dropdown */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-[#3A6FB5] transition-colors min-w-[200px] justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {filterOptions.find(opt => opt.value === selectedRating)?.label}
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              
              {/* Menu */}
              <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {filterOptions.map((option) => (
                  <button
                    key={option.value ?? 'all'}
                    onClick={() => handleFilterChange(option.value)}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                      selectedRating === option.value
                        ? 'bg-blue-50 text-[#3A6FB5] font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{option.label}</span>
                    {option.stars && (
                      <div className="flex gap-0.5">
                        {[...Array(option.stars)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                    {selectedRating === option.value && (
                      <span className="ml-2">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {selectedRating && (
            <button
              onClick={() => handleFilterChange(null)}
              className="text-sm text-[#3A6FB5] hover:underline font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
          {totalElements > 0 && (
            <span className="text-sm text-gray-600">
              Hiển thị {Math.min(page * 5 + 1, totalElements)}-{Math.min((page + 1) * 5, totalElements)} trong số {totalElements} đánh giá
            </span>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A6FB5]"></div>
            <p className="text-gray-600 mt-2">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {selectedRating 
                ? `Chưa có đánh giá ${selectedRating} sao` 
                : 'Chưa có đánh giá nào'}
            </h3>
            <p className="text-gray-600">
              {selectedRating 
                ? 'Hãy thử bỏ bộ lọc để xem tất cả đánh giá' 
                : 'Hãy là người đầu tiên đánh giá sản phẩm này!'}
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                {/* User Info & Date Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A6FB5] to-[#2d5a94] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {review.fullName ? review.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    
                    {/* User Name & Verified Badge */}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-base">
                        {review.fullName || 'Người dùng ẩn danh'}
                      </h4>
                      {review.orderId && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                            ✓ Đã mua hàng
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Date */}
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Variant Info */}
                {(review.color || review.size) && (
                  <div className="flex items-center gap-2 mb-3 bg-gray-50 px-3 py-2 rounded-md">
                    <span className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Phân loại:</span>
                      {review.color && <span className="ml-1 font-medium text-gray-800">{review.color}</span>}
                      {review.color && review.size && <span className="mx-1 text-gray-400">•</span>}
                      {review.size && <span className="font-medium text-gray-800">{review.size}</span>}
                    </span>
                  </div>
                )}

                {/* Title */}
                {review.title && (
                  <h5 className="font-semibold text-gray-900 mb-2 text-base">{review.title}</h5>
                )}

                {/* Comment */}
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))}

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;