// src/layouts/AdminLayout.jsx
import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Home, Users, Settings } from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import Topbar from "../components/admin/Topbar";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Kiểm tra quyền admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "ADMIN") {
      navigate("/"); // Redirect nếu không phải admin
    }
  }, [navigate]);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
