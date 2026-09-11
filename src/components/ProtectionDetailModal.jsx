import React from 'react';
import { X, Calendar, ShieldCheck, FileText, FileSpreadsheet, Paperclip, CheckCircle2, Clock, Award, Tag, DollarSign, Store } from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';
import { formatINR } from '../utils/warrantyCalculator';

export default function ProtectionDetailModal({ protection, onClose, onFileClaimForItem }) {
  if (!protection) return null;

  const brand = protection.brand || 'Apple';
  const productName = protection.productName || protection.model || 'Smart Product';
  const modelNumber = protection.modelNumber || 'A3101';
  const serialNumber = protection.serialNumber || 'SN-VERIFIED-9910';
  const price = protection.price || 0;
  const currency = protection.currency || '₹';
  const purchaseDate = protection.purchaseDate || '2026-09-11';
  const expiryDate = protection.expiryDate || '2027-09-11';
  const status = protection.status || 'Active';
  const daysLeft = protection.daysLeft || 365;
  const warrantySource = protection.warrantySource || 'Invoice + Warranty Card';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="brand-badge-icon" style={{ width: '46px', height: '46px' }}>
              <BrandLogoIcon brand={brand} domain={protection.logoDomain} logoUrl={protection.logoUrl} size={26} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{brand} {productName}</h2>
              <span className="status-badge active" style={{ fontSize: '0.72rem' }}>{status} Protection</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Visual Warranty Timeline Bar */}
          <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#2563eb" /> Warranty Expiry Timeline
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                {daysLeft} days remaining
              </span>
            </div>

            {/* Timeline Graphic */}
            <div style={{ position: 'relative', marginTop: '1rem', marginBottom: '0.5rem' }}>
              <div className="progress-bar-bg" style={{ height: '10px' }}>
                <div
                  className="progress-bar-fill active"
                  style={{ width: `${Math.min(100, Math.max(15, protection.progressPercentage || 40))}%` }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 600 }}>
                <div>
                  <span style={{ display: 'block', color: '#0f172a', fontWeight: 800 }}>Purchase Date</span>
                  <span>{purchaseDate}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: '#2563eb', fontWeight: 800 }}>Today</span>
                  <span>Active</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: '#15803d', fontWeight: 800 }}>Expiry Date</span>
                  <span>{expiryDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product & Purchase Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Product Information */}
            <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
                Product Information
              </span>
              <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Brand:</strong> {brand}</div>
                <div><strong>Product Name:</strong> {productName}</div>
                <div><strong>Model Number:</strong> {modelNumber}</div>
                <div><strong>Serial / IMEI / VIN:</strong> <span style={{ fontFamily: 'monospace', color: '#1d4ed8', fontWeight: 700 }}>{serialNumber}</span></div>
              </div>
            </div>

            {/* Purchase Information */}
            <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
                Purchase Information
              </span>
              <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Seller / Store:</strong> {protection.seller || `${brand} Retail`}</div>
                <div><strong>Purchase Date:</strong> {purchaseDate}</div>
                <div><strong>Protected Price:</strong> {formatINR(price, currency)}</div>
                <div><strong>Invoice Number:</strong> {protection.invoiceNumber || 'INV-VERIFIED'}</div>
              </div>
            </div>
          </div>

          {/* Warranty & Source Card */}
          <div style={{ background: '#eff6ff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                Warranty Coverage Details
              </span>
              <span style={{ fontSize: '0.75rem', background: '#ffffff', color: '#1d4ed8', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                Source: {warrantySource}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#1e3a8a', marginTop: '0.4rem' }}>
              <div><strong>Type:</strong> {protection.warrantyType || 'Manufacturer Warranty'}</div>
              <div><strong>Duration:</strong> {protection.warrantyDurationMonths || 12} Months</div>
              <div><strong>Verified Expiry:</strong> {expiryDate}</div>
            </div>
          </div>

          {/* Documents Gallery */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
              Attached Documents:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Purchase_Invoice.pdf', 'Product_Label_SN.png', 'Warranty_Card.pdf'].map((docName, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontWeight: 600 }}>
                  <Paperclip size={14} color="#2563eb" />
                  <span>{docName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                if (onFileClaimForItem) onFileClaimForItem(protection);
              }}
            >
              <FileSpreadsheet size={16} />
              <span>File Warranty Claim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
