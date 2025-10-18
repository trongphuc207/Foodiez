// src/components/AdminComponent/StatCard.jsx
import React from 'react';
import './admin.css';

export default function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h5>{title}</h5>
        <h3>{value}</h3>
      </div>
    </div>
  );
}
