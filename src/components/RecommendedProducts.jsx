import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "axios";

const RecommendedProducts = ({ userId, savedRef, setSavedCount }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedImages, setSelectedImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState("hybrid");
  
  // ✅ Listen to wishlist changes - KEY FIX: Add proper dependency
  const lastAction = useSelector(state => state.wishlist?.lastAction);
  const wishlistProductIds = useSelector(state => state.wishlist?.wishlistProductIds || []);
  
  const VITE_API_URL = import.meta.env.VITE_API_URL;
  const RECOMMENDATION_API_URL = import.meta.env.VITE_RECOMMENDATION_API_URL || "http://localhost:8000";
  
  console.log("🔧 Config:", { VITE_API_URL, RECOMMENDATION_API_URL });

  const getUniqueColors = (colors) => {
    if (!colors || colors.length === 0) return [];
    
    const uniqueMap = new Map();
    colors.forEach(color => {
      const key = color.name || color.color_name;
      if (key && !uniqueMap.has(key)) {
        uniqueMap.set(key, color);
      }
    });
    return Array.from(uniqueMap.values());
  };

  // ✅ FIX 1: Combine initial load with recommendationType dependency
  useEffect(() => {
    console.log("=== RecommendedProducts Mount/Type Change ===");
    console.log("userId:", userId);
    console.log("recommendationType:", recommendationType);
    
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, recommendationType]);

  // ✅ FIX 2: Better wishlist change detection with timestamp check
  useEffect(() => {
    if (!lastAction || !userId) return;
    
    const isRefreshAction = lastAction.type === 'refresh_recommendations';
    const isRecent = lastAction.timestamp && 
      (new Date() - new Date(lastAction.timestamp)) < 5000; // 5 seconds
    
    if (isRefreshAction && isRecent) {
      console.log('🔄 Detected wishlist change, reloading recommendations...');
      console.log('Last action:', lastAction);
      
      // ✅ FIX 3: Increase delay to 2s for backend processing
      setTimeout(() => {
        fetchRecommendations();
      }, 2000);
    }
  }, [lastAction?.timestamp]); // ✅ Watch timestamp instead of whole object

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching recommendations for userId:", userId);
      
      const recResponse = await axios.get(
        `${RECOMMENDATION_API_URL}/api/recommendations/user/${userId}`,
        { 
          params: { limit: 12, type: recommendationType },
          // ✅ FIX 4: Add cache busting
          headers: { 'Cache-Control': 'no-cache' }
        }
      );
      
      console.log("✅ Recommendation API Response:", recResponse.data);

      if (recResponse.data.code === 1000 && recResponse.data.result?.length > 0) {
        const recommendations = recResponse.data.result;
        console.log(`📦 Got ${recommendations.length} recommendations`);
        
        const productDetailsPromises = recommendations.map(async (rec, index) => {
          try {
            const productId = rec.product_id || rec.id;
            console.log(`  [${index + 1}] Fetching product ${productId}...`);
            
            const res = await axios.get(`${VITE_API_URL}/api/products/${productId}`);
            const p = res.data?.data || res.data;
            
            console.log(`  [${index + 1}] ✓ Got product: ${p.name}`);
            
            const images = Array.isArray(p.images)
              ? p.images
                  .filter((img) => {
                    const url = img.image_url || img.imageUrl;
                    return url && url.trim() !== "";
                  })
                  .map((img) => ({
                    url: img.image_url || img.imageUrl,
                    altText: img.alt_text || img.altText || p.name || "Product image",
                  }))
              : [];

            const currentPrice = p.price?.discount_price || p.price?.price || rec.discount_price || rec.price || 0;
            const originalPrice = p.price?.price || rec.price || 0;
            const discountPercent = p.price?.discount_percent || 0;

            const variants = Array.isArray(p.variants) ? p.variants : [];
            const colors = variants.map((v) => ({
              name: v.color_name || v.colorName || "Unknown",
              code: v.color_hex || v.colorHex || "#ccc",
              image: v.image || images[0]?.url || "",
            }));

            return {
              id: productId,
              name: p.name || rec.name || "No name",
              brand: p.brand?.name || rec.brand_name || "Unknown",
              price: currentPrice,
              originalPrice: originalPrice,
              discount: discountPercent,
              images: images,
              mainImage: images[0]?.url || rec.image_url || "",
              colors: colors,
              link: `/product/${productId}`,
              labels: Array.isArray(p.labels)
                ? p.labels.map((label) => label.name)
                : [],
              categories: Array.isArray(p.categories)
                ? p.categories.map((cat) => cat.name)
                : [],
              sold: p.sold || 0,
              rating: p.rating || 0,
              score: rec.score || 0,
              reason: rec.reason || "",
            };
          } catch (err) {
            console.error(`Error fetching product ${rec.product_id}:`, err);
            return null;
          }
        });

        const productDetails = await Promise.all(productDetailsPromises);
        const validProducts = productDetails.filter(p => p !== null);
        
        console.log(`✅ Final products count: ${validProducts.length}`);
        
        setProducts(validProducts);
        
        // ✅ FIX 5: Sync favorites with wishlist
        setFavorites(wishlistProductIds);
      } else {
        console.log("⚠️ No recommendations in response or empty result");
        setProducts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching recommendations:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      setProducts([]);
    } finally {
      setLoading(false);
      console.log("🏁 fetchRecommendations finished");
    }
  };

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

    if (savedRef?.current) {
      const tymRect = e.target.getBoundingClientRect();
      const savedRect = savedRef.current.getBoundingClientRect();

      const flyEl = document.createElement("div");
      flyEl.innerText = "+1";
      flyEl.style.position = "fixed";
      flyEl.style.left = `${tymRect.left + tymRect.width / 2}px`;
      flyEl.style.top = `${tymRect.top}px`;
      flyEl.style.fontWeight = "bold";
      flyEl.style.color = "red";
      flyEl.style.transition = "all 0.7s ease-in-out";
      flyEl.style.zIndex = 1000;

      document.body.appendChild(flyEl);

      requestAnimationFrame(() => {
        flyEl.style.left = `${savedRect.left + savedRect.width / 2}px`;
        flyEl.style.top = `${savedRect.top}px`;
        flyEl.style.transform = "scale(0.5)";
        flyEl.style.opacity = 0;
      });

      flyEl.addEventListener("transitionend", () => {
        document.body.removeChild(flyEl);
        if (setSavedCount) {
          setSavedCount((prev) => prev + 1);
        }
      });
    }
  };

  const handleImageChange = (id, imgUrl) => {
    setSelectedImages((prev) => ({ ...prev, [id]: imgUrl }));
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (!userId) {
    console.log("🚫 Component hidden: No userId");
    return null;
  }
  
  if (!loading && products.length === 0) {
    console.log("🚫 Component hidden: No products after loading");
    return null;
  }

  if (loading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6FB5]"></div>
          <p className="ml-3 text-gray-600">Đang tải gợi ý cho bạn...</p>
        </div>
      </div>
    );
  }

  console.log("✨ Rendering component with", products.length, "products");

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-500 text-xs mb-1">DÀNH RIÊNG CHO BẠN</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            GỢI Ý CHO BẠN
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-2">
            {[
              { value: "hybrid", label: "Kết hợp" },
              { value: "content", label: "Sở thích" },
              { value: "collaborative", label: "Phổ biến" }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setRecommendationType(type.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  recommendationType === type.value
                    ? "bg-[#3A6FB5] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <Link
            to="/collection"
            className="flex items-center gap-1 text-[#3A6FB5] hover:text-[#2E5C99] text-sm font-medium transition"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="flex sm:hidden gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {[
          { value: "hybrid", label: "Kết hợp" },
          { value: "content", label: "Sở thích" },
          { value: "collaborative", label: "Phổ biến" }
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setRecommendationType(type.value)}
            className={`flex-none px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              recommendationType === type.value
                ? "bg-[#3A6FB5] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 hide-scrollbar">
        <div className="flex gap-3 md:gap-4 lg:flex-nowrap lg:overflow-x-auto lg:gap-4 xl:justify-start hide-scrollbar">
          {products.map((p) => {
            const uniqueColors = getUniqueColors(p.colors);
            
            return (
              <div
                key={p.id}
                onClick={() => handleProductClick(p.id)}
                className="flex-none w-[65%] md:w-[27.5%] lg:w-1/4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-transform hover:-translate-y-1 relative overflow-hidden cursor-pointer"
              >
                <div className="block relative aspect-[3/4]">
                  {p.mainImage ? (
                    <img
                      src={selectedImages[p.id] || p.mainImage}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}

                  {p.score > 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-md">
                      {Math.round(p.score * 100)}% phù hợp
                    </div>
                  )}

                  <button
                    onClick={(e) => toggleFavorite(p.id, e)}
                    className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition z-10 ${
                      favorites.includes(p.id)
                        ? "text-red-500"
                        : "text-gray-400 hover:text-[#3A6FB5]"
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={favorites.includes(p.id) ? "currentColor" : "none"}
                    />
                  </button>

                  <div className="absolute bottom-2 left-2 flex flex-col items-start gap-1">
                    {p.labels.map((label, idx) => {
                      const isFreeship =
                        label.toLowerCase().includes("freeship") ||
                        label.toLowerCase().includes("free ship");
                      const isCombo =
                        label.toLowerCase().includes("mua 2") ||
                        label.toLowerCase().includes("combo");

                      if (isFreeship) {
                        return (
                          <span
                            key={idx}
                            className="bg-[#3A6FB5] text-white text-[11px] font-medium px-2 py-[1px] rounded-md shadow-sm"
                          >
                            {label}
                          </span>
                        );
                      }

                      if (isCombo) {
                        return (
                          <div
                            key={idx}
                            className="bg-[#003EA7] text-white text-[11px] font-semibold px-2 py-[2px] rounded-md shadow-md"
                          >
                            {label}
                          </div>
                        );
                      }

                      return (
                        <span
                          key={idx}
                          className="bg-[#003EA7] text-white text-[11px] font-medium px-2 py-[1px] rounded-md shadow-sm"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    {p.brand}
                  </p>
                  <div className="block font-medium text-gray-800 text-[15px] leading-snug hover:text-[#3A6FB5] transition line-clamp-2">
                    {p.name}
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#111] font-bold text-[15px]">
                      {Math.round(p.price).toLocaleString("vi-VN")}₫
                    </span>
                    {p.originalPrice > p.price && (
                      <>
                        <span className="text-gray-400 text-xs line-through ml-1">
                          {p.originalPrice.toLocaleString("vi-VN")}₫
                        </span>
                        <span className="text-red-500 text-xs font-medium ml-1">
                          -{p.discount}%
                        </span>
                      </>
                    )}
                  </div>

                  {p.reason && (
                    <div className="text-[#3A6FB5] text-xs mt-1 italic">
                      {p.reason}
                    </div>
                  )}

                  {(p.rating > 0 || p.sold > 0) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      {p.rating > 0 && (
                        <span>⭐ {p.rating.toFixed(1)}</span>
                      )}
                      {p.sold > 0 && (
                        <span>Đã bán: {p.sold.toLocaleString()}</span>
                      )}
                    </div>
                  )}

                  {uniqueColors.length > 1 && (
                    <div className="flex items-center gap-2 mt-2">
                      {uniqueColors.slice(0, 5).map((color, i) => (
                        <div key={i} className="relative group">
                          <button
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              handleImageChange(p.id, color.image);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                              selectedImages[p.id] === color.image
                                ? "border-gray-800 scale-110"
                                : "border-gray-300 hover:border-gray-500"
                            }`}
                            style={{
                              backgroundColor: color.code,
                              boxShadow:
                                color.code === "#FFFFFF"
                                  ? "inset 0 0 0 1px rgba(0,0,0,0.1)"
                                  : "none",
                            }}
                            aria-label={color.name}
                          />

                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-20">
                            {color.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      ))}
                      {uniqueColors.length > 5 && (
                        <span className="text-gray-400 text-xs ml-1">
                          +{uniqueColors.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 mt-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-semibold px-2 py-[2px] rounded-md">
                      ⭐ GỢI Ý
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecommendedProducts;