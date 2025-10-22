import React from "react";
import "./admin.css";

export default function Header() {
  return (
    <header className="admin-header d-flex justify-content-between align-items-center p-3">
      <h4>Admin Dashboard</h4>
      <button className="btn btn-outline-light btn-sm">Logout</button>
    </header>
  );
}
