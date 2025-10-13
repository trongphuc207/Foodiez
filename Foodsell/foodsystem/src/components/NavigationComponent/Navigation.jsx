import React from "react"
import { Link, useLocation } from "react-router-dom"
import "./Navigation.css"

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    { path: "/", label: "🏠 Trang chủ", name: "home" },
    { path: "/products", label: "🍕 Sản phẩm", name: "products" },
    { path: "/orders", label: "📋 Đơn hàng", name: "orders" },
    { path: "/shops", label: "🏪 Cửa hàng", name: "shops" },
    { path: "/about", label: "ℹ️ Giới thiệu", name: "about" }
  ]

  return (
    <nav className="navigation-menu">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export default Navigation