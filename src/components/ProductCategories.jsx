import React from 'react';
import { Link } from 'react-router-dom';

const ProductCategories = () => {
  const categories = [
    {
      id: 1,
      name: 'Áo ngực thể thao',
      productCount: 12,
      image: '//theme.hstatic.net/200000695155/1001373964/14/season_coll_1_img_large.png?v=16',
      link: '/collection?category=sports-bra'
    },
    {
      id: 2,
      name: 'Quần short',
      productCount: 0,
      image: '//theme.hstatic.net/200000695155/1001373964/14/season_coll_2_img_large.png?v=16',
      link: '/collection?category=shorts'
    },
    {
      id: 3,
      name: 'Áo khoác thể thao',
      productCount: 1,
      image: '//theme.hstatic.net/200000695155/1001373964/14/season_coll_3_img_large.png?v=16',
      link: '/collection?category=jacket'
    },
    {
      id: 4,
      name: 'Quần legging',
      productCount: 8,
      image: '//theme.hstatic.net/200000695155/1001373964/14/season_coll_4_img_large.png?v=16',
      link: '/collection?category=legging'
    },
    {
      id: 5,
      name: 'Áo thun thể thao',
      productCount: 12,
      image: '//theme.hstatic.net/200000695155/1001373964/14/season_coll_5_img_large.png?v=16',
      link: '/collection?category=t-shirt'
    },
    {
      id: 6,
      name: 'Set đồ tập',
      productCount: 19,
      image: '//theme.hstatic.net/200000695155/1001373964/14/season_coll_6_img_large.png?v=16',
      link: '/collection?category=set'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 md:py-10 bg-white">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Danh mục sản phẩm
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          Khám phá bộ sưu tập đồ thể thao chất lượng cao
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={category.link}
            className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Info */}
            <div className="p-2 md:p-3 text-center">
              <h3 className="font-medium text-gray-900 text-sm md:text-base mb-0.5 group-hover:text-[#3A6FB5] transition-colors line-clamp-2">
                {category.name}
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                {category.productCount} sản phẩm
              </p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button className="bg-white text-[#3A6FB5] px-4 py-1.5 rounded-full font-medium text-sm shadow-sm hover:shadow-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                Xem ngay
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductCategories;
