import React from 'react';
import { Calendar, ShieldAlert, FileSpreadsheet, Trash2, ShieldCheck } from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export default function WarrantyCard({ item, onDelete, onFileClaimForItem }) {
  const isExpired = item.status === 'Expired';
  const isExpiringSoon = item.status === 'Expiring Soon';
  const isActive = item.status === 'Active';

  const getStatusClass = () => {
    if (isActive) return 'active';
    if (isExpiringSoon) return 'expiring-soon';
    return 'expired';
  };

  const getProgressFillClass = () => {
    if (isActive) return 'active';
    if (isExpiringSoon) return 'warning';
    return 'expired';
  };

  const formattedPrice = item.currency === '$'
    ? `₹ ${(Number(item.price) * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : `${item.currency || '₹'} ${Number(item.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <div className="warranty-card">
      <div className="card-top">
        <div className="brand-info">
          <div className="brand-badge-icon">
            <BrandLogoIcon brand={item.brand} domain={item.logoDomain} logoUrl={item.logoUrl} size={28} />
          </div>
          <div className="brand-details">
            <h3 className="brand-name">{item.brand}</h3>
            <span className="model-name">{item.productName || item.model}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <span className={`status-badge ${getStatusClass()}`}>
            <span className={`status-dot ${isActive ? 'dot-active' : isExpiringSoon ? 'dot-warning' : 'dot-expired'}`} />
            {item.status}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
              title="Delete item"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="card-meta">
        <div className="meta-item">
          <Calendar size={14} color="#64748b" />
          <span>{item.expiryFormatted || `Expires ${item.expiryDate || 'N/A'}`}</span>
        </div>
        <div className="meta-item">
          <ShieldAlert size={14} color="#64748b" />
          <span className="meta-value">{formattedPrice}</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-header">
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            {item.protectionType || 'Warranty'} Coverage
          </span>
          <span className="meta-value" style={{ fontSize: '0.78rem' }}>
            {isExpired ? 'Expired' : `${item.daysLeft || 0} days remaining`}
          </span>
        </div>
        <div className="progress-bar-bg" style={{ marginBottom: '0.85rem' }}>
          <div
            className={`progress-bar-fill ${getProgressFillClass()}`}
            style={{ width: `${isExpired ? 100 : item.progressPercentage || 50}%` }}
          />
        </div>

        {/* Direct File Claim CTA button on Card */}
        {onFileClaimForItem && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', backgroundColor: '#f8fafc', borderRadius: '0.65rem' }}
            onClick={(e) => { e.stopPropagation(); onFileClaimForItem(item); }}
          >
            <FileSpreadsheet size={13} color="#2563eb" />
            <span>File Warranty Claim</span>
          </button>
        )}
      </div>
    </div>
  );
}
