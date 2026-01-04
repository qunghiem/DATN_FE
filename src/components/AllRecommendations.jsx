// components/AllRecommendations.jsx
import React from "react";
import ContentRecommendations from "./ContentRecommendations";
import CollaborativeRecommendations from "./CollaborativeRecommendations";

const AllRecommendations = ({ userId, savedRef, setSavedCount }) => {
  return (
    <>
      <ContentRecommendations 
        userId={userId} 
        savedRef={savedRef} 
        setSavedCount={setSavedCount} 
      />
      <CollaborativeRecommendations 
        userId={userId} 
        savedRef={savedRef} 
        setSavedCount={setSavedCount} 
      />
    </>
  );
};

export default AllRecommendations;