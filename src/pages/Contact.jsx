import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, submitted: false, error: null });

    // Simulate API call
    setTimeout(() => {
      setFormStatus({ 
        submitting: false, 
        submitted: true, 
        error: null 
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, submitted: false }));
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "ĐỊA CHỈ",
      content: "123 Nguyễn Duy Cung, Phường 10, TP.HCM",
      link: "https://maps.google.com/?q=123+Nguyễn+Duy+Cung,+Phường+10,+TP.HCM",
      color: "bg-blue-100 text-[#2B4F7B]"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "ĐIỆN THOẠI",
      content: "0999 999 999",
      link: "tel:0999999999",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "EMAIL",
      content: "nhom5@gmail.com",
      link: "mailto: nhom5@gmail.com",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "GIỜ LÀM VIỆC",
      content: "Thứ 2 - Chủ nhật: 8:00 - 21:00",
      subContent: "Kể cả ngày lễ, Tết",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const faqs = [
    {
      question: "Làm thế nào để đặt hàng?",
      answer: "Bạn có thể đặt hàng trực tiếp trên website, qua hotline 0999 999 999 hoặc đến trực tiếp cửa hàng của chúng tôi."
    },
    {
      question: "Thời gian giao hàng bao lâu?",
      answer: "TP.HCM: 1-2 ngày làm việc. Các tỉnh thành khác: 3-7 ngày làm việc tùy vào địa điểm."
    },
    {
      question: "Chính sách đổi trả như thế nào?",
      answer: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm còn nguyên tem mác, chưa qua sử dụng."
    },
    {
      question: "Có hỗ trợ in logo cho doanh nghiệp không?",
      answer: "Có, chúng tôi nhận đặt may đồng phục thể thao và in logo theo yêu cầu của doanh nghiệp."
    }
  ];

  const socialMedia = [
    {
      platform: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      link: "https://facebook.com/ega.sportswear",
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      handle: "@ega.sportswear"
    },
    {
      platform: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      link: "https://instagram.com/ega.sportswear",
      color: "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      handle: "@ega.sportswear"
    },
    {
      platform: "Zalo",
      icon: <MessageSquare className="w-5 h-5" />,
      link: "https://zalo.me/0999999999",
      color: "bg-[#0068FF] hover:bg-[#005CE6]",
      handle: "0999 999 999"
    },
    {
      platform: "Tiktok",
      icon: <Youtube className="w-5 h-5" />,
      link: "https://tiktok.com/@ega.sportswear",
      color: "bg-black hover:bg-gray-900",
      handle: "@ega.sportswear"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#2B4F7B] to-[#3A6FB5] text-white py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              LIÊN HỆ VỚI CHÚNG TÔI
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
              Hãy liên hệ ngay để được tư vấn và giải đáp mọi thắc mắc.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <a
                key={index}
                href={info.link}
                target={info.link?.startsWith('http') ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#3A6FB5]">
                  <div className={`inline-flex p-3 rounded-lg ${info.color} mb-4 group-hover:scale-110 transition-transform`}>
                    {info.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    {info.title}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    {info.content}
                  </p>
                  {info.subContent && (
                    <p className="text-sm text-gray-500">
                      {info.subContent}
                    </p>
                  )}
                  {info.link && (
                    <div className="flex items-center gap-1 mt-3 text-[#3A6FB5] font-medium">
                      <span className="text-sm">Xem chi tiết</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    GỬI TIN NHẮN CHO CHÚNG TÔI
                  </h2>
                  <p className="text-gray-600">
                    Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất
                  </p>
                </div>

                {formStatus.submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      Gửi thành công!
                    </h3>
                    <p className="text-green-600 mb-4">
                      Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                    </p>
                    <button
                      onClick={() => setFormStatus({ submitting: false, submitted: false, error: null })}
                      className="text-[#3A6FB5] font-medium hover:text-[#2B4F7B]"
                    >
                      Gửi tin nhắn mới
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-[#3A6FB5] outline-none transition"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-[#3A6FB5] outline-none transition"
                            placeholder="0999 999 999"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-[#3A6FB5] outline-none transition"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chủ đề *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-[#3A6FB5] outline-none transition"
                        >
                          <option value="">Chọn chủ đề</option>
                          <option value="product">Tư vấn sản phẩm</option>
                          <option value="order">Hỗ trợ đơn hàng</option>
                          <option value="warranty">Bảo hành/Đổi trả</option>
                          <option value="business">Hợp tác kinh doanh</option>
                          <option value="other">Vấn đề khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nội dung *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows="6"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3A6FB5] focus:border-[#3A6FB5] outline-none transition resize-none"
                          placeholder="Xin vui lòng mô tả chi tiết nội dung bạn muốn liên hệ..."
                        ></textarea>
                      </div>

                      {formStatus.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">{formStatus.error}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={formStatus.submitting}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2B4F7B] to-[#3A6FB5] text-white font-semibold rounded-lg hover:opacity-90 transition-all transform hover:-translate-y-1 ${formStatus.submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {formStatus.submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            GỬI TIN NHẮN NGAY
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Kết nối với chúng tôi
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all hover:scale-105 ${social.color}`}
                    >
                      {social.icon}
                      <span className="font-medium">{social.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map & FAQ */}
            <div className="space-y-8">
              {/* Google Map */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 relative">
                  {/* Map Placeholder - Replace with actual Google Maps embed */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-[#3A6FB5] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        EGA Sportswear Store
                      </h3>
                      <p className="text-gray-600">
                        150/8 Nguyễn Duy Cung, Phường 12, Gò Vấp, TP.HCM
                      </p>
                      <a
                        href="https://maps.google.com/?q=150/8+Nguyễn+Duy+Cung,+Phường+12,+Gò+Vấp,+TP.HCM"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-[#3A6FB5] font-medium hover:text-[#2B4F7B]"
                      >
                        <span>Xem trên Google Maps</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Hướng dẫn đường đi
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Từ ngã tư Phan Văn Trị - Nguyễn Duy Cung, đi vào hẻm 150 khoảng 100m, 
                    cửa hàng nằm bên tay phải. Có chỗ đỗ xe ô tô và xe máy miễn phí.
                  </p>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Câu hỏi thường gặp
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#3A6FB5] transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link
                    to="/faq"
                    className="inline-flex items-center gap-2 text-[#3A6FB5] font-medium hover:text-[#2B4F7B]"
                  >
                    <span>Xem tất cả câu hỏi thường gặp</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              HỆ THỐNG CỬA HÀNG
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ghé thăm các cửa hàng của chúng tôi để trải nghiệm sản phẩm trực tiếp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                city: "TP. HỒ CHÍ MINH",
                address: "150/8 Nguyễn Duy Cung, P.12, Gò Vấp",
                phone: "0999 999 991",
                hours: "8:00 - 21:00",
                featured: true
              },
              {
                city: "HÀ NỘI",
                address: "25 Láng Hạ, P. Thành Công, Ba Đình",
                phone: "0999 999 992",
                hours: "8:00 - 20:00"
              },
              {
                city: "ĐÀ NẴNG",
                address: "78 Nguyễn Văn Linh, P. Hải Châu",
                phone: "0999 999 993",
                hours: "8:00 - 20:00"
              }
            ].map((store, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 ${store.featured ? 'border-[#3A6FB5]' : 'border-gray-100'} hover:shadow-xl transition-all`}
              >
                {store.featured && (
                  <div className="inline-flex items-center px-3 py-1 bg-[#3A6FB5] text-white text-xs font-medium rounded-full mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    TRỤ SỞ CHÍNH
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {store.city}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${store.phone}`} className="text-gray-600 hover:text-[#3A6FB5]">
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{store.hours}</span>
                  </div>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Chỉ đường
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[#2B4F7B] to-[#3A6FB5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              CẦN HỖ TRỢ NGAY LẬP TỨC?
            </h2>
            <p className="text-blue-100 mb-6">
              Gọi ngay cho chúng tôi để được tư vấn và hỗ trợ nhanh chóng nhất
            </p>
            <a
              href="tel:0999999999"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#2B4F7B] font-bold text-lg rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <Phone className="w-6 h-6" />
              <div className="text-left">
                <div className="text-sm font-medium">HOTLINE 24/7</div>
                <div className="text-2xl">0999 999 999</div>
              </div>
            </a>
            <p className="text-blue-100 text-sm mt-4">
              Chúng tôi hỗ trợ từ 8:00 - 21:00 hàng ngày, kể cả cuối tuần và ngày lễ
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;