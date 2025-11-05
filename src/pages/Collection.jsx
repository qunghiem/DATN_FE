// src/pages/Collection.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Menu, X, ChevronDown, Info } from "lucide-react";
import axios from "axios";
import Vouchers from "../components/Vouchers";

const Collection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [selectedColorFilter, setSelectedColorFilter] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter options
  const brands = ["Khác", "EGA", "YIHLI"];
  
  const colors = [
    { name: "Đen", code: "#000000" },
    { name: "Xanh đen", code: "#1a1a2e" },
    { name: "Nâu đậm", code: "#8b4513" },
    { name: "Nâu nhạt", code: "#d2b48c" },
    { name: "Hồng", code: "#ffc0cb" },
  ];

  const priceRanges = [
    { id: "0-1000000", label: "Giá dưới 1,000,000đ" },
    { id: "1000000-2000000", label: "1,000,000đ - 2,000,000đ" },
    { id: "2000000-3000000", label: "2,000,000đ - 3,000,000đ" },
    { id: "3000000-5000000", label: "3,000,000đ - 5,000,000đ" },
    { id: "5000000-7000000", label: "5,000,000đ - 7,000,000đ" },
    { id: "7000000-above", label: "Giá trên 10,000,000đ" },
  ];

  const categories = ["Khác", "Áo tập"];

  const shippingOptions = [
    "Miễn phí giao hàng",
    "Giao hàng nhanh 4h",
    "Giao hàng tận nơi"
  ];

  const sortOptions = [
    { id: "default", name: "Tên A → Z" },
    { id: "name-desc", name: "Tên Z → A" },
    { id: "price-asc", name: "Giá thấp đến cao" },
    { id: "price-desc", name: "Giá cao đến thấp" },
    { id: "newest", name: "Hàng mới nhất" },
    { id: "best-selling", name: "Bán chạy nhất" },
  ];

  // Voucher data
  const vouchers = [
    {
      id: 1,
      icon: "🚚",
      title: "MIỄN PHÍ VẬN CHUYỂN",
      description: "Áp dụng cho đơn từ 500k",
      code: "ECAFREESHIP",
      expiry: "30/12/2025"
    },
    {
      id: 2,
      icon: "💵",
      title: "GIẢM 50K",
      description: "Áp dụng cho đơn hàng từ 600đk",
      code: "GIAM50K",
      expiry: "06/01/2025"
    },
    {
      id: 3,
      icon: "💲",
      title: "GIẢM 30%",
      description: "Cho sản phẩm giảm đến 4tr trở lên",
      code: "GIAM30",
      expiry: "05/06/2025"
    },
    {
      id: 4,
      icon: "💰",
      title: "GIẢM 40%",
      description: "Cho sản phẩm giảm đến 4tr trong Mùa Đông",
      code: "GIAM40",
      expiry: "20/01/2025"
    }
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("http://localhost:8080/api/products");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];

        const mappedProducts = data.map((p) => {
          const variants = Array.isArray(p.variants) ? p.variants : [];
          const colors = variants.map((v) => ({
            name: v.color_name || "Unknown",
            code: v.color_hex || "#ccc",
            image: v.image || "",
          }));

          return {
            id: p.id,
            name: p.name || "No name",
            brand: p.brand || "Khác",
            category: p.category || "Khác",
            price: p.price?.current || 0,
            originalPrice: p.price?.original || 0,
            discount: p.price?.discount_percent || 0,
            image: p.images?.[0] || "",
            colors,
            moreColors: colors.length > 1 ? colors.length - 1 : 0,
            link: `/product/${p.id}`,
            labels: Array.isArray(p.labels) ? p.labels : [],
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
    if (selectedPriceRange.length > 0) {
      filtered = filtered.filter((p) => {
        return selectedPriceRange.some((range) => {
          const [min, max] = range.split("-").map(Number);
          if (max) {
            return p.price >= min && p.price <= max;
          } else {
            return p.price >= min;
          }
        });
      });
    }

    // Category filter
    if (selectedCategory.length > 0) {
      filtered = filtered.filter((p) => selectedCategory.includes(p.category));
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
        filtered = filtered.filter(p => p.labels.includes("Bán chạy"));
        break;
      case "newest":
        filtered = filtered.filter(p => p.labels.includes("Mới"));
        break;
      default: // name-asc
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchParams, selectedBrand, selectedColorFilter, selectedPriceRange, selectedCategory, sortBy]);

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
      setFilterArray(filterArray.filter(v => v !== value));
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
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const FilterSection = ({ isMobile = false }) => (
    <div className={isMobile ? "p-4" : ""}>
      {/* Brand Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">THƯƠNG HIỆU</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedBrand.includes(brand)}
                onChange={() => toggleFilter(selectedBrand, setSelectedBrand, brand)}
                className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
              />
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">MÀU SẮC</h4>
        <div className="space-y-2">
          {colors.map((color) => (
            <label
              key={color.name}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
            >
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.code }}
                />
                <span className="text-sm text-gray-700">{color.name}</span>
              </div>
              <input
                type="checkbox"
                checked={selectedColorFilter.includes(color.name)}
                onChange={() => toggleFilter(selectedColorFilter, setSelectedColorFilter, color.name)}
                className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
              />
            </label>
          ))}
          <button className="text-sm text-[#3A6FB5] hover:underline flex items-center gap-1">
            Xem thêm <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">MỨC GIÁ</h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedPriceRange.includes(range.id)}
                onChange={() => toggleFilter(selectedPriceRange, setSelectedPriceRange, range.id)}
                className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">LOẠI</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedCategory.includes(cat)}
                onChange={() => toggleFilter(selectedCategory, setSelectedCategory, cat)}
                className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Shipping Filter */}
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">DỊCH VỤ GIAO HÀNG</h4>
        <div className="space-y-2">
          {shippingOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedShipping.includes(option)}
                onChange={() => toggleFilter(selectedShipping, setSelectedShipping, option)}
                className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

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
                    <div key={i} className="w-1 h-4 bg-white opacity-50 skew-x-12" />
                  ))}
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">GIẢM ĐẾN 50%</h2>
              <p className="text-sm opacity-90">TỪ 20/12 - 30/12</p>
              <div className="flex gap-1 mt-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-4 bg-white opacity-50 skew-x-12" />
                ))}
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop" alt="" className="w-20 h-24 object-cover rounded" />
              <img src="https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=150&h=150&fit=crop" alt="" className="w-20 h-24 object-cover rounded" />
              <img src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=150&h=150&fit=crop" alt="" className="w-20 h-24 object-cover rounded" />
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=150&h=150&fit=crop" alt="" className="w-20 h-24 object-cover rounded" />
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
                <FilterSection />
              </div>
            </div>
          </div>

          {/* Mobile Filter Button - Screens < 992px */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden fixed bottom-20 right-4 z-40 bg-[#3A6FB5] text-white p-4 rounded-full shadow-lg hover:bg-[#2E5C99] transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile Filters Modal - Screens < 992px */}
          {showMobileFilters && (
            <>
              {/* Backdrop */}
              <div 
                className="hidden fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={() => setShowMobileFilters(false)}
              />
              
              {/* Sidebar from right */}
              <div className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="w-6 h-6" />
                  </button>
                  <h3 className="font-bold">Tìm theo</h3>
                  <div className="w-6" />
                </div>

                <FilterSection isMobile />

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
            </>
          )}

          {/* Products */}
          <div className="w-full">
            {/* Header & Sort */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Tất cả sản phẩm
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
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleProductClick(p.id)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100">
                      <img
                        src={selectedColors[p.id] || p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Labels */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {p.labels.includes("Bán chạy") && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            Bán chạy
                          </span>
                        )}
                        {p.discount > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            -{p.discount}%
                          </span>
                        )}
                      </div>

                      {/* Favorite */}
                      <button
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition z-10 ${
                          favorites.includes(p.id)
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={favorites.includes(p.id) ? "currentColor" : "none"}
                        />
                      </button>

                      {/* Hover overlay with seller info */}
                      <div className="absolute bottom-2 left-2 right-2 bg-white rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full" />
                          <span className="text-xs font-medium">{p.brand}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="text-gray-400 text-xs uppercase mb-1">{p.brand}</p>
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                        {p.name}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-red-600 font-bold">
                          {formatPrice(p.price)}
                        </span>
                        {p.originalPrice > p.price && (
                          <>
                            <span className="text-gray-400 text-xs line-through">
                              {formatPrice(p.originalPrice)}
                            </span>
                            <span className="text-red-500 text-xs">
                              -{p.discount}%
                            </span>
                          </>
                        )}
                      </div>

                      {/* Colors */}
                      <div className="flex items-center gap-1.5">
                        {p.colors.slice(0, 4).map((c, i) => (
                          <button
                            key={i}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              handleColorChange(p.id, c.image);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: c.code }}
                          />
                        ))}
                        {p.moreColors > 0 && (
                          <span className="text-gray-400 text-xs">
                            +{p.moreColors}
                          </span>
                        )}
                      </div>

                      {/* Shipping badge */}
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        Giao hàng miễn phí
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;