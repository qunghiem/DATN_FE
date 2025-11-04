import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingCart, Facebook, Share2 } from "lucide-react";
import axios from "axios";

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("=== FETCHING PRODUCT ===");
        console.log("Product ID:", id);
        console.log("API URL:", `http://localhost:8080/api/products/${id}`);

        // Fetch product details
        const response = await axios.get(
          `http://localhost:8080/api/products/${id}`
        );

        console.log("=== RAW API RESPONSE ===");
        console.log("Response status:", response.status);
        console.log("Response data:", response.data);
        console.log("Response data type:", typeof response.data);
        console.log("Response data keys:", Object.keys(response.data));

        // Try to find product data in different possible locations
        let productData = null;
        
        // Check all possible paths
        if (response.data.data) {
          console.log("Found data in response.data.data");
          productData = response.data.data;
        } else if (response.data.result) {
          console.log("Found data in response.data.result");
          productData = response.data.result;
        } else if (response.data.product) {
          console.log("Found data in response.data.product");
          productData = response.data.product;
        } else if (response.data.id) {
          console.log("Found data directly in response.data");
          productData = response.data;
        } else {
          console.error("Cannot find product data in response");
          console.log("Response structure:", JSON.stringify(response.data, null, 2));
          throw new Error("Invalid API response structure - cannot find product data");
        }

        console.log("=== PRODUCT DATA ===");
        console.log("Product data:", productData);
        console.log("Product data type:", typeof productData);
        console.log("Product data keys:", productData ? Object.keys(productData) : "null");

        if (!productData || !productData.id) {
          throw new Error("Product data is invalid or missing ID");
        }

        // Get thumbnail image
        console.log("Processing images...");
        console.log("Images array:", productData.images);
        
        const thumbnailImage = productData.images?.find(img => img.isThumbnail)?.imageUrl 
          || productData.images?.[0]?.imageUrl 
          || "";
        
        console.log("Selected thumbnail:", thumbnailImage);

        // Extract unique colors from variants
        console.log("Processing variants...");
        console.log("Variants array:", productData.variants);
        
        const uniqueColors = [];
        const colorMap = new Map();
        
        if (productData.variants && Array.isArray(productData.variants)) {
          productData.variants.forEach(variant => {
            if (variant.colorId && !colorMap.has(variant.colorId)) {
              const colorInfo = {
                id: variant.colorId,
                name: getColorName(variant.colorId),
                code: getColorCode(variant.colorId),
                image: variant.images?.[0] || thumbnailImage
              };
              colorMap.set(variant.colorId, colorInfo);
              uniqueColors.push(colorInfo);
            }
          });
        }
        
        console.log("Extracted colors:", uniqueColors);

        // Extract unique sizes from variants
        const uniqueSizes = new Set();
        if (productData.variants && Array.isArray(productData.variants)) {
          productData.variants.forEach(variant => {
            if (variant.sizeId) {
              uniqueSizes.add(getSizeName(variant.sizeId));
            }
          });
        }
        
        console.log("Extracted sizes:", Array.from(uniqueSizes));

        // Transform product data
        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.discountPrice || productData.price,
          originalPrice: productData.discountPrice ? productData.price : null,
          discount: productData.discountPercent,
          brand: getBrandName(productData.brandId),
          stock: productData.stock,
          sku: productData.sku,
          slug: productData.slug,
          
          // Images
          images: productData.images?.map(img => img.imageUrl) || [],
          image: thumbnailImage,
          
          // Variants
          colors: uniqueColors,
          sizes: Array.from(uniqueSizes),
        };

        console.log("=== TRANSFORMED PRODUCT ===");
        console.log(transformedProduct);

        setProduct(transformedProduct);
        setSelectedImage(thumbnailImage);
        
        if (uniqueColors.length > 0) {
          setSelectedColor(uniqueColors[0]);
        }

        console.log("=== PRODUCT SET SUCCESSFULLY ===");

        // Fetch related products
        try {
          console.log("Fetching related products...");
          const relatedResponse = await axios.get(
            `http://localhost:8080/api/products`
          );
          
          const relatedData = relatedResponse.data.data || relatedResponse.data.result || relatedResponse.data;
          const relatedArray = Array.isArray(relatedData) ? relatedData : [];
          
          const filtered = relatedArray
            .filter(p => p.id !== parseInt(id))
            .slice(0, 5)
            .map(p => ({
              id: p.id,
              name: p.name,
              price: p.discountPrice || p.price,
              originalPrice: p.discountPrice ? p.price : null,
              discount: p.discountPercent,
              brand: getBrandName(p.brandId),
              image: p.images?.find(img => img.isThumbnail)?.imageUrl || p.images?.[0]?.imageUrl,
              stock: p.stock,
            }));
          
          setRelatedProducts(filtered);
          console.log("Related products set:", filtered.length);
        } catch (err) {
          console.log("Error fetching related products:", err);
          setRelatedProducts([]);
        }

      } catch (err) {
        console.error("=== ERROR FETCHING PRODUCT ===");
        console.error("Error:", err);
        console.error("Error message:", err.message);
        console.error("Error response:", err.response?.data);
        
        setError(
          err.response?.data?.message || err.message || "Không thể tải sản phẩm. Vui lòng thử lại sau."
        );
      } finally {
        console.log("=== SETTING LOADING TO FALSE ===");
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      console.error("No product ID provided");
      setIsLoading(false);
      setError("Không tìm thấy ID sản phẩm");
    }
  }, [id]);

  // Helper functions
  const getBrandName = (brandId) => {
    const brands = {
      1: "KHÁC",
      2: "YIHLI",
      3: "PUMA",
      4: "EGA",
      5: "NIKE",
      6: "ADIDAS",
    };
    return brands[brandId] || "KHÁC";
  };

  const getColorName = (colorId) => {
    const colorNames = {
      1: "Đen",
      2: "Xanh Navy",
      3: "Trắng",
      4: "Đỏ",
      5: "Hồng",
      6: "Be",
      7: "Xám",
      8: "Xanh Dương",
      9: "Xanh Lá",
      10: "Vàng",
    };
    return colorNames[colorId] || `Màu ${colorId}`;
  };

  const getColorCode = (colorId) => {
    const colors = {
      1: "#000000",
      2: "#1e3a8a",
      3: "#FFFFFF",
      4: "#FF0000",
      5: "#FFC0CB",
      6: "#D2B48C",
      7: "#808080",
      8: "#3B82F6",
      9: "#10B981",
      10: "#FCD34D",
    };
    return colors[colorId] || "#CCCCCC";
  };

  const getSizeName = (sizeId) => {
    const sizes = {
      1: "XS",
      2: "S",
      3: "M",
      4: "L",
      5: "XL",
      6: "2XL",
      7: "3XL",
    };
    return sizes[sizeId] || `Size ${sizeId}`;
  };

  // Handlers
  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (color.image) {
      setSelectedImage(color.image);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      if (product.stock && quantity >= product.stock) {
        alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
        return;
      }
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }
    console.log("Add to cart:", {
      product,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    alert("Đã thêm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert("Vui lòng chọn kích thước!");
      return;
    }
    handleAddToCart();
    navigate("/place-order");
  };

  console.log("=== RENDER STATE ===");
  console.log("isLoading:", isLoading);
  console.log("error:", error);
  console.log("product:", product);

  // Loading state
  if (isLoading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
          <p className="text-xs text-gray-400 mt-2">ID: {id}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
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
          {/* Left: Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {selectedImage || product.image ? (
              <img
                src={selectedImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Image load error:", e.target.src);
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div 
              className="w-full h-full flex items-center justify-center absolute inset-0"
              style={{ display: (selectedImage || product.image) ? "none" : "flex" }}
            >
              <span className="text-gray-400">Không có ảnh</span>
            </div>

            {/* Social Share Buttons */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="text-sm text-gray-700 font-medium">Chia sẻ</span>
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                <Facebook className="w-4 h-4 text-blue-600" />
              </button>
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
                  className={`w-6 h-6 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                />
              </button>
            </div>

            {/* Brand & SKU */}
            <div className="flex items-center gap-4 text-sm">
              <div>
                Thương hiệu: <span className="text-[#3A6FB5] font-medium">{product.brand}</span>
              </div>
              {product.sku && (
                <>
                  <span className="text-gray-300">|</span>
                  <div>
                    Mã sản phẩm: <span className="text-[#3A6FB5] font-medium">{product.sku}</span>
                  </div>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-red-600">
                {product.price?.toLocaleString("vi-VN")}đ
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {product.originalPrice.toLocaleString("vi-VN")}đ
                  </span>
                  {product.discount && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      -{product.discount}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Màu sắc: {selectedColor && <span className="text-gray-900">{selectedColor.name}</span>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(color)}
                      className={`w-10 h-10 rounded-full border-2 transition ${
                        selectedColor?.id === color.id
                          ? "border-[#3A6FB5] scale-110"
                          : "border-gray-300 hover:border-[#3A6FB5]"
                      }`}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Kích thước: {selectedSize && <span className="text-red-600">{selectedSize}</span>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-lg font-medium transition ${
                        selectedSize === size
                          ? "border-[#3A6FB5] bg-[#3A6FB5] text-white"
                          : "border-gray-300 hover:border-[#3A6FB5] text-gray-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
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
                <span className="px-6 py-2 font-medium min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  disabled={product.stock && quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock === 0}
                className="flex-1 px-6 py-4 bg-white border-2 border-[#3A6FB5] text-[#3A6FB5] rounded-lg font-medium hover:bg-[#3A6FB5] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                THÊM VÀO GIỎ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.stock || product.stock === 0}
                className="flex-1 px-6 py-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                MUA NGAY
              </button>
            </div>
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
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Không có ảnh</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {item.brand && (
                      <p className="text-xs text-gray-500 mb-1 uppercase">{item.brand}</p>
                    )}
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <span className="text-red-600 font-bold">
                        {item.price?.toLocaleString("vi-VN")}đ
                      </span>
                      {item.originalPrice && (
                        <span className="text-gray-400 text-xs line-through">
                          {item.originalPrice.toLocaleString("vi-VN")}đ
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