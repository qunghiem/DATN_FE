import React from "react";
import { NavLink } from "react-router-dom";
import {
  ChartBarIcon,
  UsersIcon,
  FireIcon,
  ShoppingBagIcon,
  ReceiptRefundIcon,
  TagIcon,
  FolderIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const menuItems = [
    { name: "Thống kê", path: "/admin", icon: ChartBarIcon },
    { name: "Người dùng", path: "/admin/users", icon: UsersIcon },
    { name: "Sản phẩm bán chạy", path: "/admin/bestseller", icon: FireIcon },
    { name: "Sản phẩm", path: "/admin/products", icon: ShoppingBagIcon },
    { name: "Đơn hàng", path: "/admin/orders", icon: ReceiptRefundIcon },
    { name: "Thương hiệu", path: "/admin/brands", icon: TagIcon },
    { name: "Danh mục", path: "/admin/categories", icon: FolderIcon },
    { name: "Voucher", path: "/admin/vouchers", icon: TicketIcon },
    { name: "Đánh giá", path: "/admin/reviews", icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen sticky top-0 shadow-xl overflow-hidden flex flex-col">
      {/* Header với hiệu ứng gradient */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="font-bold text-lg">QM</span>
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
              Quản lý
            </h1>
            <p className="text-gray-400 text-sm">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 hide-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-blue-500 shadow-md"
                    : "hover:bg-gray-800/50 hover:translate-x-1"
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.path === "/admin" ? "bg-blue-500/20" : "bg-gray-800/50"}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.name}</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </div>

        {/* User section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="px-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-400 rounded-full flex items-center justify-center">
                <span className="font-bold">AD</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Admin</p>
                <p className="text-sm text-gray-400">quanly@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer với version */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Online</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Version 2.1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;