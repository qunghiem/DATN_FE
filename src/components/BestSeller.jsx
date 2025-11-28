import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ChevronRight } from "lucide-react";
import axios from "axios";

const BestSeller = ({ savedRef, setSavedCount }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedImages, setSelectedImages] = useState({});

  // Hàm loại bỏ màu trùng lặp
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        
        const mappedProducts = data.map((p) => {
          const images = Array.isArray(p.images)
            ? p.images
                .filter((img) => {
                  const url = img.image_url || img.imageUrl;
                  return url && url.trim() !== "";
                })
                .map((img) => {
                  const url = img.image_url || img.imageUrl;
                  const altText = img.alt_text || img.altText || p.name || "Product image";
                  
                  return {
                    url: url,
                    altText: altText,
                  };
                })
            : [];
          
          const currentPrice = p.price?.discount_price || p.price?.price || 0;
          const originalPrice = p.price?.price || 0;
          const discountPercent = p.price?.discount_percent || 0;

          // Map variants thành colors
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
            colors: colors, // Thêm colors từ variants
            link: `/product/${p.id}`,
            labels: Array.isArray(p.labels)
              ? p.labels.map((label) => label.name)
              : [],
            categories: Array.isArray(p.categories)
              ? p.categories.map((cat) => cat.name)
              : [],
            sold: p.sold || 0,
            totalCount: p.total_count || 0,
          };
        });

        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-500 text-xs mb-1">NỮ</p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            BÁN CHẠY NHẤT
          </h2>
        </div>
        <Link
          to="/collection"
          className="flex items-center gap-1 text-[#3A6FB5] hover:text-[#2E5C99] text-sm font-medium transition"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 hide-scrollbar">
        <div className="flex gap-3 md:gap-4 lg:flex-nowrap lg:overflow-x-auto lg:gap-4 xl:justify-start hide-scrollbar">
          {products.map((p) => {
            // Lọc màu unique cho mỗi sản phẩm
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

                  {p.labels.includes("Bán chạy") && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-md">
                      Bán chạy
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
                    {p.brand || "YINLI"}
                  </p>
                  <div className="block font-medium text-gray-800 text-[15px] leading-snug hover:text-[#3A6FB5] transition line-clamp-2">
                    {p.name || "Áo croptop tập gym yoga"}
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

                  {/* Color Variant Dots - THAY THẾ THUMBNAIL IMAGES */}
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

                          {/* Tooltip */}
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
                    <span className="bg-[#FF6600] text-white text-[11px] font-semibold px-2 py-[2px] rounded-md">
                      🔥 HOT DEAL
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

export default BestSeller;
