import React from 'react';

export default function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className="stat-trend-badge" style={{ backgroundColor: trend.bg || '#f1f5f9', color: trend.color || '#475569' }}>
            {trend.label}
          </span>
        )}
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
