import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Trash2, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { fetchAllReviews, deleteReviewAdmin, clearMessages } from '../../features/admin/adminReviewsSlice';
import { toast } from 'react-toastify';

const AdminReviews = () => {
  const dispatch = useDispatch();
  const { reviews, totalPages, totalElements, currentPage, averageRating, isLoading, error, success } = useSelector(
    (state) => state.adminReviews
  );

  const [page, setPage] = useState(0);
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchProductId, setSearchProductId] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [page, selectedRating]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [success, error, dispatch]);

  const loadReviews = () => {
    const productId = searchProductId.trim() ? parseInt(searchProductId) : null;
    dispatch(fetchAllReviews({ 
      page, 
      size: 10, 
      rating: selectedRating,
      productId 
    }));
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      await dispatch(deleteReviewAdmin(reviewId));
      loadReviews();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadReviews();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        {startPage > 0 && (
          <>
            <button onClick={() => handlePageChange(0)} className="px-3 py-1 rounded border hover:bg-gray-50">
              1
            </button>
            {startPage > 1 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-1 rounded border ${
              pageNum === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        {endPage < totalPages - 1 && (
          <>
            {endPage < totalPages - 2 && <span className="px-2">...</span>}
            <button onClick={() => handlePageChange(totalPages - 1)} className="px-3 py-1 rounded border hover:bg-gray-50">
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages - 1}
          className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đánh giá</h1>
          <p className="text-gray-600 mt-1">
            Tổng số: {totalElements} đánh giá
            {averageRating > 0 && (
              <span className="ml-3 inline-flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4 items-end">
          {/* Search by Product ID */}
          <form onSubmit={handleSearch} className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm theo ID sản phẩm
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={searchProductId}
                onChange={(e) => setSearchProductId(e.target.value)}
                placeholder="Nhập ID sản phẩm..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search size={18} />
                Tìm
              </button>
            </div>
          </form>

          {/* Filter by Rating */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo sao
            </label>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 min-w-[150px] justify-between"
            >
              <span>{selectedRating ? `${selectedRating} sao` : 'Tất cả'}</span>
              <Filter size={16} />
            </button>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg z-20 w-full">
                  {[null, 5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating ?? 'all'}
                      onClick={() => {
                        setSelectedRating(rating);
                        setPage(0);
                        setFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        selectedRating === rating ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {rating ? `${rating} sao` : 'Tất cả'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear Filters */}
          {(selectedRating || searchProductId) && (
            <button
              onClick={() => {
                setSelectedRating(null);
                setSearchProductId('');
                setPage(0);
              }}
              className="px-4 py-2 text-blue-600 hover:underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Đang tải...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">Không có đánh giá nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nội dung</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phân loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviews.map((review, index) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{page * 10 + index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {review.fullName || 'N/A'}
                        </div>
                        {review.orderId && (
                          <div className="text-xs text-gray-500">
                            Order ID: {review.orderId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {review.productName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {review.productId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(review.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {review.comment}
                        </div>
                        {review.title && (
                          <div className="text-xs text-gray-500 mt-1">
                            {review.title}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {review.color && <span>{review.color}</span>}
                        {review.color && review.size && <span> / </span>}
                        {review.size && <span>{review.size}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                          title="Xóa đánh giá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Summary */}
            <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
              Hiển thị {page * 10 + 1}-{Math.min((page + 1) * 10, totalElements)} trong số {totalElements} đánh giá
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;