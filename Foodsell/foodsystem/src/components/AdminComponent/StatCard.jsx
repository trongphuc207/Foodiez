// src/components/AdminComponent/StatCard.jsx
import React from 'react';
import './admin.css';

export default function StatCard({ title, value, icon, onClick, color = 'primary' }) {
  return (
    <div 
      className={`stat-card stat-card-${color}`}
      onClick={onClick} 
      role={onClick ? 'button' : undefined} 
      style={onClick ? {cursor:'pointer'} : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="icon">{icon}</div>
      <div className="title">{title}</div>
      <div className="value">{value}</div>
      {onClick && (
        <div className="stat-card-arrow">→</div>
      )}
    </div>
  );
}
