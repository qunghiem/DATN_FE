import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-10 bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5]"></div>
          <p className="mt-4 text-gray-600">Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-10 bg-white">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-10 bg-white">
        <div className="text-center text-gray-600">
          <p className="text-lg">Chưa có danh mục nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-10 bg-white">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Danh mục sản phẩm
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Khám phá bộ sưu tập đồ thể thao chất lượng cao
        </p>
      </div>

      {/* Desktop: Grid 6 cột bình thường (>= 992px) */}
      <div className="hidden lg:grid grid-cols-6 gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Tablet: Hiển thị 3.5 item (768px - 991px) */}
      <div className="hidden md:block lg:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-4" style={{ width: "fit-content" }}>
          {categories.map((category) => (
            <div
              key={category.id}
              style={{ minWidth: "calc(28.57% - 11.43px)" }}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Hiển thị 2.5 item (< 768px) */}
      <div className="block md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-3" style={{ width: "fit-content" }}>
          {categories.map((category) => (
            <div key={category.id} style={{ minWidth: "calc(40% - 9.6px)" }}>
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component Category Card tách riêng
const CategoryCard = ({ category }) => {
  return (
    <Link
      to={category.link}
      className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 block"
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
      <div className="p-2 md:p-3 text-center">
        <h3 className="font-medium text-gray-900 text-sm md:text-base mb-0.5 group-hover:text-[#3A6FB5] transition-colors line-clamp-2">
          {category.name}
        </h3>
        <p className="text-xs md:text-sm text-gray-500">
          {category.productCount} sản phẩm
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button className="bg-white text-[#3A6FB5] px-4 py-1.5 rounded-full font-medium text-sm shadow-sm hover:shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
          Xem ngay
        </button>
      </div>
    </Link>
  );
};

export default ProductCategories;
