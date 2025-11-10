const FilterSection = ({ 
  isMobile = false,
  brands,
  selectedBrand,
  setSelectedBrand,
  priceRanges,
  selectedPriceRange,
  setSelectedPriceRange,
  customMinPrice,
  setCustomMinPrice,
  customMaxPrice,
  setCustomMaxPrice,
  categories,
  selectedCategory,
  setSelectedCategory,
  shippingOptions,
  selectedShipping,
  setSelectedShipping,
  toggleFilter
}) => (
  <div className={isMobile ? "p-4" : ""}>
    {/* Brand Filter */}
    <div className="mb-6">
      <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">
        THƯƠNG HIỆU
      </h4>
      <div className="space-y-2">
        {brands.map((brand) => (
          <label
            key={brand}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
          >
            <input
              type="checkbox"
              checked={selectedBrand.includes(brand)}
              onChange={() =>
                toggleFilter(selectedBrand, setSelectedBrand, brand)
              }
              className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
            />
            <span className="text-sm text-gray-700">{brand}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Price Range Filter */}
    <div className="mb-6">
      <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">
        MỨC GIÁ
      </h4>

      {/* Custom Price Range Input */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-2">Khoảng giá tùy chỉnh:</p>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={customMinPrice}
            onChange={(e) => setCustomMinPrice(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
          />
          <input
            type="number"
            placeholder="Tối đa"
            value={customMaxPrice}
            onChange={(e) => setCustomMaxPrice(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#3A6FB5] focus:border-transparent outline-none"
          />
        </div>
        {(customMinPrice || customMaxPrice) && (
          <button
            onClick={() => {
              setCustomMinPrice("");
              setCustomMaxPrice("");
            }}
            className="text-xs text-red-600 hover:underline mt-2"
          >
            Xóa khoảng giá
          </button>
        )}
      </div>

      {/* Predefined Price Ranges */}
      <div className="space-y-2">
        {priceRanges.map((range) => (
          <label
            key={range.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
          >
            <input
              type="checkbox"
              checked={selectedPriceRange.includes(range.id)}
              onChange={() =>
                toggleFilter(
                  selectedPriceRange,
                  setSelectedPriceRange,
                  range.id
                )
              }
              className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
            />
            <span className="text-sm text-gray-700">{range.label}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Category Filter */}
    <div className="mb-6">
      <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">
        DANH MỤC
      </h4>
      <div className="space-y-2">
        {categories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
          >
            <input
              type="checkbox"
              checked={selectedCategory.includes(cat)}
              onChange={() =>
                toggleFilter(selectedCategory, setSelectedCategory, cat)
              }
              className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
            />
            <span className="text-sm text-gray-700">{cat}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Shipping Filter */}
    {shippingOptions.length > 0 && (
      <div className="mb-6">
        <h4 className="font-bold text-gray-900 mb-3 uppercase text-sm">
          DỊCH VỤ GIAO HÀNG
        </h4>
        <div className="space-y-2">
          {shippingOptions.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedShipping.includes(option)}
                onChange={() =>
                  toggleFilter(selectedShipping, setSelectedShipping, option)
                }
                className="w-4 h-4 text-[#3A6FB5] border-gray-300 rounded focus:ring-[#3A6FB5]"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default FilterSection;