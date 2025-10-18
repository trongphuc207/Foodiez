import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaShoppingCart, FaTicketAlt, FaChartBar } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <div
      className="bg-danger text-white p-3 d-flex flex-column"
      style={{ width: '220px', minHeight: '100vh' }}
    >
      <h5 className="fw-bold text-white mb-4 text-center">🍔 Foodiez Admin</h5>

      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center text-white ${isActive ? 'fw-bold bg-dark rounded-2 px-2' : ''}`
            }
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center text-white ${isActive ? 'fw-bold bg-dark rounded-2 px-2' : ''}`
            }
          >
            <FaUsers className="me-2" /> Users
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center text-white ${isActive ? 'fw-bold bg-dark rounded-2 px-2' : ''}`
            }
          >
            <FaShoppingCart className="me-2" /> Orders
          </NavLink>
        </li>

        {/* ✅ Thêm mục Products */}
        <li className="nav-item mb-2">
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center text-white ${isActive ? 'fw-bold bg-dark rounded-2 px-2' : ''}`
            }
          >
            <FaBoxOpen className="me-2" /> Products
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/admin/vouchers"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center text-white ${isActive ? 'fw-bold bg-dark rounded-2 px-2' : ''}`
            }
          >
            <FaTicketAlt className="me-2" /> Vouchers
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center text-white ${isActive ? 'fw-bold bg-dark rounded-2 px-2' : ''}`
            }
          >
            <FaChartBar className="me-2" /> Reports
          </NavLink>
        </li>
      </ul>

      <div className="mt-auto text-center">
        <hr className="border-light" />
        <small>© 2025 Foodiez Admin</small>
      </div>
    </div>
  );
}
