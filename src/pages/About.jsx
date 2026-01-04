import React from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
  Award, 
  Users, 
  Truck, 
  Shield, 
  Heart,
  Target,
  Globe,
  ThumbsUp,
  Star
} from "lucide-react";
import CustomerReviews from "../components/CustomerReviews";

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "TẦM NHÌN",
      description: "Trở thành thương hiệu thể thao hàng đầu Việt Nam, mang đến trải nghiệm tốt nhất cho người dùng",
      color: "bg-blue-100 text-[#2B4F7B]"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "SỨ MỆNH",
      description: "Truyền cảm hứng sống năng động, khỏe mạnh thông qua những sản phẩm chất lượng",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "GIÁ TRỊ",
      description: "Đề cao tính bền vững, thân thiện với môi trường và trách nhiệm với cộng đồng",
      color: "bg-green-100 text-green-600"
    }
  ];

  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Chất lượng đỉnh cao",
      description: "Sản phẩm đạt chuẩn quốc tế với chất liệu cao cấp"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bảo hành 12 tháng",
      description: "Cam kết bảo hành dài hạn cho tất cả sản phẩm"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Giao hàng toàn quốc",
      description: "Miễn phí vận chuyển cho đơn hàng từ 500.000đ"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn nhiệt tình, luôn sẵn sàng hỗ trợ"
    }
  ];

  const milestones = [
    { year: "2018", title: "Thành lập", description: "EGA Sportswear chính thức ra mắt" },
    { year: "2019", title: "Mở rộng", description: "Có mặt tại 3 thành phố lớn" },
    { year: "2020", title: "10.000 KH", description: "Phục vụ hơn 10.000 khách hàng" },
    { year: "2022", title: "Online", description: "Ra mắt website thương mại điện tử" },
    { year: "2024", title: "Toàn quốc", description: "Phủ sóng toàn quốc với 50+ đại lý" }
  ];

  const team = [
    {
      name: "Trần Minh Anh",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quote: "Chúng tôi tin rằng trang phục thể thao chất lượng sẽ truyền cảm hứng cho lối sống năng động"
    },
    {
      name: "Lê Văn Bình",
      role: "Giám đốc Thiết kế",
      image: "https://cdn.nhandan.vn/images/1ef398c4e2fb4bf07980a2ded785b3ef965303fb1ddec4c99df8bd9658f076278753efade835869db95d723644194f3ae667d376bf869970b83bd2a9ea12e0ea/mark-9867.jpg",
      quote: "Mỗi thiết kế đều mang trong mình câu chuyện và cảm hứng riêng"
    },
    {
      name: "Nguyễn Văn Cẩm",
      role: "Trưởng phòng Kinh doanh",
      image: "https://cdnphoto.dantri.com.vn/sKMZXvcLv9DPOPbyDBvePaZHX_g=/thumb_w/1020/2025/11/07/mjpg-1762475708545.jpg",
      quote: "Khách hàng hài lòng là động lực lớn nhất của chúng tôi"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#2B4F7B] to-[#3A6FB5] text-white py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                VỀ EGA <span className="text-blue-200">SPORTSWEAR</span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl">
                Hơn 6 năm đồng hành cùng cộng đồng yêu thể thao Việt Nam, 
                chúng tôi tự hào mang đến những sản phẩm chất lượng cao, 
                thiết kế thời thượng và dịch vụ tận tâm.
              </p>
              <Link
                to="/collection"
                className="inline-flex items-center px-8 py-3 bg-white text-[#2B4F7B] font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:-translate-y-1"
              >
                KHÁM PHÁ BỘ SƯU TẬP
              </Link>
            </div>
            <div className="lg:text-right">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">6+</div>
                    <div className="text-sm text-blue-200">Năm kinh nghiệm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">50K+</div>
                    <div className="text-sm text-blue-200">Khách hàng hài lòng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">500+</div>
                    <div className="text-sm text-blue-200">Sản phẩm đa dạng</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-sm text-blue-200">Hỗ trợ khách hàng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              CÂU CHUYỆN CỦA CHÚNG TÔI
            </h2>
            <div className="w-24 h-1 bg-[#3A6FB5] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="EGA Sportswear Story"
                  className="relative rounded-xl shadow-lg w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Hành trình từ những bước chân đầu tiên
              </h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  EGA Sportswear được thành lập năm 2018 với sứ mệnh mang đến 
                  cho người Việt những bộ trang phục thể thao chất lượng quốc tế 
                  với giá thành hợp lý.
                </p>
                <p>
                  Bắt đầu từ một xưởng may nhỏ tại TP.HCM, chúng tôi đã không ngừng 
                  nghiên cứu, cải tiến và phát triển để cho ra đời những sản phẩm 
                  đáp ứng nhu cầu đa dạng của người yêu thể thao.
                </p>
                <p>
                  Ngày nay, EGA tự hào là lựa chọn hàng đầu của các vận động viên 
                  chuyên nghiệp, huấn luyện viên và người tập luyện thể thao tại Việt Nam.
                </p>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Chất liệu nhập khẩu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Thiết kế độc quyền</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Sản xuất tại Việt Nam</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Bảo hành dài hạn</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              GIÁ TRỐT CỐT LÕI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những nguyên tắc định hướng cho mọi hoạt động và quyết định của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-full ${value.color} mb-6`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              TẠI SAO CHỌN EGA?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những lý do khiến khách hàng tin tưởng và đồng hành cùng chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 hover:bg-blue-50 rounded-xl transition-all"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3A6FB5] text-white rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              CHẶNG ĐƯỜNG PHÁT TRIỂN
            </h2>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 h-full w-1 bg-blue-200"></div>
            
            {/* Milestones */}
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Year dot */}
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-[#3A6FB5] border-4 border-white z-10"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="text-2xl font-bold text-[#2B4F7B] mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ĐỘI NGŨ CỦA CHÚNG TÔI
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những con người đầy nhiệt huyết đứng sau thành công của EGA Sportswear
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[#3A6FB5] font-medium mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 italic">
                    "{member.quote}"
                  </p>
                  
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#2B4F7B] to-[#3A6FB5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            SẴN SÀNG TRẢI NGHIỆM?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Tham gia cộng đồng hơn 50.000 người yêu thể thao đã tin tưởng lựa chọn EGA
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/collection"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#2B4F7B] font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105"
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              MUA SẮM NGAY
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all"
            >
              LIÊN HỆ CHÚNG TÔI
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;