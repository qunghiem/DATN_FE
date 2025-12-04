import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/categories");

        if (!response.ok) {
          throw new Error("Không thể tải danh mục");
        }

        const apiResponse = await response.json();

        // Check if API call was successful
        if (apiResponse.code !== 1000) {
          throw new Error(apiResponse.message || "Lỗi khi tải dữ liệu");
        }

        // Get data from result field
        const data = apiResponse.result;

        if (!Array.isArray(data)) {
          throw new Error("Dữ liệu không đúng định dạng");
        }

        // Transform API data to match component structure
        const transformedData = data.map((category) => ({
          id: category.id,
          name: category.name,
          productCount: 0, // API không có field này, có thể cập nhật sau
          image:
            category.image ||
            "//theme.hstatic.net/200000695155/1001373964/14/season_coll_1_img_large.png?v=16",
          // FIX: Truyền cả id và name vào URL để Collection page có thể filter
          link: `/collection?categoryId=${
            category.id
          }&categoryName=${encodeURIComponent(category.name)}`,
          description: category.description,
        }));

        setCategories(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Tốc độ vuốt (nhân 2 để mượt hơn)
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5]"></div>
          <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Lỗi: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#3A6FB5] text-white rounded-lg hover:bg-[#2d5a94] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="text-center text-gray-600">
          <p className="text-lg">Chưa có danh mục nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Danh mục sản phẩm
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Khám phá bộ sưu tập đồ thể thao chất lượng cao
        </p>
      </div>

      {/* Category List - Giống BestSeller */}
      {/* Mobile: 1.5 item (65%), Tablet: 3.5 item (27.5%), Desktop: 4 item (25%) */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 hide-scrollbar cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex gap-3 md:gap-4 lg:flex-nowrap lg:overflow-x-auto lg:gap-4 xl:justify-start hide-scrollbar">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Component Category Card tách riêng
const CategoryCard = ({ category }) => {
  return (
    <Link
      to={category.link}
      className="flex-none w-[65%] md:w-[27.5%] lg:w-1/4 group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "//theme.hstatic.net/200000695155/1001373964/14/season_coll_1_img_large.png?v=16";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-3 text-center">
        <h3 className="font-medium text-gray-900 text-sm md:text-base mb-0.5 group-hover:text-[#3A6FB5] transition-colors line-clamp-2">
          {category.name}
        </h3>
        <p className="text-xs md:text-sm text-gray-500">
          {category.productCount} sản phẩm
        </p>
      </div>
    </Link>
  );
};

export default ProductCategories;