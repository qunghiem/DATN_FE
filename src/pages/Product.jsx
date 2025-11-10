import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  CreditCard,
  RotateCcw,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { addToCart } from "../features/cart/cartSlice";
import { toast } from "react-toastify";

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

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching product ID:", productId);

        const response = await axios.get(
          `http://localhost:8080/api/products/${productId}`
          // `https://fnzv9bcp-8080.asse.devtunnels.ms/api/products/${productId}`
        );

        console.log("API Response:", response.data);

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
          brand: productData.brand?.name || "Unknown", // ← Thay đổi: lấy brand.name
          description: productData.description,
          price: {
            current:
              productData.price?.discount_price ||
              productData.price?.price ||
              0, // ← Thay đổi: discount_price
            original: productData.price?.price || 0, // ← Thay đổi: price là giá gốc
            currency: productData.price?.currency || "VND",
            discount_percent: productData.price?.discount_percent || 0,
          },
          // ← Thay đổi: xử lý images với image_url và alt_text
          images: Array.isArray(productData.images)
            ? productData.images.map(
                (img) => img.image_url || img.imageUrl || img
              )
            : [],
          variants: productData.variants || [],
          // ← Thay đổi: labels.name
          labels: Array.isArray(productData.labels)
            ? productData.labels.map((label) => label.name)
            : [],
          url: productData.url,
          total_count: productData.total_count || 0,
          is_wishlisted: productData.is_wishlisted || false,
          is_best_seller: productData.is_best_seller || false,
          is_new_arrival: productData.is_new_arrival || false,
        };

        console.log("Transformed product:", transformedProduct);

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
            ) // ← Thay đổi: brand.name
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: {
                current: p.price?.discount_price || p.price?.price || 0, // ← Thay đổi
                original: p.price?.price || 0, // ← Thay đổi
                discount_percent: p.price?.discount_percent || 0,
              },
              brand: p.brand?.name || "Unknown", // ← Thay đổi: brand.name
              // ← Thay đổi: image_url
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
      if (selectedVariant?.stock && quantity >= selectedVariant.stock) {
        toast.error(`Chỉ còn ${selectedVariant.stock} sản phẩm trong kho!`);
        return;
      }
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !selectedSize) {
      toast.warning("Vui lòng chọn kích thước!");
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    // Tạo variantId từ color và size nếu variant không có id
    const variantId =
      selectedVariant.id ||
      `${product.id}-${selectedColor.name}-${selectedSize}`;

    const cartItem = {
      productId: product.id,
      variantId: variantId, // ← Sử dụng variantId đã tạo
      name: product.name,
      price: product.price.current,
      image: selectedImage || product.images[0],
      color: selectedColor.name,
      size: selectedSize,
      quantity: quantity,
      stock: selectedVariant.stock,
    };

    console.log("🛒 Adding to cart:", cartItem);

    dispatch(addToCart(cartItem));

    // Log sau khi dispatch
    setTimeout(() => {
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      console.log("✅ Cart after adding:", currentCart);
      console.log("📊 Total items in cart:", currentCart.length);
    }, 100);

    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    if (!selectedVariant || !selectedSize) {
      toast.warning("Vui lòng chọn kích thước!");
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    // Tạo variantId từ color và size nếu variant không có id
    const variantId =
      selectedVariant.id ||
      `${product.id}-${selectedColor.name}-${selectedSize}`;

    dispatch(
      addToCart({
        productId: product.id,
        variantId: variantId, // ← Sử dụng variantId đã tạo
        name: product.name,
        price: product.price.current,
        image: selectedImage || product.images[0],
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
        stock: selectedVariant.stock,
      })
    );

    navigate("/place-order");
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
            <div className="flex-1 bg-gray-100 relative">
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
                onClick={() => setIsFavorite(!isFavorite)}
                className="ml-4"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
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
              <span className="text-gray-300">|</span>
              <div>
                Mã sản phẩm:{" "}
                <span className="text-[#3A6FB5] font-medium">
                  {product.slug}
                </span>
              </div>
            </div>

            {/* Flash Sale */}
            {product.price.discount_percent > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                <span className="text-pink-500 font-semibold text-sm">
                  GIẢM SỐC {product.price.discount_percent}%
                </span>
              </div>
            )}

            {/* Total Sold */}
            {product.sold === 0 && (
              <>
                <div className="text-sm text-gray-600">
                  Đã bán{" "}
                  <span className="font-semibold">{product.sold}</span>{" "}
                  sản phẩm
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        (product.total_count / 500) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </>
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
                  <button className="text-sm text-blue-600 underline">
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
              <div className="text-sm text-gray-600">
                Còn lại:{" "}
                <span className="font-semibold text-green-600">
                  {selectedVariant.stock}
                </span>{" "}
                sản phẩm
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
                    selectedVariant && quantity >= selectedVariant.stock
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
            <button className="py-4 border-b-2 border-black font-medium">
              Mô tả sản phẩm
            </button>
            <button className="py-4 text-gray-600 hover:text-gray-900">
              Chính sách giao hàng
            </button>
            <button className="py-4 text-gray-600 hover:text-gray-900">
              Chính sách đổi trả
            </button>
          </div>

          {product.description && (
            <div className="py-6">
              <div className="prose max-w-none">
                <p className="text-gray-700">{product.description}</p>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default Product;
