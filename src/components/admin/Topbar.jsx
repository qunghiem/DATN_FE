import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Chào mừng, {user?.fullName || "Admin"}
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Topbar;