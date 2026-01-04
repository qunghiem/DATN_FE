import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const reviews = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      role: "Vận động viên chuyên nghiệp",
      content: "Sản phẩm chất lượng tuyệt vời! Áo thun EGA thấm hút mồ hôi tốt, mặc thoải mái ngay cả trong những buổi tập dài. Tôi đã mua nhiều lần và luôn hài lòng.",
      rating: 5,
      date: "15/03/2024",
    },
    {
      id: 2,
      name: "Trần Thị Bích",
      role: "Huấn luyện viên gym",
      content: "Thiết kế đẹp, chất liệu bền. Các học viên của tôi đều đánh giá cao sản phẩm của EGA Sportswear. Đặc biệt là chính sách đổi trả rất dễ dàng.",
      rating: 4,
      date: "22/02/2024",
    },
    {
      id: 3,
      name: "Lê Minh Đức",
      role: "Sinh viên đại học",
      content: "Giá cả hợp lý với chất lượng. Tôi thích các mẫu áo polo của EGA vì có thể mặc đi học, đi chơi đều được. Màu sắc giữ rất lâu sau nhiều lần giặt.",
      rating: 5,
      date: "10/03/2024",
    },
    {
      id: 4,
      name: "Phạm Hương Lan",
      role: "Doanh nhân",
      content: "Tôi mua đồng phục thể thao cho công ty từ EGA và rất hài lòng. Dịch vụ tư vấn chuyên nghiệp, giao hàng đúng hẹn. Nhân viên ai cũng khen đồ đẹp.",
      rating: 5,
      date: "05/03/2024",
    },
    {
      id: 5,
      name: "Hoàng Văn Cường",
      role: "Cầu thủ bóng đá",
      content: "Chất vải co giãn tốt, phù hợp cho các môn thể thao vận động mạnh. Đội bóng của tôi đã đặt nhiều bộ và đều được may đo theo yêu cầu.",
      rating: 4,
      date: "28/02/2024",
    },
  ];

  const nextReview = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToReview = (index) => {
    setCurrentIndex(index);
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#3A6FB5] text-white mb-4">
            <Quote className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Lắng nghe cảm nhận và trải nghiệm thực tế từ khách hàng đã sử dụng sản phẩm của EGA Sportswear
          </p>
        </div>

        {/* Main Review Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Review Content */}
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#2B4F7B] flex items-center justify-center text-white font-bold text-lg">
                  {reviews[currentIndex].name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {reviews[currentIndex].name}
                  </h3>
                  <p className="text-sm text-[#3A6FB5] font-medium">
                    {reviews[currentIndex].role}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                {renderStars(reviews[currentIndex].rating)}
              </div>

              <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4 italic">
                "{reviews[currentIndex].content}"
              </p>

              <div className="text-sm text-gray-500">
                Đánh giá vào {reviews[currentIndex].date}
              </div>
            </div>

            {/* Stats Section */}
            <div className="lg:w-1/3 bg-gray-50 rounded-lg p-6 border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">
                ĐÁNH GIÁ TỔNG QUAN
              </h4>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">5 sao</span>
                    <span className="text-sm font-medium text-gray-900">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">4 sao</span>
                    <span className="text-sm font-medium text-gray-900">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: '25%' }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">3 sao</span>
                    <span className="text-sm font-medium text-gray-900">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: '10%' }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-3xl font-bold text-gray-900">4.7</div>
                    <div className="flex flex-col">
                      <div className="flex">{renderStars(4.7)}</div>
                      <div className="text-sm text-gray-500">dựa trên 128 đánh giá</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Review Indicators */}
          <div className="flex items-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-[#3A6FB5] w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Xem đánh giá ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevReview}
              className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-[#3A6FB5] hover:text-white hover:border-[#3A6FB5] transition-all"
              aria-label="Đánh giá trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-gray-700 font-medium">
              {currentIndex + 1} / {reviews.length}
            </span>
            
            <button
              onClick={nextReview}
              className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-[#3A6FB5] hover:text-white hover:border-[#3A6FB5] transition-all"
              aria-label="Đánh giá tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">
            Bạn đã trải nghiệm sản phẩm của chúng tôi?
          </p>
          <button className="px-6 py-3 bg-[#3A6FB5] hover:bg-[#2B4F7B] text-white font-medium rounded-lg transition-all hover:scale-105">
            VIẾT ĐÁNH GIÁ NGAY
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;