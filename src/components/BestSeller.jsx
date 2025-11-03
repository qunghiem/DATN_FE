import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronRight } from "lucide-react";

const BestSeller = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  const handleColorChange = (id, img) =>
    setSelectedColors((prev) => ({ ...prev, [id]: img }));

  const products = [
    {
      id: 1,
      name: "Áo bra tập gym yoga",
      brand: "KHÁC",
      price: 245000,
      originalPrice: 300000,
      discount: -19,
      image:
        "https://product.hstatic.net/200000695155/product/photo_2023-08-09_11.07.48_92d82ccacb8b49e3a602c8ba55bd732d_1024x1024.jpeg",
      colors: [
        {
          name: "Đen",
          code: "#000000",
          image:
            "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=800&fit=crop",
        },
        {
          name: "Xanh navy",
          code: "#1e3a8a",
          image:
            "https://product.hstatic.net/200000695155/product/frame_47_8f37706fe9034437bb5e64128769ec22_1024x1024.jpg",
        },
      ],
      moreColors: 4,
      link: "/product/1",
    },
    {
      id: 2,
      name: "Áo bra tập gym yoga - Test",
      brand: "KHÁC",
      price: 245000,
      originalPrice: 300000,
      discount: -19,
      image:
        "https://product.hstatic.net/200000695155/product/frame_49_80e8c13966cd41e58d6ee1e783a48921_1024x1024.jpg",
      colors: [
        {
          name: "Đen",
          code: "#000000",
          image:
            "https://product.hstatic.net/200000695155/product/frame_49_80e8c13966cd41e58d6ee1e783a48921_1024x1024.jpg",
        },
      ],
      moreColors: 0,
      link: "/product/2",
    },
    {
      id: 3,
      name: "Áo croptop tập gym yoga",
      brand: "YIHLI",
      price: 290000,
      originalPrice: 350000,
      discount: -18,
      image:
        "https://product.hstatic.net/200000695155/product/image_114_9bf71f0ab30f449cb67f0eba40627f42_1024x1024.png",
      colors: [
        {
          name: "Đen",
          code: "#000000",
          image:
            "https://product.hstatic.net/200000695155/product/image_114_9bf71f0ab30f449cb67f0eba40627f42_1024x1024.png",
        },
        {
          name: "Be",
          code: "#D2B48C",
          image:
            "https://product.hstatic.net/200000695155/product/image_115_8c295f79b690410a8f1bb72e3821c2ea_1024x1024.png",
        },
      ],
      moreColors: 7,
      link: "/product/3",
    },
    {
      id: 4,
      name: "Áo khoác thể thao",
      brand: "EGA",
      price: 350000,
      originalPrice: 450000,
      discount: -23,
      image:
        "https://product.hstatic.net/200000695155/product/image_83_6246419341e9426ca85a2ec86e41d9e0_1024x1024.jpg",
      colors: [
        {
          name: "Hồng",
          code: "#FFC0CB",
          image:
            "https://product.hstatic.net/200000695155/product/image_82_b6b195c0c5694202b3d257fc5356e71f_1024x1024.jpg",
        },
        {
          name: "Đen",
          code: "#000000",
          image:
            "https://product.hstatic.net/200000695155/product/image_85_24f072606da84af2abc7babf7f103927_1024x1024.jpg",
        },
      ],
      moreColors: 4,
      link: "/product/4",
    },
  ];

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
        {/* Mobile: 1.5 products | Tablet (768-1200): 3.5 products | Desktop (>1200): Grid 4 columns */}
        <div className="flex gap-3 md:gap-4 lg:grid lg:grid-cols-4 lg:gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex-none w-[65%] md:w-[27.5%] lg:flex-auto lg:w-auto bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-transform"
            >
              <Link to={p.link} className="block relative aspect-[3/4]">
                <img
                  src={selectedColors[p.id] || p.image}
                  alt={p.name}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(p.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition ${
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
              </Link>

              <div className="p-3">
                <p className="text-gray-500 text-xs">{p.brand}</p>
                <Link
                  to={p.link}
                  className="block font-semibold text-gray-800 text-sm mt-1 mb-1 line-clamp-2 hover:text-[#3A6FB5] transition"
                >
                  {p.name}
                </Link>

                {/* Price */}
                <div className="flex items-center gap-1">
                  <span className="text-[#3A6FB5] font-bold text-sm">
                    {p.price.toLocaleString("vi-VN")}₫
                  </span>
                  {p.originalPrice && (
                    <>
                      <span className="text-gray-400 text-xs line-through">
                        {p.originalPrice.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-red-500 text-xs font-medium">
                        {p.discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Colors */}
                <div className="flex items-center gap-1.5 mt-2">
                  {p.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleColorChange(p.id, c.image)}
                      className={`w-5 h-5 rounded-full border-2 transition ${
                        (selectedColors[p.id] || p.image) === c.image
                          ? "border-[#3A6FB5] scale-110"
                          : "border-gray-300 hover:border-[#3A6FB5]"
                      }`}
                      style={{ backgroundColor: c.code }}
                      title={c.name}
                    ></button>
                  ))}
                  {p.moreColors > 0 && (
                    <span className="text-gray-500 text-xs">
                      +{p.moreColors}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button (Mobile & Tablet) */}
      <div className="mt-6 text-center lg:hidden">
        <Link
          to="/collection"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-[#3A6FB5] text-white rounded-full hover:bg-[#2E5C99] transition shadow-sm"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default BestSeller;