import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart } from 'lucide-react';
import { fetchTopLiked, selectTopLikedProducts } from '../features/wishlist/wishlistSlice';

const TopLikedProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const topLikedProducts = useSelector(selectTopLikedProducts);
  const { isLoading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchTopLiked());
  }, [dispatch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (!topLikedProducts || topLikedProducts.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-xs mb-1">SẢN PHẨM</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            ĐƯỢC YÊU THÍCH NHẤT
          </h2>
        </div>
        <button
          onClick={() => navigate('/wishlist')}
          className="flex items-center gap-1 text-[#3A6FB5] hover:text-[#2E5C99] text-sm font-medium transition"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 hide-scrollbar">
        <div className="flex gap-3 md:gap-4 lg:flex-nowrap lg:overflow-x-auto lg:gap-4 xl:justify-start hide-scrollbar">
          {topLikedProducts.slice(0, 8).map((product) => (
            <div
              key={product.productId}
              onClick={() => handleProductClick(product.productId)}
              className="flex-none w-[65%] md:w-[27.5%] lg:w-1/4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 relative overflow-hidden cursor-pointer"
            >
              <div className="block relative aspect-[3/4]">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={`http://localhost:8080/${product.images[0]}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                {/* Discount Badge */}
                {product.price?.discount_percent > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.price.discount_percent}%
                  </div>
                )}

                {/* Like Count Badge */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                  <span className="text-xs font-medium text-gray-700">
                    {product.likeCount || 0}
                  </span>
                </div>
              </div>

              <div className="p-3">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                  {product.brand || 'Unknown'}
                </p>
                <div className="block font-medium text-gray-800 text-[15px] leading-snug hover:text-[#3A6FB5] transition line-clamp-2">
                  {product.name}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[#111] font-bold text-[15px]">
                    {formatPrice(product.price?.discountPrice || product.price?.price || 0)}
                  </span>
                  {product.price?.price && product.price?.discountPrice && 
                   product.price.price > product.price.discountPrice && (
                    <>
                      <span className="text-gray-400 text-xs line-through ml-1">
                        {formatPrice(product.price.price)}
                      </span>
                      <span className="text-red-500 text-xs font-medium ml-1">
                        -{product.price.discount_percent}%
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Đã bán: {product.sold || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopLikedProducts;