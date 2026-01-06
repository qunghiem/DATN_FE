// components/CollaborativeRecommendationsV2.jsx
import React from "react";
import { useSelector } from "react-redux";
import useRecommendations from "../hooks/useRecommendations";
import ProductList from "./ProductList";

const CollaborativeRecommendationsV2 = ({ userId, savedRef, setSavedCount }) => {
  const { products, loading, error } = useRecommendations(userId, "collaborative");
  
  const lastAction = useSelector(state => state.wishlist?.lastAction);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang phân tích cộng đồng...</p>
          <p className="text-gray-400 text-sm mt-2">Tìm người dùng có sở thích tương tự</p>
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
      title="CÓ THỂ BẠN CŨNG THÍCH"
      subtitle="NGƯỜI DÙNG TƯƠNG TỰ CŨNG THÍCH"
      viewAllLink="/collection"
      showBadge={true}
      // badgeText="Cộng đồng"
      badgeColor="from-blue-500 to-cyan-500"
      showSold={true}
      showHotDeal={false}
      savedRef={savedRef}
      setSavedCount={setSavedCount}
    />
  );
};

export default CollaborativeRecommendationsV2;