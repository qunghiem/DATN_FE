import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  CreditCard,
  RotateCcw,
  Loader2,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  toggleWishlist,
  selectIsInWishlist,
} from "../features/wishlist/wishlistSlice";
import { addToCartAPI, selectCartItems } from "../features/cart/cartSlice";
import ProductReviews from "../components/ProductReviews";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const cartItems = useSelector(selectCartItems);
  // wishlist
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isInWishlist = useSelector(selectIsInWishlist(Number(productId)));

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // console.log("Fetching product ID:", productId);

        const response = await axios.get(
          `http://localhost:8080/api/products/${productId}`
        );

        // console.log("API Response:", response.data);

        const productData =
          response.data.data || response.data.result || response.data;

        if (!productData || !productData.id) {
          throw new Error("Product not found");
        }

        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          slug: productData.slug,
          sold: productData.sold,
          brand: productData.brand?.name || "Unknown",
          description: productData.description,
          price: {
            current:
              productData.price?.discount_price ||
              productData.price?.price ||
              0,
            original: productData.price?.price || 0,
            currency: productData.price?.currency || "VND",
            discount_percent: productData.price?.discount_percent || 0,
          },
          images: Array.isArray(productData.images)
            ? productData.images.map(
                (img) => img.image_url || img.imageUrl || img
              )
            : [],
          variants: productData.variants || [],
          labels: Array.isArray(productData.labels)
            ? productData.labels.map((label) => label.name)
            : [],
          url: productData.url,
          total_count: productData.total_count || 0,
          is_wishlisted: productData.is_wishlisted || false,
          is_best_seller: productData.is_best_seller || false,
          is_new_arrival: productData.is_new_arrival || false,
        };

        // console.log("Transformed product:", transformedProduct);

        setProduct(transformedProduct);
        setIsFavorite(transformedProduct.is_wishlisted);

        if (transformedProduct.images.length > 0) {
          setSelectedImage(transformedProduct.images[0]);
        }

        if (transformedProduct.variants.length > 0) {
          const firstVariant = transformedProduct.variants[0];
          setSelectedVariant(firstVariant);
          setSelectedSize(firstVariant.size);
          setSelectedColor({
            name: firstVariant.color_name,
            hex: firstVariant.color_hex,
            image: firstVariant.image,
          });
        }

        try {
          const relatedResponse = await axios.get(
            `http://localhost:8080/api/products`
          );

          const relatedData =
            relatedResponse.data.data ||
            relatedResponse.data.result ||
            relatedResponse.data;
          const relatedArray = Array.isArray(relatedData) ? relatedData : [];

          const filtered = relatedArray
            .filter(
              (p) =>
                p.id !== productData.id &&
                p.brand?.name === productData.brand?.name
            )
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: {
                current: p.price?.discount_price || p.price?.price || 0,
                original: p.price?.price || 0,
                discount_percent: p.price?.discount_percent || 0,
              },
              brand: p.brand?.name || "Unknown",
              image:
                p.images?.[0]?.image_url ||
                p.images?.[0]?.imageUrl ||
                p.images?.[0] ||
                "",
              url: p.url,
            }));

          setRelatedProducts(filtered);
        } catch (err) {
          console.log("Error fetching related products:", err);
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Không thể tải sản phẩm. Vui lòng thử lại sau."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      window.scrollTo(0, 0);
      fetchProduct();
    }
  }, [productId]);

  // Handlers
  const handleColorChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedSize(variant.size);
    setSelectedColor({
      name: variant.color_name,
      hex: variant.color_hex,
      image: variant.image,
    });
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  const handleSizeChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedSize(variant.size);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      if (!selectedVariant) return;

      // Kiểm tra số lượng đã có trong giỏ
      const existingCartItem = cartItems.find(
        (item) => item.productVariantId === selectedVariant.id
      );
      const currentQuantityInCart = existingCartItem
        ? existingCartItem.quantity
        : 0;
      const availableToAdd = selectedVariant.stock - currentQuantityInCart;

      if (quantity >= availableToAdd) {
        toast.warning(
          `Chỉ có thể thêm tối đa ${availableToAdd} sản phẩm! ` +
            `(Đã có ${currentQuantityInCart} trong giỏ hàng)`
        );
        return;
      }

      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || !selectedSize) {
      toast.warning("Vui lòng chọn kích thước!");
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/login");
      return;
    }

    // Kiểm tra số lượng đã có trong giỏ hàng
    const existingCartItem = cartItems.find(
      (item) => item.productVariantId === selectedVariant.id
    );

    const currentQuantityInCart = existingCartItem
      ? existingCartItem.quantity
      : 0;
    const totalQuantityAfterAdd = currentQuantityInCart + quantity;

    // Kiểm tra xem tổng số lượng có vượt quá stock không
    if (totalQuantityAfterAdd > selectedVariant.stock) {
      const remainingStock = selectedVariant.stock - currentQuantityInCart;

      if (remainingStock <= 0) {
        toast.error("Bạn đã thêm tối đa số lượng có sẵn vào giỏ hàng!");
        return;
      }

      toast.error(
        `Chỉ có thể thêm tối đa ${remainingStock} sản phẩm nữa. ` +
          `(Đã có ${currentQuantityInCart} trong giỏ hàng)`
      );
      return;
    }

    try {
      await dispatch(
        addToCartAPI({
          productId: product.id,
          productVariantId: selectedVariant.id,
          quantity: quantity,
        })
      ).unwrap();

      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);

      // Reset quantity về 1 sau khi thêm thành công
      setQuantity(1);
    } catch (error) {
      toast.error(error || "Không thể thêm vào giỏ hàng");
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || !selectedSize) {
      toast.warning("Vui lòng chọn kích thước!");
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
      return;
    }

    // Kiểm tra số lượng đã có trong giỏ hàng
    const existingCartItem = cartItems.find(
      (item) => item.productVariantId === selectedVariant.id
    );

    const currentQuantityInCart = existingCartItem
      ? existingCartItem.quantity
      : 0;
    const totalQuantityAfterAdd = currentQuantityInCart + quantity;

    if (totalQuantityAfterAdd > selectedVariant.stock) {
      const remainingStock = selectedVariant.stock - currentQuantityInCart;

      if (remainingStock <= 0) {
        toast.error("Bạn đã thêm tối đa số lượng có sẵn vào giỏ hàng!");
        return;
      }

      toast.error(
        `Chỉ có thể thêm tối đa ${remainingStock} sản phẩm nữa. ` +
          `(Đã có ${currentQuantityInCart} trong giỏ hàng)`
      );
      return;
    }

    try {
      await dispatch(
        addToCartAPI({
          productId: product.id,
          productVariantId: selectedVariant.id,
          quantity: quantity,
        })
      ).unwrap();

      // Chuyển đến trang đặt hàng
      navigate("/place-order");
    } catch (error) {
      toast.error(error || "Không thể thêm vào giỏ hàng");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const getUniqueColors = () => {
    const colorMap = new Map();
    product?.variants?.forEach((variant) => {
      if (!colorMap.has(variant.color_name)) {
        colorMap.set(variant.color_name, {
          name: variant.color_name,
          hex: variant.color_hex,
          image: variant.image,
          variant: variant,
        });
      }
    });
    return Array.from(colorMap.values());
  };

  // handle wishlist
  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      navigate("/login");
      return;
    }

    dispatch(toggleWishlist(Number(productId)));
  };

  const getVariantsByColor = (colorName) => {
    return product?.variants?.filter((v) => v.color_name === colorName) || [];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#3A6FB5] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-2 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <p className="text-gray-600 mb-4">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="px-6 py-2 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  const uniqueColors = getUniqueColors();
  const availableSizes = selectedColor
    ? getVariantsByColor(selectedColor.name)
    : product.variants;

  return (
    <div className="pt-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span
            onClick={() => navigate("/")}
            className="hover:text-[#3A6FB5] cursor-pointer"
          >
            Trang chủ
          </span>
          <span className="mx-2">/</span>
          <span
            onClick={() => navigate("/collection")}
            className="hover:text-[#3A6FB5] cursor-pointer"
          >
            Set đồ tập
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-400">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Images */}
          <div className="flex gap-4">
            {/* Thumbnail Images */}
            <div className="flex flex-col gap-3">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-24 border-2 cursor-pointer overflow-hidden ${
                    selectedImage === img
                      ? "border-gray-800"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={
                      typeof img === "string"
                        ? img
                        : img.image_url || img.imageUrl
                    }
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1relative">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-auto object-cover"
              />

              {/* Labels */}
              {product.labels && product.labels.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.labels.includes("Bán chạy") && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-md">
                      Bán chạy
                    </span>
                  )}
                  {product.labels.includes("Giảm giá") && (
                    <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
                      Giảm giá
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4">
            {/* Title & Favorite */}
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold text-gray-900 flex-1">
                {product.name}
              </h1>
              <button
                onClick={handleToggleWishlist}
                className="ml-4 hover:scale-110 transition"
                title={isInWishlist ? "Bỏ thích" : "Yêu thích"}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isInWishlist ? "text-red-500 fill-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            {/* Brand */}
            <div className="flex items-center gap-4 text-sm">
              <div>
                Thương hiệu:{" "}
                <span className="text-[#3A6FB5] font-medium">
                  {product.brand}
                </span>
              </div>
            </div>
            
              {/* Total Sold */}
             <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Đã bán <span className="font-semibold text-gray-900">{product.sold || 0}</span>
                {product.total_count > 0 && (
                  <span className="text-gray-500">/{product.total_count}</span>
                )}{" "}
                sản phẩm
              </div>
              {product.total_count > 0 && (
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        ((product.sold || 0) / product.total_count) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              )}
            </div>

            {/* Flash Sale */}
            {product.price.discount_percent > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                <span className="text-pink-500 font-semibold text-sm">
                  GIẢM SỐC {product.price.discount_percent}%
                </span>
              </div>
            )}

            {/* Price */}
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(product.price.current)}
                </span>
                {product.price.original &&
                  product.price.original > product.price.current && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product.price.original)}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                        -{product.price.discount_percent}%
                      </span>
                    </>
                  )}
              </div>
              {product.price.original &&
                product.price.original > product.price.current && (
                  <div className="text-sm text-gray-600 mt-1">
                    (Tiết kiệm{" "}
                    {formatPrice(
                      product.price.original - product.price.current
                    )}
                    )
                  </div>
                )}
            </div>

            {/* Colors */}
            {uniqueColors.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Màu sắc:{" "}
                  {selectedColor && (
                    <span className="text-gray-900">{selectedColor.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {uniqueColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color.variant)}
                      className={`w-10 h-10 rounded-full border-2 transition ${
                        selectedColor?.name === color.name
                          ? "border-[#3A6FB5] scale-110"
                          : "border-gray-300 hover:border-[#3A6FB5]"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {availableSizes && availableSizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    Kích thước:{" "}
                    {selectedSize && (
                      <span className="text-red-600">{selectedSize}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-blue-600 underline cursor-pointer hover:text-blue-800"
                  >
                    Hướng dẫn chọn size
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableSizes.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleSizeChange(variant)}
                      disabled={variant.stock === 0}
                      className={`px-4 py-2 border rounded-lg font-medium transition ${
                        selectedSize === variant.size
                          ? "border-[#3A6FB5] bg-[#3A6FB5] text-white"
                          : variant.stock === 0
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-300 hover:border-[#3A6FB5] text-gray-700"
                      }`}
                    >
                      {variant.size}
                      {variant.stock === 0 && (
                        <span className="block text-xs">(Hết hàng)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock info */}
            {selectedVariant && (
              <div className="text-sm">
                {(() => {
                  const existingCartItem = cartItems.find(
                    (item) => item.productVariantId === selectedVariant.id
                  );
                  const currentQuantityInCart = existingCartItem
                    ? existingCartItem.quantity
                    : 0;
                  const availableToAdd =
                    selectedVariant.stock - currentQuantityInCart;

                  return (
                    <>
                      <span className="text-gray-600">
                        Kho còn:{" "}
                        <span className="font-semibold text-green-600">
                          {selectedVariant.stock}
                        </span>{" "}
                        sản phẩm
                      </span>
                      {currentQuantityInCart > 0 && (
                        <span className="text-orange-600 ml-2">
                          (Đã có {currentQuantityInCart} trong giỏ, có thể thêm{" "}
                          {availableToAdd})
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-2 font-medium min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={
                    !selectedVariant ||
                    (() => {
                      const existingCartItem = cartItems.find(
                        (item) => item.productVariantId === selectedVariant?.id
                      );
                      const currentQuantityInCart = existingCartItem
                        ? existingCartItem.quantity
                        : 0;
                      const availableToAdd =
                        (selectedVariant?.stock || 0) - currentQuantityInCart;
                      return quantity >= availableToAdd;
                    })()
                  }
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-[#3A6FB5] text-[#3A6FB5] rounded-lg font-medium hover:bg-[#3A6FB5] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                THÊM VÀO GIỎ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="flex-1 px-6 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MUA NGAY
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Gọi đặt mua 1800.0000 (7:30 - 22:00)
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600">Giao hàng toàn quốc</p>
              </div>
              <div className="text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600">
                  Tích điểm tất cả sản phẩm
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600">
                  Giảm 5% khi mua sắm online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description Tabs */}
        <div className="mt-12 border-t">
          <div className="flex gap-8 border-b">
            <button
              onClick={() => setActiveTab("description")}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === "description"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === "reviews"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Đánh giá
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === "shipping"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Chính sách giao hàng
            </button>
            <button
              onClick={() => setActiveTab("return")}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === "return"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Chính sách đổi trả
            </button>
          </div>

          <div className="py-6">
            {activeTab === "description" && product.description && (
              <div className="prose max-w-none">
                <span className="font-bold">{product.name}</span>
                <span className="text-gray-700 whitespace-pre-line">{product.description}</span>
              </div>
            )}

            {activeTab === "reviews" && (
              <ProductReviews productId={productId} />
            )}

            {activeTab === "shipping" && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold mb-4">Chính sách giao hàng</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Giao hàng toàn quốc, nhận hàng trong 2-5 ngày</li>
                  <li>• Miễn phí giao hàng cho đơn từ 500.000đ</li>
                  <li>• Kiểm tra hàng trước khi thanh toán</li>
                  <li>• Hỗ trợ đổi size trong 7 ngày</li>
                </ul>
              </div>
            )}

            {activeTab === "return" && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-bold mb-4">Chính sách đổi trả</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Đổi hàng trong vòng 7 ngày nếu lỗi nhà sản xuất</li>
                  <li>• Sản phẩm chưa qua sử dụng, còn nguyên tem mác</li>
                  <li>• Hoàn tiền 100% nếu sản phẩm lỗi</li>
                  <li>• Liên hệ hotline 1800.0000 để được hỗ trợ</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Sản phẩm cùng loại
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/product/${item.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
                >
                  <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          Không có ảnh
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {item.brand && (
                      <p className="text-xs text-gray-500 mb-1 uppercase">
                        {item.brand}
                      </p>
                    )}
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <span className="text-red-600 font-bold">
                        {formatPrice(item.price?.current)}
                      </span>
                      {item.price?.original &&
                        item.price.original > item.price.current && (
                          <span className="text-gray-400 text-xs line-through">
                            {formatPrice(item.price.original)}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Hướng dẫn chọn size
              </h2>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Intro */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Lưu ý:</strong> Để chọn size phù hợp nhất, vui lòng đo
                  số đo cơ thể của bạn và đối chiếu với bảng size bên dưới. Nếu
                  bạn có thắc mắc, vui lòng liên hệ hotline{" "}
                  <strong>1800.0000</strong> để được tư vấn.
                </p>
              </div>

              {/* How to Measure */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cách đo số đo cơ thể
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      1. Vòng ngực
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Đo vòng quanh phần rộng nhất của ngực, giữ thước dây nằm
                      ngang và song song với mặt đất.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      2. Vòng eo
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Đo vòng quanh phần nhỏ nhất của eo, thường là phần trên
                      rốn.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      3. Vòng mông
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Đo vòng quanh phần rộng nhất của mông, giữ thước dây nằm
                      ngang.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      4. Chiều cao
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Đứng thẳng, đo từ đỉnh đầu đến gót chân khi không đi giày.
                    </p>
                  </div>
                </div>
              </div>

              {/* Women's Size Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bảng size nữ
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Size
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Chiều cao (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Cân nặng (kg)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Vòng ngực (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Vòng eo (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Vòng mông (cm)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          XS
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          150-155
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          42-48
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          78-82
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          60-64
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          84-88
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          S
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          155-160
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          48-53
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          82-86
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          64-68
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          88-92
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          M
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          160-165
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          53-58
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          86-90
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          68-72
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          92-96
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          L
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          165-170
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          58-63
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          90-94
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          72-76
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          96-100
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          XL
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          170-175
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          63-68
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          94-98
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          76-80
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          100-104
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Men's Size Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bảng size nam
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Size
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Chiều cao (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Cân nặng (kg)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Vòng ngực (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Vòng eo (cm)
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                          Vòng mông (cm)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          S
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          160-165
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          55-60
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          86-90
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          70-74
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          90-94
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          M
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          165-170
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          60-68
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          90-94
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          74-78
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          94-98
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          L
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          170-175
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          68-75
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          94-98
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          78-82
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          98-102
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          XL
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          175-180
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          75-82
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          98-102
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          82-86
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          102-106
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          XXL
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          180-185
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          82-90
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          102-106
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          86-90
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          106-110
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  💡 Một số lưu ý khi chọn size:
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    • Nếu số đo của bạn nằm giữa 2 size, hãy chọn size lớn hơn
                    để thoải mái hơn khi vận động.
                  </li>
                  <li>
                    • Với đồ tập gym/yoga, nên chọn size vừa khít để tối ưu hiệu
                    quả tập luyện.
                  </li>
                  <li>
                    • Vải thể thao có độ co giãn tốt, nên bạn không cần lo lắng
                    về việc quá chật.
                  </li>
                  <li>
                    • Mỗi dòng sản phẩm có thể có độ vừa vặn khác nhau, hãy xem
                    đánh giá từ khách hàng khác.
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  Vẫn chưa chắc chắn về size của mình?
                </p>
                <p className="text-sm font-medium text-gray-900">
                  Liên hệ ngay với chúng tôi qua hotline:{" "}
                  <span className="text-[#3A6FB5]">1800.0000</span> hoặc chat
                  trực tuyến để được tư vấn miễn phí!
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="px-8 py-3 bg-[#3A6FB5] text-white rounded-lg font-medium hover:bg-[#2E5C99] transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
