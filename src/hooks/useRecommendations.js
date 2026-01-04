// hooks/useRecommendations.js
import { useState, useEffect } from "react";
import axios from "axios";

const useRecommendations = (userId, recommendationType = "content") => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const RECOMMENDATION_API_URL = import.meta.env.VITE_RECOMMENDATION_API_URL || "http://localhost:8000";
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Xác định endpoint dựa trên type
        const endpoint = recommendationType === "collaborative" 
          ? `/api/recommendations/collaborative/user/${userId}`
          : `/api/recommendations/content-based/user/${userId}`;
        
        const response = await axios.get(`${RECOMMENDATION_API_URL}${endpoint}`, {
          params: { limit: 8 },
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (response.data.code === 1000 && response.data.result?.length > 0) {
          const recommendations = response.data.result;
          
          // Map data cơ bản từ recommendation API
          const basicProducts = recommendations.map(rec => {
            const productId = rec.product_id || rec.id;
            const currentPrice = rec.discount_price || rec.price || 0;
            const originalPrice = rec.price || 0;
            
            let discountPercent = 0;
            if (originalPrice > 0 && currentPrice < originalPrice) {
              discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
            }

            let categories = [];
            if (typeof rec.categories === 'string') {
              categories = rec.categories.split(',').map(cat => cat.trim());
            } else if (Array.isArray(rec.categories)) {
              categories = rec.categories;
            }

            const reason = recommendationType === "collaborative" 
              ? rec.reason || "Người dùng tương tự cũng thích"
              : rec.reason || "Sản phẩm tương tự với sở thích của bạn";

            return {
              id: productId,
              name: rec.name || "No name",
              brand: rec.brand_name || "Unknown",
              price: currentPrice,
              originalPrice: originalPrice,
              discount: discountPercent,
              images: rec.image_url ? [{ url: rec.image_url, altText: rec.name }] : [],
              mainImage: rec.image_url || "",
              link: `/product/${productId}`,
              labels: [reason],
              categories: categories,
              sold: rec.sold || 0,
              rating: rec.rating || 0,
              score: rec.score || 0,
              reason: reason,
              type: recommendationType,
            };
          });

          // Fetch thêm chi tiết từ product API
          const enhancedProducts = await Promise.all(
            basicProducts.map(async (product) => {
              try {
                const res = await axios.get(`${VITE_API_URL}/api/products/${product.id}`);
                const fullProduct = res.data?.data || res.data;
                
                return {
                  ...product,
                  // Ưu tiên data từ product API
                  price: fullProduct.price?.discount_price || product.price,
                  originalPrice: fullProduct.price?.price || product.originalPrice,
                  discount: fullProduct.price?.discount_percent || product.discount,
                  sold: fullProduct.sold || product.sold,
                  images: Array.isArray(fullProduct.images) ? 
                    fullProduct.images.filter(img => img.image_url).map(img => ({
                      url: img.image_url,
                      altText: img.alt_text || product.name,
                    })) : product.images,
                  mainImage: fullProduct.images?.[0]?.image_url || product.mainImage,
                  colors: Array.isArray(fullProduct.variants) ? 
                    fullProduct.variants.map(v => ({
                      name: v.color_name || "Unknown",
                      code: v.color_hex || "#ccc",
                      image: v.image || "",
                    })) : [],
                  labels: [
                    ...(Array.isArray(fullProduct.labels) ? 
                      fullProduct.labels.map(label => label.name) : []),
                    product.reason
                  ],
                  categories: Array.isArray(fullProduct.categories) ?
                    fullProduct.categories.map(cat => cat.name) : product.categories,
                };
              } catch (err) {
                console.error(`Error enhancing product ${product.id}:`, err);
                return product; // Trả về product cơ bản nếu lỗi
              }
            })
          );

          setProducts(enhancedProducts.filter(p => p !== null));
        } else {
          setProducts([]);
        }
        
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${recommendationType} recommendations:`, err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, recommendationType]);

  return { products, loading, error };
};

export default useRecommendations;