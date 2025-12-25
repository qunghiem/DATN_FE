import React from 'react';
import { Users, Target, Globe, Shield, Award, Heart } from 'lucide-react';

const About = () => {
  // Fixed data for the about page
  const companyInfo = {
    name: "YINLI",
    slogan: "Thời trang cho mọi người",
    foundedYear: 2015,
    headquarters: "Hà Nội, Việt Nam",
    employees: 150,
    stores: 25,
    customers: 100000,
  };

  const teamMembers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      position: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
      description: "15 năm kinh nghiệm trong ngành thời trang"
    },
    {
      id: 2,
      name: "Trần Thị B",
      position: "Giám đốc Thiết kế",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      description: "Cựu sinh viên London College of Fashion"
    },
    {
      id: 3,
      name: "Lê Văn C",
      position: "Giám đốc Kinh doanh",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w-400&h=400&fit=crop",
      description: "Chuyên gia phát triển thị trường"
    },
    {
      id: 4,
      name: "Phạm Thị D",
      position: "Trưởng phòng CSKH",
      image: "https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w=400&h=400&fit=crop",
      description: "8 năm kinh nghiệm chăm sóc khách hàng"
    }
  ];

  const milestones = [
    { year: 2015, event: "Thành lập YINLI tại Hà Nội" },
    { year: 2017, event: "Mở cửa hàng đầu tiên" },
    { year: 2019, event: "Đạt mốc 10.000 khách hàng" },
    { year: 2020, event: "Ra mắt cửa hàng online" },
    { year: 2022, event: "Mở rộng 25 cửa hàng toàn quốc" },
    { year: 2023, event: "Đón khách hàng thứ 100.000" }
  ];

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Tầm nhìn",
      description: "Trở thành thương hiệu thời trang hàng đầu Việt Nam, mang đến trải nghiệm mua sắm xuất sắc cho khách hàng"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Sứ mệnh",
      description: "Đem lại những sản phẩm chất lượng với giá cả hợp lý, phù hợp với mọi đối tượng khách hàng"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Giá trị cốt lõi",
      description: "Chất lượng - Sáng tạo - Trung thực - Tận tâm - Phát triển bền vững"
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, label: "Khách hàng", value: "100.000+", suffix: "" },
    { icon: <Award className="w-6 h-6" />, label: "Sản phẩm", value: "5000+", suffix: "" },
    { icon: <Globe className="w-6 h-6" />, label: "Cửa hàng", value: "25", suffix: "" },
    { icon: <Shield className="w-6 h-6" />, label: "Bảo hành", value: "12", suffix: " tháng" }
  ];

  const achievements = [
    "Giải thưởng Thương hiệu Thời trang Xuất sắc 2022",
    "Top 10 Doanh nghiệp Thời trang phát triển nhanh nhất 2023",
    "Chứng nhận Sản phẩm Xanh 2023",
    "Giải thưởng Trải nghiệm Khách hàng Xuất sắc 2024"
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#003EA7] to-[#3A6FB5] text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Về <span className="text-yellow-300">EGASPORT</span>
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Hành trình 10 năm đồng hành cùng phong cách thời trang Việt
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-[#003EA7] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Khám phá bộ sưu tập
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                  Liên hệ với chúng tôi
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=500&fit=crop" 
                  alt="Store interior" 
                  className="rounded-lg shadow-xl"
                />
                <img 
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=300&fit=crop" 
                  alt="Fashion collection" 
                  className="rounded-lg shadow-xl mt-8"
                />
                <img 
                  src="https://images.unsplash.com/photo-1558769132-cb1a40ed0ada?w=400&h=300&fit=crop" 
                  alt="Team work" 
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            EGASPORT trong số
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3A6FB5] text-white rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.value}<span className="text-lg">{stat.suffix}</span>
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Câu chuyện của chúng tôi</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-[#003EA7]">Từ ý tưởng đến hiện thực</h3>
                <p className="text-gray-600 mb-4">
                  YINLI được thành lập năm {companyInfo.foundedYear} với sứ mệnh mang đến những sản phẩm thời trang chất lượng, hợp thời và phù hợp với túi tiền của người Việt. 
                </p>
                <p className="text-gray-600 mb-4">
                  Từ một cửa hàng nhỏ tại {companyInfo.headquarters}, chúng tôi đã phát triển thành hệ thống {companyInfo.stores} cửa hàng trên toàn quốc, phục vụ hơn {companyInfo.customers.toLocaleString()} khách hàng.
                </p>
                <p className="text-gray-600">
                  Với đội ngũ {companyInfo.employees} nhân viên tận tâm, chúng tôi không ngừng sáng tạo và cải thiện để mang đến trải nghiệm mua sắm tốt nhất.
                </p>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" 
                  alt="Our story" 
                  className="rounded-xl w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Giá trị & Tầm nhìn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#3A6FB5] to-[#003EA7] text-white rounded-full mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Chặng đường phát triển</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#3A6FB5] to-[#003EA7]"></div>
            
            {milestones.map((milestone, index) => (
              <div 
                key={index} 
                className={`relative mb-8 ${index % 2 === 0 ? 'md:pr-1/2 md:pl-8' : 'md:pl-1/2 md:pr-8'} pl-8`}
              >
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-[#3A6FB5] rounded-full"></div>
                <div className="bg-white rounded-xl shadow-lg p-6 ml-4 border border-gray-100">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-2xl font-bold text-[#003EA7]">{milestone.year}</span>
                    <div className="w-8 h-1 bg-gradient-to-r from-[#3A6FB5] to-[#003EA7]"></div>
                  </div>
                  <p className="text-gray-800 font-medium">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Đội ngũ lãnh đạo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1 text-gray-800">{member.name}</h3>
                  <p className="text-[#3A6FB5] font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Thành tựu & Giải thưởng</h2>
          <div className="bg-gradient-to-r from-[#003EA7] to-[#3A6FB5] rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
                >
                  <Award className="w-6 h-6 flex-shrink-0 mt-1" />
                  <p className="font-medium">{achievement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commitment */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Cam kết của chúng tôi</h2>
            <p className="text-gray-600 text-lg mb-8">
              Chúng tôi cam kết mang đến những sản phẩm chất lượng nhất, dịch vụ xuất sắc và trải nghiệm mua sắm đáng nhớ. 
              Mỗi sản phẩm YINLI là kết tinh của sự sáng tạo, tỉ mỉ và tâm huyết.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Chất lượng đảm bảo</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Giá cả cạnh tranh</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Giao hàng nhanh chóng</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Sẵn sàng trải nghiệm YINLI?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Khám phá bộ sưu tập mới nhất và nhận ưu đãi đặc biệt dành riêng cho bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#3A6FB5] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2E5C99] transition">
              Mua sắm ngay
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Liên hệ tư vấn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;