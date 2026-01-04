import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchWishlist,
  toggleWishlist,
  clearMessages,
  selectWishlistItems,
  selectWishlistCount,
} from "../features/wishlist/wishlistSlice";
import { addToCartAPI } from "../features/cart/cartSlice";
import { Heart, ShoppingCart, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "react-toastify";
import RecommendedProducts from "../components/RecommendedProducts";
import React, { useState, useRef } from "react";

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const savedRef = useRef(null);
  const [savedCount, setSavedCount] = useState(0);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector(selectWishlistItems);
  const wishlistCount = useSelector(selectWishlistCount);
  const { isLoading, error, success } = useSelector((state) => state.wishlist);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xem danh sách yêu thích");
      navigate("/login");
      return;
    }

    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
  }, [error, success, dispatch]);

  const handleRemoveFromWishlist = (productId) => {
    dispatch(toggleWishlist(productId)).then(() => {
      dispatch(fetchWishlist());
    });
  };

  const handleAddToCart = (product) => {
    // Giả sử chúng ta lấy variant đầu tiên (có thể cải thiện)
    const cartItem = {
      productId: product.productId,
      variantId: `${product.productId}-default`, // Tạm thời
      name: product.name,
      price: product.price?.discountPrice || product.price?.price || 0,
      image: product.images?.[0] || "",
      color: "Default",
      size: "Default",
      quantity: 1,
      stock: 100, // Default stock
    };

    dispatch(addToCartAPI(cartItem));
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Sản phẩm yêu thích
          </h1>
          <p className="text-gray-600 mt-2">{wishlistCount} sản phẩm</p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 text-[#3A6FB5] animate-spin" />
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Chưa có sản phẩm yêu thích
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy thêm sản phẩm vào danh sách yêu thích để xem lại sau!
            </p>
            <button
              onClick={() => navigate("/collection")}
              className="px-6 py-3 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.productId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
              >
                {/* Product Image */}
                <div
                  onClick={() => handleProductClick(product.productId)}
                  className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={(() => {
                        const firstImage = product.images[0];

                        // Nếu là string đơn giản
                        if (typeof firstImage === "string") {
                          return firstImage;
                        }

                        // Nếu là object với image_url hoặc imageUrl
                        if (typeof firstImage === "object") {
                          return (
                            firstImage.image_url ||
                            firstImage.imageUrl ||
                            firstImage.url ||
                            ""
                          );
                        }

                        return "";
                      })()}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.productId);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition z-10"
                    title="Xóa khỏi yêu thích"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  {/* Discount Badge */}
                  {product.price?.discount_percent > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{product.price.discount_percent}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand */}
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.brand || "Unknown"}
                  </p>

                  {/* Product Name */}
                  <h3
                    onClick={() => handleProductClick(product.productId)}
                    className="font-medium text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-[#3A6FB5] transition"
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(
                        product.price?.discountPrice ||
                          product.price?.price ||
                          0
                      )}
                    </span>
                    {product.price?.price &&
                      product.price.discountPrice &&
                      product.price.price > product.price.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price.price)}
                        </span>
                      )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Đã bán: {product.sold || 0}</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {product.likeCount || 0}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
       
      </div>
    </div>
  );
};

export default Wishlist;
