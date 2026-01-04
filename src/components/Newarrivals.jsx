// components/NewArrivals.jsx
import React from "react";
import useProductData from "../hooks/useProductData";
import ProductList from "./ProductList";

const NewArrivals = ({ savedRef, setSavedCount }) => {
  const { products, loading, error } = useProductData(
    "/api/products/search",
    {
      active: 'true'
      // KHÔNG gửi sort parameter, sẽ sort ở client
    }
  );

  if (loading) return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Đang tải sản phẩm mới...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      <div className="text-center py-8 text-red-500">
        Lỗi khi tải sản phẩm: {error}
      </div>
    </div>
  );

  // SORT ở client side - chỉ cho NewArrivals
  const sortByCreatedAt = (a, b) => {
    try {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB.getTime() - dateA.getTime(); // Mới nhất trước
    } catch (err) {
      console.error('Error sorting by createdAt:', err);
      return 0;
    }
  };

  // Sắp xếp và lấy 8 sản phẩm mới nhất
  const sortedProducts = [...products]
    .sort(sortByCreatedAt)
    .slice(0, 8); // Chỉ lấy 8 sản phẩm

  // Debug: Kiểm tra xem sort có hoạt động không
  if (sortedProducts.length > 0) {
    console.log('NewArrivals - Newest product:', {
      name: sortedProducts[0]?.name,
      createdAt: sortedProducts[0]?.createdAt
    });
    console.log('NewArrivals - Oldest product:', {
      name: sortedProducts[sortedProducts.length - 1]?.name,
      createdAt: sortedProducts[sortedProducts.length - 1]?.createdAt
    });
  }

  return (
    <ProductList
      products={sortedProducts}
      title="HÀNG MỚI VỀ"
      viewAllLink="/collection/new-arrivals"
      showBadge={true}
      badgeText="Mới"
      showSold={true}
      showHotDeal={false}
      savedRef={savedRef}
      setSavedCount={setSavedCount}
    />
  );
};

export default NewArrivals;