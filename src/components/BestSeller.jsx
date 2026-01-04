import React from "react";
import useProductData from "../hooks/useProductData";
import ProductList from "../components/ProductList";

const BestSeller = ({ savedRef, setSavedCount }) => {
  const { products, loading, error } = useProductData(
    "/api/products/search",
    {
      sort: 'sold,desc',
      active: 'true'
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const sortedProducts = [...products].sort((a, b) => b.sold - a.sold);

  return (
    <ProductList
      products={sortedProducts}
      title="BÁN CHẠY NHẤT"
      viewAllLink="/collection"
      showBadge={true}
      badgeText="Bán chạy"
      showSold={true}
      showHotDeal={true}
      savedRef={savedRef}
      setSavedCount={setSavedCount}
    />
  );
};

export default BestSeller;