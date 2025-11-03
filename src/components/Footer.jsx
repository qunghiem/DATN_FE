import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronUp,
} from "lucide-react";
import logo from "../assets/logo.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Đã đăng ký nhận tin với email: ${email}`);
      setEmail("");
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#2B4F7B] text-white relative">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* GRID MAIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 text-sm">
            <Link to="/" className="inline-block mb-3">
              <img
                src={logo}
                alt="EGA Sportswear"
                className="h-8 sm:h-10 brightness-0 invert"
              />
            </Link>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-1 text-blue-300" />
                <p>150/8 Nguyễn Duy Cung, Phường 12, Tp.HCM</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-300" />
                <a
                  href="tel:0999999999"
                  className="hover:text-blue-200 transition"
                >
                  0999999999
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-300" />
                <a
                  href="mailto:support@egany.com"
                  className="hover:text-blue-200 transition"
                >
                  support@egany.com
                </a>
              </div>
            </div>
            <p className="pt-2 text-xs text-gray-300">
              © Bản quyền <span className="text-blue-300 font-semibold">EGANY</span> | Cung cấp bởi{" "}
              <a
                href="https://haravan.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-300 hover:text-white"
              >
                Haravan
              </a>
            </p>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3">HỖ TRỢ</h3>
            <ul className="space-y-1.5 text-sm">
              {["Tìm kiếm", "Giới thiệu", "Liên hệ", "Cửa hàng"].map((t, i) => (
                <li key={i}>
                  <Link
                    to="/"
                    className="text-gray-200 hover:text-white inline-block transition-all hover:translate-x-1"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3">CHÍNH SÁCH</h3>
            <ul className="space-y-1.5 text-sm">
              {[
                "Điều khoản dịch vụ",
                "Chính sách bảo mật",
                "Chính sách đổi trả",
                "Hướng dẫn đổi hàng",
              ].map((t, i) => (
                <li key={i}>
                  <Link
                    to="/"
                    className="text-gray-200 hover:text-white inline-block transition-all hover:translate-x-1"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3">
              ĐĂNG KÝ NHẬN TIN
            </h3>
            <form onSubmit={handleSubscribe} className="flex mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                className="flex-1 px-3 py-2 text-sm rounded-l-md bg-white/10 border border-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3A6FB5]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3A6FB5] hover:bg-[#335e99] text-white text-sm rounded-r-md transition"
              >
                Gửi
              </button>
            </form>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {[
                { Icon: Facebook, color: "bg-[#3A6FB5]" },
                { Icon: Twitter, color: "bg-sky-500" },
                { Icon: Instagram, color: "bg-gradient-to-br from-pink-500 to-orange-500" },
                { Icon: Youtube, color: "bg-red-600" },
              ].map(({ Icon, color }, i) => (
                <a
                  key={i}
                  href="#"
                  className={`w-8 h-8 rounded-full ${color} flex items-center justify-center hover:scale-110 transition`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Payment + Certification */}
        <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap justify-center gap-3">
          <img
            src="http://online.gov.vn/Content/EndUser/LogoCCDVSaleNoti/logoSaleNoti.png"
            alt="Bộ Công Thương"
            className="h-8"
          />
          <img
            src="https://images.dmca.com/Badges/dmca_protected_sml_120m.png"
            alt="DMCA"
            className="h-8"
          />
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md">
            {[
              "https://cdn-icons-png.flaticon.com/512/349/349221.png",
              "https://cdn-icons-png.flaticon.com/512/349/349228.png",
              "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png",
              "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
              "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png",
            ].map((src, i) => (
              <img key={i} src={src} alt="Payment" className="h-5" />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 w-10 h-10 bg-[#3A6FB5] hover:bg-[#335e99] rounded-full flex items-center justify-center shadow-lg transition hover:scale-110"
      >
        <ChevronUp className="w-5 h-5 text-white" />
      </button>
    </footer>
  );
};

export default Footer;
