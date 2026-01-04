import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import Banner from "../components/Banner";
import Features from "../components/Features";
import ProductCategories from "../components/ProductCategories";
import Vouchers from "../components/Vouchers";
import NewArrivals from "../components/Newarrivals";
import BestSeller from "../components/BestSeller";

import ContentRecommendations from "../components/ContentRecommendations";
import CollaborativeRecommendations from "../components/CollaborativeRecommendationsV2";
import CustomerReviews from "../components/CustomerReviews";

const Home = () => {
  const [savedCount, setSavedCount] = useState(0);
  const savedRef = useRef(null);

  // Lấy user từ Redux store
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  console.log("=== HomePage User Info ===");
  console.log("user:", user);
  console.log("userId:", user?.id);
  console.log("isAuthenticated:", isAuthenticated);

  return (
    <div className="pt-16">
      <Banner />
      <Features />
      <ProductCategories />
      <Vouchers />
      <BestSeller savedRef={savedRef} 
        setSavedCount={setSavedCount} />

      {isAuthenticated && user?.id && (
        <ContentRecommendations 
          userId={user.id}
          savedRef={savedRef} 
          setSavedCount={setSavedCount} 
        />
      )}

      {isAuthenticated && user?.id && (
        <CollaborativeRecommendations 
          userId={user.id}
          savedRef={savedRef} 
          setSavedCount={setSavedCount} 
        />
      )}
      <NewArrivals />
      <CustomerReviews />
    </div>
  );
};

export default Home;
