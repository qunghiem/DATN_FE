// hooks/useProductData.js (SIMPLIFIED VERSION)
import { useState, useEffect } from "react";
import axios from "axios";

const useProductData = (apiEndpoint, queryParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const VITE_API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (!apiEndpoint) {
          setProducts([]);
          setLoading(false);
          return;
        }
        
        const params = new URLSearchParams(queryParams);
        const url = `${VITE_API_URL}${apiEndpoint}?${params.toString()}`;
        const res = await axios.get(url);
        
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const mappedProducts = data.map(defaultMapper);

        setProducts(mappedProducts);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiEndpoint, JSON.stringify(queryParams)]);

  return { products, loading, error };
};

// Mapper mặc định cho API sản phẩm thông thường
const defaultMapper = (p) => {
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

  const currentPrice = p.price?.discount_price || p.price?.price || 0;
  const originalPrice = p.price?.price || 0;
  const discountPercent = p.price?.discount_percent || 0;

  const variants = Array.isArray(p.variants) ? p.variants : [];
  const colors = variants.map((v) => ({
    name: v.color_name || v.colorName || "Unknown",
    code: v.color_hex || v.colorHex || "#ccc",
    image: v.image || images[0]?.url || "",
  }));

  return {
    id: p.id,
    name: p.name || "No name",
    brand: p.brand?.name || "Unknown",
    price: currentPrice,
    originalPrice: originalPrice,
    discount: discountPercent,
    images: images,
    mainImage: images[0]?.url || "",
    colors: colors,
    link: `/product/${p.id}`,
    labels: Array.isArray(p.labels)
      ? p.labels.map((label) => label.name)
      : [],
    categories: Array.isArray(p.categories)
      ? p.categories.map((cat) => cat.name)
      : [],
    sold: p.sold || 0,
    totalCount: p.total_count || 0,
    createdAt: p.created_at,
  };
};

export default useProductData;