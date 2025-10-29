import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "./Dashboard";
import Users from "./Users";
import Orders from "./Orders";
import Vouchers from "./Vouchers";
import Reports from "./Reports";
import "./admin.css";
import ProductManagement from "./ProductManagement";


/**
 * Lưu ý:
 * - KHÔNG dùng BrowserRouter ở đây. Router tổng đã bọc ở App chính.
 * - Dùng route tương đối: "", "users", "orders", ...
 * - Ở App chính: <Route path="/admin/*" element={<RouteGuard requiredRole="admin"><AdminApp/></RouteGuard>} />
 */
export default function AdminApp() {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="admin-main">
        <Header />
        <div className="admin-content p-4">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="vouchers" element={<Vouchers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="products" element={<ProductManagement />} />

            {/* fallback */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
