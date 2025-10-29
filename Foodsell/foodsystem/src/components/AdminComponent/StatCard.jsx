// src/components/AdminComponent/StatCard.jsx
import React from 'react';
import './admin.css';

export default function StatCard({ title, value, icon, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} role={onClick ? 'button' : undefined} style={onClick ? {cursor:'pointer'} : undefined}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h5>{title}</h5>
        <h3>{value}</h3>
      </div>
    </div>
  );
}
