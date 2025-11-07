import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ChevronRight } from "lucide-react";
import axios from "axios";

const NewArrivals = ({ savedRef, setSavedCount }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/products");
        // const res = await axios.get("https://fnzv9bcp-8080.asse.devtunnels.ms/api/products");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];

        const mappedProducts = data.map((p) => {
          const variants = Array.isArray(p.variants) ? p.variants : [];

          const colors = variants.map((v) => ({
            name: v.color_name || "Unknown",
            code: v.color_hex || "#ccc",
            image: v.image || "",
          }));

          return {
            id: p.id,
            name: p.name || "No name",
            brand: p.brand || "Unknown",
            price: p.price?.current || 0,
            originalPrice: p.price?.original || 0,
            discount: p.price?.discount_percent || 0,
            image: p.images?.[0] || "",
            colors,
            moreColors: colors.length > 1 ? colors.length - 1 : 0,
            // Use product ID for navigation
            link: `/product/${p.id}`,
            labels: Array.isArray(p.labels) ? p.labels : [],
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

  const handleColorChange = (id, img) => {
    setSelectedColors((prev) => ({ ...prev, [id]: img }));
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
            MỚI RA MẮT
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
        <div
          className="
      flex gap-3 md:gap-4
      lg:flex-nowrap lg:overflow-x-auto lg:gap-4
      xl:justify-start hide-scrollbar
    "
        >
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => handleProductClick(p.id)}
              className="
          flex-none w-[65%] md:w-[27.5%]
          lg:w-1/4 
          bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md 
          transition-transform hover:-translate-y-1 relative overflow-hidden cursor-pointer
        "
            >
              <div className="block relative aspect-[3/4]">
                {p.image ? (
                  <img
                    src={selectedColors[p.id] || p.image}
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
                  <span className="bg-[#3A6FB5] text-white text-[11px] font-medium px-2 py-[1px] rounded-md shadow-sm">
                    FREESHIP
                  </span>
                  <div className="bg-[#003EA7] text-white text-[11px] font-semibold px-2 py-[2px] rounded-md shadow-md">
                    MUA 2 CHỈ CÒN{" "}
                    <span className="text-yellow-300">
                      {p.comboPrice || "999.000₫"}
                    </span>
                  </div>
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
                    {p.price.toLocaleString("vi-VN")}₫
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

                <div className="flex items-center gap-1.5 mt-2">
                  {p.colors.map((c, i) => (
                    <button
                      key={i}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        handleColorChange(p.id, c.image);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-5 h-5 rounded-full border ${
                        selectedColors[p.id] === c.image
                          ? "border-gray-800"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: c.code }}
                    ></button>
                  ))}
                  {p.moreColors > 0 && (
                    <span className="text-gray-400 text-xs">
                      +{p.moreColors}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-3">
                  <span className="bg-[#FF6600] text-white text-[11px] font-semibold px-2 py-[2px] rounded-md">
                    🔥 HOT DEAL
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;
