import React from 'react';

const Features = () => {
  const features = [
    {
      id: 1,
      title: "Miễn phí vận chuyển",
      description: "Nhận hàng trong vòng 3 ngày",
      // Truck/Delivery icon
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="#6B7280" strokeWidth="2" fill="none"/>
          <path d="M20 28h16v8H20v-8z M36 28h8l4 4v4h-12v-8z M24 40a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M44 40a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" 
                stroke="#6B7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 2,
      title: "Quà tặng hấp dẫn",
      description: "Nhiều ưu đãi khuyến mãi hot",
      // Gift box icon
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="#6B7280" strokeWidth="2" fill="none"/>
          <path d="M18 26h28v4H18v-4z M20 30v14h24V30 M32 26v18 M28 22a4 4 0 0 1 4 4 M36 22a4 4 0 0 0-4 4" 
                stroke="#6B7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 3,
      title: "Bảo đảm chất lượng",
      description: "Sản phẩm đã được kiểm định",
      // Shield check icon
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="#6B7280" strokeWidth="2" fill="none"/>
          <path d="M32 18s-10 4-10 10v10c0 8 10 12 10 12s10-4 10-12V28c0-6-10-10-10-10z M26 32l4 4 8-8" 
                stroke="#6B7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 4,
      title: "Hotline: 19001993",
      description: "Dịch vụ hỗ trợ bạn 24/7",
      // Phone icon
      icon: (
        <svg className="w-12 h-12 md:w-14 md:h-14" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="30" stroke="#6B7280" strokeWidth="2" fill="none"/>
          <path d="M24 22h4l2 6-2 2a16 16 0 0 0 8 8l2-2 6 2v4a2 2 0 0 1-2 2c-10 0-18-8-18-18a2 2 0 0 1 2-2z" 
                stroke="#6B7280" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="w-full px-4 py-8 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center justify-center text-center 
                         p-6 md:p-7 
                         border border-gray-300 rounded-xl 
                         hover:border-gray-400 hover:shadow-lg 
                         transition-all duration-300 
                         bg-white group"
            >
              {/* Icon */}
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;