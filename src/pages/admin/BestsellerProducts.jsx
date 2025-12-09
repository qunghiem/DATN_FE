import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { 
  TrendingUp, 
  Search, 
  Filter, 
  X,
  Calendar,
  DollarSign,
  Package,
  ShoppingBag,
  Award,
  Star,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Crown,
  Medal,
  Trophy
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchBrands,
  fetchCategories,
} from "../../features/admin/metadataSlice";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const BestsellerProducts = () => {
  const dispatch = useDispatch();
  const { brands = [], categories = [] } = useSelector((state) => state.metadata || {});
  
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    categoryIds: [],
    sex: [],
    brandNames: [],
    priceMin: "",
    priceMax: "",
    startDate: "",
    endDate: "",
    sort: "sold-desc",
    page: 1,
    size: 10
  });

  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ ...filters });

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Theo dõi tất cả các filter thay đổi
  useEffect(() => {
    fetchBestsellerProducts();
  }, [filters]); // Thay vì chỉ [filters.page, filters.sort]

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBestsellerProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryIds.length > 0) params.append('category', filters.categoryIds.join(','));
      if (filters.sex.length > 0) params.append('sex', filters.sex.join(','));
      if (filters.brandNames.length > 0) params.append('brand', filters.brandNames.join(','));
      if (filters.priceMin) params.append('priceMin', filters.priceMin);
      if (filters.priceMax) params.append('priceMax', filters.priceMax);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('size', filters.size);

      // DEBUG: Log params để kiểm tra
    console.log('API Params:', Object.fromEntries(params.entries()));
    console.log('StartDate:', filters.startDate, 'Type:', typeof filters.startDate);
    console.log('EndDate:', filters.endDate, 'Type:', typeof filters.endDate);

      const response = await axios.get(
        `${VITE_API_URL}/api/products/bestseller?${params.toString()}`,
        { headers: getAuthHeader() }
      );

      if (response.data.success) {
        setBestsellerProducts(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error("Error fetching bestseller products:", error);
      toast.error("Không thể tải dữ liệu sản phẩm bán chạy");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategories = tempFilters.categoryIds.includes(categoryId)
      ? tempFilters.categoryIds.filter((id) => id !== categoryId)
      : [...tempFilters.categoryIds, categoryId];
    setTempFilters({ ...tempFilters, categoryIds: newCategories });
  };

  const handleSexToggle = (sexValue) => {
    const newSex = tempFilters.sex.includes(sexValue)
      ? tempFilters.sex.filter((s) => s !== sexValue)
      : [...tempFilters.sex, sexValue];
    setTempFilters({ ...tempFilters, sex: newSex });
  };

  const handleBrandToggle = (brandName) => {
    const newBrands = tempFilters.brandNames.includes(brandName)
      ? tempFilters.brandNames.filter((b) => b !== brandName)
      : [...tempFilters.brandNames, brandName];
    setTempFilters({ ...tempFilters, brandNames: newBrands });
  };

  const applyFilters = () => {
    setFilters({ ...tempFilters, page: 1 });
    setShowFilters(false);
    // Không cần gọi fetchBestsellerProducts() vì useEffect sẽ tự động gọi
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      categoryIds: [],
      sex: [],
      brandNames: [],
      priceMin: "",
      priceMax: "",
      startDate: "",
      endDate: "",
      sort: "sold-desc",
      page: 1,
      size: 20
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    setShowFilters(false);
    // Không cần gọi fetchBestsellerProducts() vì useEffect sẽ tự động gọi
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categoryIds.length > 0) count++;
    if (filters.sex.length > 0) count++;
    if (filters.brandNames.length > 0) count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRankInfo = (index) => {
    switch(index) {
      case 0: return { 
        icon: Crown, 
        bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-500",
        textColor: "text-yellow-600",
        rankText: "1"
      };
      case 1: return { 
        icon: Trophy, 
        bgColor: "bg-gradient-to-r from-gray-300 to-gray-400",
        textColor: "text-gray-600",
        rankText: "2"
      };
      case 2: return { 
        icon: Medal, 
        bgColor: "bg-gradient-to-r from-orange-400 to-orange-500",
        textColor: "text-orange-600",
        rankText: "3"
      };
      default: return { 
        icon: BarChart3, 
        bgColor: "bg-gradient-to-r from-sky-400 to-sky-500",
        textColor: "text-gray-700",
        rankText: (index + 1).toString()
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-sky-500" />
            Sản phẩm bán chạy
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng số: <span className="font-semibold text-sky-600">{totalElements}</span> sản phẩm
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={tempFilters.search}
              onChange={(e) => setTempFilters({ ...tempFilters, search: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
              }}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition relative"
          >
            <Filter className="w-5 h-5" />
            Bộ lọc
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="sold-desc">Bán chạy nhất</option>
            <option value="sold-asc">Bán ít nhất</option>
            <option value="price-asc">Giá thấp → cao</option>
            <option value="price-desc">Giá cao → thấp</option>
            <option value="name-asc">Tên A → Z</option>
            <option value="name-desc">Tên Z → A</option>
          </select>
        </div>

        {showFilters && (
          <div className="border-t pt-4 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={tempFilters.startDate}
                  onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={tempFilters.endDate}
                  onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Giá tối thiểu
                </label>
                <input
                  type="number"
                  value={tempFilters.priceMin}
                  onChange={(e) => setTempFilters({ ...tempFilters, priceMin: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Giá tối đa
                </label>
                <input
                  type="number"
                  value={tempFilters.priceMax}
                  onChange={(e) => setTempFilters({ ...tempFilters, priceMax: e.target.value })}
                  placeholder="10000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <div className="flex flex-wrap gap-2">
                {['MALE', 'FEMALE'].map((sex) => (
                  <button
                    key={sex}
                    type="button"
                    onClick={() => handleSexToggle(sex)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      tempFilters.sex.includes(sex)
                        ? "bg-sky-500 text-white border-sky-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-sky-500"
                    }`}
                  >
                    {sex === 'MALE' ? '👔 Nam' : '👗 Nữ'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      tempFilters.categoryIds.includes(category.id)
                        ? "bg-sky-500 text-white border-sky-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-sky-500"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandToggle(brand.name)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      tempFilters.brandNames.includes(brand.name)
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-purple-500"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Đặt lại
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : bestsellerProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Không tìm thấy sản phẩm nào</p>
          <p className="text-gray-400 text-sm mt-2">Thử điều chỉnh bộ lọc của bạn</p>
        </div>
      ) : (
        <>
          {/* Bảng danh sách sản phẩm - 5 cột */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Xếp hạng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Thương hiệu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Giá
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Đã bán
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bestsellerProducts.map((product, index) => {
                    const rankInfo = getRankInfo(index);
                    const RankIcon = rankInfo.icon;
                    const absoluteIndex = (filters.page - 1) * filters.size + index + 1;
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Cột Xếp hạng */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${rankInfo.bgColor} text-white`}>
                              <RankIcon className="w-5 h-5" />
                            </div>
                            <div className="ml-3">
                              <div className={`text-sm font-bold ${rankInfo.textColor}`}>
                                {absoluteIndex}
                              </div>
                              {/* <div className="text-xs text-gray-500">
                                #{absoluteIndex}
                              </div> */}
                            </div>
                          </div>
                        </td>

                        {/* Cột Sản phẩm */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0].image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/48?text=No+Image";
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                {product.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  product.sex === 'MALE' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-pink-100 text-pink-700'
                                }`}>
                                  {product.sex === 'MALE' ? 'Nam' : 'Nữ'}
                                </span>
                                {product.categories && product.categories.length > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {product.categories[0].name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cột Thương hiệu */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {product.brand?.name || 'N/A'}
                            </div>
                          </div>
                        </td>

                        {/* Cột Giá */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-base font-bold text-sky-600">
                              {formatCurrency(product.price?.discount_price || product.price?.price || 0)}
                            </div>
                            {product.price?.discount_percent > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-400 line-through">
                                  {formatCurrency(product.price?.price || 0)}
                                </div>
                                <span className="text-xs font-medium text-red-600">
                                  -{product.price.discount_percent}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Cột Đã bán */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {product.sold || 0}
                              </div>
                              <div className="text-xs text-gray-500">sản phẩm</div>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-orange-500 opacity-80" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(filters.page - 1) * filters.size + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(filters.page * filters.size, totalElements)}</span> trong{' '}
                  <span className="font-medium">{totalElements}</span> sản phẩm
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                  </button>

                  <div className="flex gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, filters.page - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }

                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setFilters({ ...filters, page: 1 })}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(<span key="dots1" className="px-3 py-2 text-gray-500">...</span>);
                        }
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setFilters({ ...filters, page: i })}
                            className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition ${
                              filters.page === i
                                ? "bg-sky-500 text-white border-sky-500 shadow-lg"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(<span key="dots2" className="px-3 py-2 text-gray-500">...</span>);
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => setFilters({ ...filters, page: totalPages })}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                    disabled={filters.page === totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BestsellerProducts;