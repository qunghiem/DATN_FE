// components/ContentRecommendations.jsx
import React from "react";
import { useSelector } from "react-redux";
import useRecommendations from "../hooks/useRecommendations";
import ProductList from "./ProductList";

const ContentRecommendations = ({ userId, savedRef, setSavedCount }) => {
  const { products, loading, error } = useRecommendations(userId, "content");
  
  if (!userId) return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Đang phân tích sở thích của bạn...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <ProductList
      products={products}
      title="GỢI Ý CHO BẠN"
      subtitle="DÀNH RIÊNG CHO BẠN"
      viewAllLink="/collection"
      showBadge={true}
      badgeText="Gợi Ý"
      badgeColor="from-purple-500 to-pink-500"
      showSold={true}
      showHotDeal={false}
      savedRef={savedRef}
      setSavedCount={setSavedCount}
    />
  );
};

export default ContentRecommendations;