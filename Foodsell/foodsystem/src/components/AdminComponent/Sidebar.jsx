import React from "react";
import { NavLink } from "react-router-dom";
import "./admin.css";

/**
 * Dùng link TƯƠNG ĐỐI (không có dấu / ở đầu) vì AdminApp được mount tại /admin/*
 * -> "users" => /admin/users
 */
export default function Sidebar() {
  const navs = [
    { path: "", label: "Dashboard", end: true },
    { path: "users", label: "Users" },
    { path: "orders", label: "Orders" },
    { path: "vouchers", label: "Vouchers" },
    { path: "reports", label: "Reports" },
    {path: "products", label: "Products"} // 🔥 thêm
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">Foodiez Admin</div>
      <ul className="admin-nav">
        {navs.map((n) => (
          <li key={n.path}>
            <NavLink
              to={n.path}
              end={n.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {n.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
