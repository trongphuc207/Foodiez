import React from 'react';
import { FaTachometerAlt, FaUsers, FaBoxOpen, FaShoppingCart, FaTicketAlt, FaChartBar, FaStar } from 'react-icons/fa';

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div
      className="bg-danger text-white p-3 d-flex flex-column"
      style={{ width: '220px', minHeight: '100vh' }}
    >
      <h5 className="fw-bold text-white mb-4 text-center">🍔 Foodiez Admin</h5>

      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'dashboard' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaTachometerAlt className="me-2" /> Dashboard
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'users' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaUsers className="me-2" /> Users
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'orders' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaShoppingCart className="me-2" /> Orders
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'products' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaBoxOpen className="me-2" /> Products
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'vouchers' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaTicketAlt className="me-2" /> Vouchers
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'reviews' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaStar className="me-2" /> Reviews
          </button>
        </li>

        <li className="nav-item mb-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`nav-link d-flex align-items-center text-white w-100 border-0 bg-transparent ${activeTab === 'reports' ? 'fw-bold bg-dark rounded-2 px-2' : ''}`}
          >
            <FaChartBar className="me-2" /> Reports
          </button>
        </li>
      </ul>

      <div className="mt-auto text-center">
        <hr className="border-light" />
        <small>© 2025 Foodiez Admin</small>
      </div>
    </div>
  );
}
