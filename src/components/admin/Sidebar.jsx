import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Sản phẩm", path: "/admin/products" },
    { name: "Đơn hàng", path: "/admin/orders" },
    { name: "Thương hiệu", path: "/admin/brands" },
    { name: "Danh mục", path: "/admin/categories" },
    { name: "Voucher", path: "/admin/vouchers" },
    { name: "Đánh giá", path: "/admin/reviews" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 font-bold text-xl border-b border-gray-200">Admin</div>
      <nav className="mt-4 flex flex-col space-y-2 px-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-100 transition ${
                isActive ? "bg-gray-200 font-semibold" : ""
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;