import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import Vouchers from "../components/Vouchers";
import FilterSection from "../components/FilterSection";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Collection = () => {
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // StateupdateURLWithFilters
  const [products, setProducts] = useState([]);
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
  const [selectedSex, setSelectedSex] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
    totalElements: 0,
  });

  // custom price range
  const [customMinPrice, setCustomMinPrice] = useState("");
  const [customMaxPrice, setCustomMaxPrice] = useState("");

  // Sex options
  const sexOptions = [
    { value: "MALE", label: "Nam" },
    { value: "FEMALE", label: "Nữ" },
  ];

  const getUniqueColors = (colors) => {
    if (!colors || colors.length === 0) return [];

    const uniqueMap = new Map();
    colors.forEach((color) => {
      const key = color.name || color.color_name;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, color);
      }
    });
    return Array.from(uniqueMap.values());
  };

  useEffect(() => {
    const params = new URLSearchParams();

    // Giữ lại search và categoryName
    const search = searchParams.get("search");
    const categoryName = searchParams.get("categoryName");
    if (search) params.set("search", search);
    if (categoryName) params.set("categoryName", categoryName);

    // Thêm các filter
    selectedBrand.forEach((brand) => params.append("brand", brand));
    selectedSex.forEach((sex) => params.append("sex", sex));
    selectedCategory.forEach((cat) => params.append("category", cat));
    selectedPriceRange.forEach((range) => params.append("priceRange", range));
    if (sortBy !== "default") params.set("sort", sortBy);

    // Cập nhật URL (chỉ khi có thay đổi thực sự)
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params);
    }
  }, [
    selectedBrand,
    selectedSex,
    selectedCategory,
    selectedPriceRange,
    sortBy,
  ]);

  // Thêm useEffect để đọc filter từ URL khi mount
  useEffect(() => {
    const brands = searchParams.getAll("brand");
    const sex = searchParams.getAll("sex");
    const categories = searchParams.getAll("category");
    const priceRanges = searchParams.getAll("priceRange");
    const sort = searchParams.get("sort");

    if (brands.length > 0) setSelectedBrand(brands);
    if (sex.length > 0) setSelectedSex(sex);
    if (categories.length > 0) setSelectedCategory(categories);
    if (priceRanges.length > 0) setSelectedPriceRange(priceRanges);
    if (sort) setSortBy(sort);
  }, []);
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
    { id: "300000-500000", label: "300,000đ - 500,000đ" },
    { id: "500000-1000000", label: "500,000đ - 1,000,000đ" },
    { id: "1000000-2000000", label: "1,000,000đ - 2,000,000đ" },
    { id: "2000000-3000000", label: "2,000,000đ - 3,000,000đ" },
    { id: "3000000-above", label: "Giá trên 3,000,000đ" },
  ];

  const sortOptions = [
    { id: "default", name: "Tên A → Z" },
    { id: "name-desc", name: "Tên Z → A" },
    { id: "price-asc", name: "Giá thấp đến cao" },
    { id: "price-desc", name: "Giá cao đến thấp" },
  ];

  // Fetch brands, categories, and labels
  useEffect(() => {
    const fetchBrandsCategoriesLabels = async () => {
      try {
        // Fetch brands
        const brandsRes = await axios.get(`${VITE_API_URL}/api/brands`);
        const brandsData = brandsRes.data?.result || brandsRes.data?.data || [];
        const brandNames = brandsData
          .filter((b) => b.isActive !== false)
          .map((b) => b.name);
        setBrands([...brandNames]);

        // Fetch categories
        const categoriesRes = await axios.get(`${VITE_API_URL}/api/categories`);
        const categoriesData =
          categoriesRes.data?.result || categoriesRes.data?.data || [];
        const categoryNames = categoriesData.map((c) => c.name);
        setCategories([...categoryNames]);

        // Fetch labels for shipping options (nếu cần)
        // ...
      } catch (err) {
        console.error("Error fetching brands/categories/labels:", err);
      }
    };

    fetchBrandsCategoriesLabels();
  }, []);

  // Fetch products with filters from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        // Build query params
        const params = new URLSearchParams();

        // Search query
        const urlSearch = searchParams.get("search");
        if (urlSearch) {
          params.append("search", urlSearch);
        }

        // Brand filter (multiple)
        selectedBrand.forEach((brand) => {
          params.append("brand", brand);
        });

        // Sex filter (multiple)
        selectedSex.forEach((sex) => {
          params.append("sex", sex);
        });

        // Category filter (multiple)
        // Lấy categoryName từ URL nếu có
        const urlCategoryName = searchParams.get("categoryName");

        // Ưu tiên dùng category từ URL trước
        if (urlCategoryName) {
          params.append("category", urlCategoryName);
        } else {
          // Nếu không có từ URL thì dùng từ filter
          selectedCategory.forEach((cat) => {
            params.append("category", cat);
          });
        }

        // Price range filter
        let minPrice = customMinPrice ? Number(customMinPrice) : null;
        let maxPrice = customMaxPrice ? Number(customMaxPrice) : null;

        // If predefined ranges are selected, calculate min/max
        if (selectedPriceRange.length > 0) {
          const mins = [];
          const maxs = [];

          selectedPriceRange.forEach((range) => {
            const parts = range.split("-");
            mins.push(Number(parts[0]));
            if (parts[1] && parts[1] !== "above") {
              maxs.push(Number(parts[1]));
            }
          });

          if (!minPrice) minPrice = Math.min(...mins);
          if (!maxPrice && maxs.length > 0) maxPrice = Math.max(...maxs);
        }

        if (minPrice) params.append("priceMin", minPrice);
        if (maxPrice) params.append("priceMax", maxPrice);

        // Sort
        if (sortBy && sortBy !== "default") {
          params.append("sort", sortBy);
        }

        // Pagination
        params.append("page", pagination.currentPage.toString());
        params.append("size", pagination.pageSize.toString());

        const res = await axios.get(
          `${VITE_API_URL}/api/products/search?${params.toString()}`
        );

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
                    : `${VITE_API_URL}/${url}`;
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
            sex: p.sex || "UNISEX",
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

        // Update pagination info from API response
        setPagination((prev) => ({
          ...prev,
          totalPages: res.data?.totalPages || 1,
          totalElements: res.data?.totalElements || 0,
          currentPage: res.data?.currentPage || prev.currentPage,
        }));
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchParams,
    selectedBrand,
    selectedSex,
    selectedCategory,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
    sortBy,
    pagination.currentPage, // Thêm dependency này
    pagination.pageSize, // Thêm dependency này
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  }, [
    searchParams,
    selectedBrand,
    selectedSex,
    selectedCategory,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
    sortBy,
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
    setSelectedSex([]);
    setSortBy("default");
    setCustomMinPrice("");
    setCustomMaxPrice("");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }));
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (size) => {
    setPagination((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1, // Reset về trang 1 khi thay đổi số lượng mỗi trang
    }));
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }

    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis if needed
    if (startPage > 2) {
      pages.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page if there is more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
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
                  sexOptions={sexOptions}
                  selectedSex={selectedSex}
                  setSelectedSex={setSelectedSex}
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
                sexOptions={sexOptions}
                selectedSex={selectedSex}
                setSelectedSex={setSelectedSex}
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm text-gray-600">
                    {selectedCategory.length > 0 ? (
                      <>
                        Danh mục:{" "}
                        <span className="font-semibold">
                          {selectedCategory.join(", ")}
                        </span>{" "}
                        ({pagination.totalElements} sản phẩm)
                      </>
                    ) : (
                      <>Tất cả sản phẩm ({pagination.totalElements})</>
                    )}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Trang {pagination.currentPage} / {pagination.totalPages} •
                    Hiển thị {products.length} sản phẩm
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <select
                      value={pagination.pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(Number(e.target.value))
                      }
                      className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={36}>36</option>
                      <option value={48}>48</option>
                    </select>
                  </div>

                  {/* Sort selector */}
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
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5]" />
                <p className="text-gray-600 mt-4">Đang tải sản phẩm...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && products.length === 0 && (
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
            {!isLoading && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {products.map((p) => {
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
                                favorites.includes(p.id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>

                          {/* Labels - Bottom Left */}
                          <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
                            {p.labels.map((label, idx) => {
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
                          {/* Color Variant Dots */}
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị{" "}
                      {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
                      {Math.min(
                        pagination.currentPage * pagination.pageSize,
                        pagination.totalElements
                      )}{" "}
                      trong tổng số {pagination.totalElements} sản phẩm
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Previous button */}
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
                          pagination.currentPage === 1
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {generatePageNumbers().map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-2 text-gray-500"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium ${
                                pagination.currentPage === page
                                  ? "bg-[#3A6FB5] text-white border-[#3A6FB5]"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      {/* Next button */}
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
                          pagination.currentPage === pagination.totalPages
                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick jump */}
                    {/* <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Đi đến trang:</span>
                      <input
                        type="number"
                        min="1"
                        max={pagination.totalPages}
                        value={pagination.currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (!isNaN(page)) {
                            handlePageChange(
                              Math.min(Math.max(1, page), pagination.totalPages)
                            );
                          }
                        }}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
                      />
                      <span className="text-gray-500">
                        / {pagination.totalPages}
                      </span>
                    </div> */}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
