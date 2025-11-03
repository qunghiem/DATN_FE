import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaHeart, FaBars, FaTimes } from "react-icons/fa";
import { logout } from "../features/auth/authSlice";
import logo from "../assets/logo.png";
import cart from "../assets/cart.png";
import search from "../assets/search.png";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef();

  const handleLogout = () => {
    dispatch(logout());
    setAvatarMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy chữ cái viết tắt từ tên
  const getInitials = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    const initials = parts
      .map((p) => p.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
    return initials;
  };

  const initials = getInitials(user?.fullName);

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
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-medium uppercase text-gray-700 hover:text-sky-600 transition ${
                  isActive ? "text-sky-600" : ""
                }`
              }
            >
              TRANG CHỦ
            </NavLink>
            <NavLink
              to="/collection"
              className={({ isActive }) =>
                `font-medium uppercase text-gray-700 hover:text-sky-600 transition ${
                  isActive ? "text-sky-600" : ""
                }`
              }
            >
              SẢN PHẨM
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `font-medium uppercase text-gray-700 hover:text-sky-600 transition ${
                  isActive ? "text-sky-600" : ""
                }`
              }
            >
              GIỚI THIỆU
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `font-medium uppercase text-gray-700 hover:text-sky-600 transition ${
                  isActive ? "text-sky-600" : ""
                }`
              }
            >
              LIÊN HỆ
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `font-medium uppercase text-gray-700 hover:text-sky-600 transition ${
                    isActive ? "text-sky-600" : ""
                  }`
                }
              >
                ĐƠN HÀNG
              </NavLink>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 h-10 relative">
            <img
              src={search}
              className="w-5 h-5 cursor-pointer hover:opacity-70 transition"
              alt="Search"
            />

            {/* Avatar */}
            <div className="relative" ref={avatarRef}>
              <img
  src={user?.avatar || "/src/assets/avt.png"}
  alt="Avatar"
  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
  className="w-8 h-8 cursor-pointer rounded-full object-cover transition hover:opacity-80"
  style={{
    border: "none",
    outline: "none",
    boxShadow: "none",
  }}
/>


              {/* Menu con */}
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  {!isAuthenticated ? (
                    <>
                      <NavLink
                        to="/login"
                        className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Đăng nhập
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Đăng ký
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <NavLink
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Thông tin tài khoản
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Đơn hàng của tôi
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
                      >
                        Đăng xuất
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <FaHeart className="text-gray-700 hover:text-sky-600 cursor-pointer transition" />

            {/* Cart icon */}
            <NavLink to="/cart" className="relative">
              <img
                src={cart}
                alt="Cart"
                className="w-5 h-5 cursor-pointer hover:opacity-70 transition"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-sky-500 text-white rounded-full flex items-center justify-center">
                0
              </span>
            </NavLink>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                className="flex items-center justify-center p-0 text-gray-700"
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
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          <NavLink
            to="/"
            className="block px-4 py-3 font-medium uppercase text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
            onClick={() => setMobileMenu(false)}
          >
            TRANG CHỦ
          </NavLink>
          <NavLink
            to="/collection"
            className="block px-4 py-3 font-medium uppercase text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
            onClick={() => setMobileMenu(false)}
          >
            SẢN PHẨM
          </NavLink>
          <NavLink
            to="/about"
            className="block px-4 py-3 font-medium uppercase text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
            onClick={() => setMobileMenu(false)}
          >
            GIỚI THIỆU
          </NavLink>
          <NavLink
            to="/contact"
            className="block px-4 py-3 font-medium uppercase text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
            onClick={() => setMobileMenu(false)}
          >
            LIÊN HỆ
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className="block px-4 py-3 font-medium uppercase text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
              onClick={() => setMobileMenu(false)}
            >
              ĐƠN HÀNG
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
