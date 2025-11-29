// src/pages/Collection.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Menu, X, ChevronDown, Info } from "lucide-react";
import axios from "axios";
import Vouchers from "../components/Vouchers";
import FilterSection from "../components/FilterSection";

const Collection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});

  // Dynamic data from API
  const [brands, setBrands] = useState([""]);
  const [categories, setCategories] = useState([""]);
  const [shippingOptions, setShippingOptions] = useState([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedColorFilter, setSelectedColorFilter] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // custom price range
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");

  const getUniqueColors = (colors) => {
    if (!colors || colors.length === 0) return [];

    const uniqueMap = new Map();
    colors.forEach((color) => {
      // Sử dụng tên màu làm key để loại bỏ trùng lặp
      const key = color.name || color.color_name;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, color);
      }
    });
    return Array.from(uniqueMap.values());
  };
  // Initialize category from URL
  useEffect(() => {
    const categoryName = searchParams.get("categoryName");
    if (categoryName && !selectedCategory.includes(categoryName)) {
      setSelectedCategory([categoryName]);
    }
  }, [searchParams]);
  // Filter options - Static

  const priceRanges = [
    { id: "0-300000", label: "Giá dưới 300,000đ" },
    { id: "300000-5000000", label: "300,000đ - 500,000đ" },
    { id: "5000000-10000000", label: "500,000đ - 1,000,000đ" },
    { id: "1000000-20000000", label: "1,000,000đ - 2,000,000đ" },
    { id: "2000000-3000000", label: "2,000,000đ - 3,000,000đ" },
    { id: "3000000-above", label: "Giá trên 3,000,000đ" },
  ];

  const sortOptions = [
    { id: "default", name: "Tên A → Z" },
    { id: "name-desc", name: "Tên Z → A" },
    { id: "price-asc", name: "Giá thấp đến cao" },
    { id: "price-desc", name: "Giá cao đến thấp" },
    { id: "newest", name: "Hàng mới nhất" },
    { id: "best-selling", name: "Bán chạy nhất" },
  ];

  // Fetch brands, categories, and labels
  useEffect(() => {
    const fetchBrandsCategoriesLabels = async () => {
      try {
        // Fetch brands
        const brandsRes = await axios.get("http://localhost:8080/api/brands");
        const brandsData = brandsRes.data?.result || brandsRes.data?.data || [];
        const brandNames = brandsData
          .filter((b) => b.isActive !== false)
          .map((b) => b.name);
        setBrands([...brandNames, "Khác"]);

        // Fetch categories
        const categoriesRes = await axios.get(
          "http://localhost:8080/api/categories"
        );
        const categoriesData =
          categoriesRes.data?.result || categoriesRes.data?.data || [];
        const categoryNames = categoriesData.map((c) => c.name);
        setCategories([...categoryNames, "Khác"]);

        // Fetch labels for shipping options
        const labelsRes = await axios.get("http://localhost:8080/api/labels");
        const labelsData = labelsRes.data?.result || labelsRes.data?.data || [];

        const shippingLabels = labelsData
          .filter((label) => {
            const name = (label.name || "").toLowerCase();
            return (
              name.includes("giao hàng") ||
              name.includes("freeship") ||
              name.includes("miễn phí") ||
              name.includes("ship") ||
              name.includes("vận chuyển")
            );
          })
          .map((label) => label.name);

        setShippingOptions(shippingLabels);
      } catch (err) {
        console.error("Error fetching brands/categories/labels:", err);
      }
    };

    fetchBrandsCategoriesLabels();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:8080/api/products");

        const data = Array.isArray(res.data?.result)
          ? res.data.result
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const mappedProducts = data.map((p) => {
          const images = Array.isArray(p.images)
            ? p.images
                .filter((img) => {
                  const url = img.image_url || img.imageUrl;
                  return url && url.trim() !== "";
                })
                .map((img) => {
                  const url = img.image_url || img.imageUrl;
                  const fullUrl = url.startsWith("http")
                    ? url
                    : `http://localhost:8080/${url}`;
                  const altText =
                    img.alt_text || img.altText || p.name || "Product image";

                  return {
                    url: fullUrl,
                    altText: altText,
                  };
                })
            : [];

          let currentPrice, originalPrice, discountPercent;

          if (p.price && typeof p.price === "object") {
            currentPrice = p.price.discount_price || p.price.price || 0;
            originalPrice = p.price.price || 0;
            discountPercent = p.price.discount_percent || 0;
          } else {
            originalPrice = p.price || 0;
            discountPercent = p.discountPercent || 0;
            currentPrice =
              originalPrice - (originalPrice * discountPercent) / 100;
          }

          const variants = Array.isArray(p.variants) ? p.variants : [];
          const colors = variants.map((v) => ({
            name: v.color_name || v.colorName || "Unknown",
            code: v.color_hex || v.colorHex || "#ccc",
            image: v.image || "",
          }));

          return {
            id: p.id,
            name: p.name || "No name",
            brand: p.brand?.name || p.brandName || "Unknown",
            price: currentPrice,
            originalPrice: originalPrice,
            discount: discountPercent,
            images: images,
            mainImage: images[0]?.url || "",
            colors,
            moreColors: colors.length > 1 ? colors.length - 1 : 0,
            link: `/product/${p.id}`,
            labels: Array.isArray(p.labels)
              ? p.labels.map((label) =>
                  typeof label === "string" ? label : label.name
                )
              : [],
            categories: Array.isArray(p.categories)
              ? p.categories.map((cat) =>
                  typeof cat === "string" ? cat : cat.name
                )
              : [],
            category: p.categories?.[0]?.name || p.categoryName || "Khác",
            sold: p.sold || 0,
            totalCount: p.total_count || 0,
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search from URL
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      const query = urlSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrand.length > 0) {
      filtered = filtered.filter((p) => selectedBrand.includes(p.brand));
    }

    // Color filter
    if (selectedColorFilter.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors.some((c) => selectedColorFilter.includes(c.name))
      );
    }

    // Price range filter
    if (selectedPriceRange.length > 0 || customMinPrice || customMaxPrice) {
      filtered = filtered.filter((p) => {
        const min = customMinPrice ? Number(customMinPrice) : 0;
        const max = customMaxPrice ? Number(customMaxPrice) : Infinity;
        const matchesCustomRange = p.price >= min && p.price <= max;

        const matchesPredefinedRange =
          selectedPriceRange.length === 0 ||
          selectedPriceRange.some((range) => {
            const [min, max] = range.split("-").map(Number);
            if (max) {
              return p.price >= min && p.price <= max;
            } else {
              return p.price >= min;
            }
          });

        if (
          selectedPriceRange.length === 0 &&
          (customMinPrice || customMaxPrice)
        ) {
          return matchesCustomRange;
        }

        return matchesPredefinedRange && matchesCustomRange;
      });
    }

    // Category filter
    if (selectedCategory.length > 0) {
      filtered = filtered.filter((p) =>
        p.categories.some((cat) => selectedCategory.includes(cat))
      );
    }

    // Shipping filter
    if (selectedShipping.length > 0) {
      filtered = filtered.filter((p) =>
        p.labels.some((label) => selectedShipping.includes(label))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "best-selling":
        filtered = filtered.filter((p) => p.labels.includes("Bán chạy"));
        break;
      case "newest":
        filtered = filtered.filter((p) => p.labels.includes("Mới"));
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [
    products,
    searchParams,
    selectedBrand,
    selectedColorFilter,
    selectedPriceRange,
    selectedCategory,
    selectedShipping,
    sortBy,
    customMinPrice,
    customMaxPrice,
  ]);

  // Handlers
  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleColorChange = (id, img) => {
    setSelectedColors((prev) => ({ ...prev, [id]: img }));
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const toggleFilter = (filterArray, setFilterArray, value) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter((v) => v !== value));
    } else {
      setFilterArray([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedBrand([]);
    setSelectedColorFilter([]);
    setSelectedPriceRange([]);
    setSelectedCategory([]);
    setSelectedShipping([]);
    setSortBy("default");
    setCustomMinPrice("");
    setCustomMaxPrice("");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Banner */}
        <div className="mb-6 bg-black text-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-4 bg-white opacity-50 skew-x-12"
                    />
                  ))}
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                GIẢM ĐẾN 50%
              </h2>
              <p className="text-sm opacity-90">TỪ 20/12 - 30/12</p>
              <div className="flex gap-1 mt-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-4 bg-white opacity-50 skew-x-12"
                  />
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop"
                alt=""
                className="w-20 h-24 object-cover rounded"
              />
              <img
                src="https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=150&h=150&fit=crop"
                alt=""
                className="w-20 h-24 object-cover rounded"
              />
              <img
                src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=150&h=150&fit=crop"
                alt=""
                className="w-20 h-24 object-cover rounded"
              />
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&h=150&fit=crop"
                alt=""
                className="w-20 h-24 object-cover rounded"
              />
            </div>

            <button className="ml-4 bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-100 transition">
              MUA NGAY
            </button>
          </div>
        </div>

        <Vouchers />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar - Desktop (992px+) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm sticky top-20">
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-bold text-sm">Tất cả sản phẩm</span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <FilterSection
                  brands={brands}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  priceRanges={priceRanges}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={setSelectedPriceRange}
                  customMinPrice={customMinPrice}
                  setCustomMinPrice={setCustomMinPrice}
                  customMaxPrice={customMaxPrice}
                  setCustomMaxPrice={setCustomMaxPrice}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  shippingOptions={shippingOptions}
                  selectedShipping={selectedShipping}
                  setSelectedShipping={setSelectedShipping}
                  toggleFilter={toggleFilter}
                />
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden fixed bottom-35 right-5 z-40 bg-[#3A6FB5] text-white p-4 rounded-full shadow-lg hover:bg-[#2E5C99] transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-[100] shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-6 h-6" />
                </button>
                <h3 className="font-bold">Tìm theo</h3>
                <div className="w-6" />
              </div>

              <FilterSection
                isMobile
                brands={brands}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                priceRanges={priceRanges}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                customMinPrice={customMinPrice}
                setCustomMinPrice={setCustomMinPrice}
                customMaxPrice={customMaxPrice}
                setCustomMaxPrice={setCustomMaxPrice}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                shippingOptions={shippingOptions}
                selectedShipping={selectedShipping}
                setSelectedShipping={setSelectedShipping}
                toggleFilter={toggleFilter}
              />

              <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 px-4 py-3 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="w-full">
            {/* Header & Sort */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedCategory.length > 0 ? (
                    <>
                      Danh mục:{" "}
                      <span className="font-semibold">
                        {selectedCategory.join(", ")}
                      </span>{" "}
                      ({filteredProducts.length} sản phẩm)
                    </>
                  ) : (
                    <>Tất cả sản phẩm ({filteredProducts.length})</>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5]" />
                <p className="text-gray-600 mt-4">Đang tải sản phẩm...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2E5C99] transition"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {filteredProducts.map((p) => {
                  // Lọc màu unique cho mỗi sản phẩm
                  const uniqueColors = getUniqueColors(p.colors);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.id)}
                      className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[3/4] bg-gray-100">
                        {p.mainImage ? (
                          <img
                            src={selectedColors[p.id] || p.mainImage}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}

                        {/* Labels - Top Left */}
                        {p.labels.includes("Bán chạy") && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-md">
                            Bán chạy
                          </div>
                        )}

                        {/* Favorite Button - Top Right */}
                        <button
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition z-10 ${
                            favorites.includes(p.id)
                              ? "text-red-500"
                              : "text-gray-400 hover:text-[#3A6FB5]"
                          }`}
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={
                              favorites.includes(p.id) ? "currentColor" : "none"
                            }
                          />
                        </button>

                        {/* Labels - Bottom Left */}
                        <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
                          {p.labels.map((label, idx) => {
                            // Skip "Bán chạy" vì đã hiển thị ở trên
                            if (label === "Bán chạy") return null;

                            const isFreeship =
                              label.toLowerCase().includes("freeship") ||
                              label.toLowerCase().includes("free ship") ||
                              label.toLowerCase().includes("miễn phí") ||
                              label.toLowerCase().includes("giao hàng");
                            const isCombo =
                              label.toLowerCase().includes("mua 2") ||
                              label.toLowerCase().includes("combo");

                            if (isFreeship) {
                              return (
                                <span
                                  key={idx}
                                  className="bg-[#3A6FB5] text-white text-[11px] font-medium px-2 py-[1px] rounded-md shadow-sm"
                                >
                                  {label}
                                </span>
                              );
                            }

                            if (isCombo) {
                              return (
                                <div
                                  key={idx}
                                  className="bg-[#003EA7] text-white text-[11px] font-semibold px-2 py-[2px] rounded-md shadow-md"
                                >
                                  {label}
                                </div>
                              );
                            }

                            return (
                              <span
                                key={idx}
                                className="bg-[#003EA7] text-white text-[11px] font-medium px-2 py-[1px] rounded-md shadow-sm"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-3">
                        <p className="text-gray-400 text-xs uppercase mb-1 tracking-wide">
                          {p.brand || "YINLI"}
                        </p>
                        <h3 className="font-medium text-gray-800 text-[15px] leading-snug hover:text-[#3A6FB5] transition line-clamp-2 mb-2">
                          {p.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-[#111] font-bold text-[15px]">
                            {Math.round(p.price).toLocaleString("vi-VN")}₫
                          </span>
                          {p.originalPrice > p.price && (
                            <>
                              <span className="text-gray-400 text-xs line-through ml-1">
                                {Math.round(p.originalPrice).toLocaleString(
                                  "vi-VN"
                                )}
                                ₫
                              </span>
                              <span className="text-red-500 text-xs font-medium ml-1">
                                -{p.discount}%
                              </span>
                            </>
                          )}
                        </div>

                        {/* Color Variant Dots - SỬ DỤNG uniqueColors */}
                        {uniqueColors.length > 1 && (
                          <div className="flex items-center gap-2 mt-2">
                            {uniqueColors.slice(0, 5).map((color, i) => (
                              <div key={i} className="relative group">
                                <button
                                  onMouseEnter={(e) => {
                                    e.stopPropagation();
                                    handleColorChange(p.id, color.image);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                    selectedColors[p.id] === color.image
                                      ? "border-gray-800 scale-110"
                                      : "border-gray-300 hover:border-gray-500"
                                  }`}
                                  style={{
                                    backgroundColor: color.code,
                                    boxShadow:
                                      color.code === "#FFFFFF"
                                        ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                                        : "none",
                                  }}
                                  aria-label={color.name}
                                />

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-20">
                                  {color.name}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            ))}
                            {uniqueColors.length > 5 && (
                              <span className="text-gray-400 text-xs ml-1">
                                +{uniqueColors.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
