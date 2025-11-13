import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "./Dashboard";
import Users from "./Users";
import Orders from "./Orders";
import Vouchers from "./Vouchers";
import Reports from "./Reports";
import Shops from "./Shops";
import RoleApplications from "./RoleApplications";
import ProductApproval from "./ProductApproval";
import ComplaintManagement from "./ComplaintManagement/ComplaintManagement";
import "./admin.css";
import "./admin-white-theme-override.css";


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
            <Route path="shops" element={<Shops />} />
            <Route path="role-applications" element={<RoleApplications />} />
            <Route path="product-approval" element={<ProductApproval />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="reports" element={<Reports />} />

            {/* fallback */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
