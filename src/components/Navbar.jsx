import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { FaHeart, FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";
import cart from "../assets/cart.png";
import search from "../assets/search.png";
import avt from "../assets/avt.png";

const Navbar = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Ref để detect click ngoài
  const avatarRef = useRef();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAvatarMenuOpen(false);
  };

  // Đóng menu nếu click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <NavLink to="/collection" className="font-medium uppercase text-gray-700 hover:text-gray-900">SẢN PHẨM</NavLink>
            <NavLink to="/about" className="font-medium uppercase text-gray-700 hover:text-gray-900">GIỚI THIỆU</NavLink>
            <NavLink to="/contact" className="font-medium uppercase text-gray-700 hover:text-gray-900">LIÊN HỆ</NavLink>
            <NavLink to="/orders" className="font-medium uppercase text-gray-700 hover:text-gray-900">ĐƠN HÀNG</NavLink>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 h-10 relative">
            <img src={search} className="w-5 h-5 cursor-pointer" alt="" />

            {/* Avatar */}
            <div className="relative" ref={avatarRef}>
              <img
                src={avt}
                className="w-6 h-6 cursor-pointer rounded-full border border-gray-300"
                alt="Avatar"
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              />

              {/* Menu con */}
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  {!isLoggedIn ? (
                    <>
                      <NavLink
                        to="/login"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Đăng nhập
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Đăng ký
                      </NavLink>
                    </>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  )}
                </div>
              )}
            </div>

            <FaHeart className="text-gray-700 hover:text-black cursor-pointer" />

            {/* Cart icon with quantity */}
            <div className="relative">
              <img src={cart} alt="Cart" className="w-5 h-5 cursor-pointer" />
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-black text-white rounded-full flex items-center justify-center">
                0
              </span>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                className="flex items-center justify-center p-0"
                onClick={() => setMobileMenu(!mobileMenu)}
              >
                {mobileMenu ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white shadow-md">
          <NavLink to="/" className="block px-4 py-2 font-medium uppercase text-gray-700 hover:bg-gray-100">SẢN PHẨM</NavLink>
          <NavLink to="/about" className="block px-4 py-2 font-medium uppercase text-gray-700 hover:bg-gray-100">GIỚI THIỆU</NavLink>
          <NavLink to="/contact" className="block px-4 py-2 font-medium uppercase text-gray-700 hover:bg-gray-100">LIÊN HỆ</NavLink>
          <NavLink to="/orders" className="block px-4 py-2 font-medium uppercase text-gray-700 hover:bg-gray-100">ĐƠN HÀNG</NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
