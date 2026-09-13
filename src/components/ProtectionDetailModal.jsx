import React, { useState } from 'react';
import {
  X,
  Calendar,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Paperclip,
  CheckCircle2,
  Clock,
  Award,
  Tag,
  DollarSign,
  Store,
  HeartPulse,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';
import { formatINR } from '../utils/warrantyCalculator';

export default function ProtectionDetailModal({ protection, onClose, onFileClaimForItem }) {
  const [copied, setCopied] = useState(false);

  if (!protection) return null;

  const isInsurance =
    protection.protectionType === 'Insurance' ||
    protection.protection_type === 'Insurance' ||
    protection.type === 'INSURANCE' ||
    (protection.category || '').toLowerCase().includes('insurance');

  const brand = protection.brand || 'Apple';
  const productName = protection.productName || protection.model || (isInsurance ? 'Insurance Policy' : 'Smart Product');
  const modelNumber = protection.modelNumber || protection.model || 'A3101';
  const serialNumber = protection.serialNumber || protection.serial_number || 'SN-VERIFIED-9910';
  const policyNumber = protection.policyNumber || protection.policy_number || serialNumber;
  const policyHolder = protection.policyHolder || protection.policy_holder || protection.customerName || 'Registered User';
  const sumInsured = protection.sumInsured || protection.sum_insured || protection.price || 0;
  const price = protection.price || 0;
  const currency = protection.currency || '₹';
  const purchaseDate = protection.purchaseDate || protection.startDate || protection.start_date || '2026-09-11';
  const expiryDate = protection.expiryDate || protection.expiry_date || '2027-09-11';
  const status = protection.status || 'Active';
  const daysLeft = protection.daysLeft || 365;
  const warrantySource = protection.warrantySource || (isInsurance ? 'Policy Schedule PDF' : 'Invoice + Warranty Card');

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <h2 className="modal-title" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>
                {brand} {productName}
              </h2>
              <span className="status-badge active" style={{ fontSize: '0.72rem' }}>
                {status} {isInsurance ? 'Policy' : 'Protection'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Visual Validity Timeline Bar */}
          <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="#0066cc" /> {isInsurance ? 'Policy Validity Timeline' : 'Warranty Expiry Timeline'}
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
                  <span style={{ display: 'block', color: '#0f172a', fontWeight: 800 }}>{isInsurance ? 'Policy Start' : 'Purchase Date'}</span>
                  <span>{purchaseDate}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', color: '#0066cc', fontWeight: 800 }}>Today</span>
                  <span>Active</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ display: 'block', color: '#15803d', fontWeight: 800 }}>{isInsurance ? 'Policy Expiry' : 'Expiry Date'}</span>
                  <span>{expiryDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          {isInsurance ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Policy Information */}
              <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0066cc', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
                  Policy Details
                </span>
                <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div><strong>Insurer:</strong> {brand}</div>
                  <div><strong>Plan / Product:</strong> {productName}</div>
                  <div><strong>Category:</strong> {protection.category || 'Health Insurance'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <strong>Policy #:</strong>
                    <span style={{ fontFamily: 'monospace', color: '#0066cc', fontWeight: 700 }}>{policyNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(policyNumber)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: copied ? '#16a34a' : '#94a3b8' }}
                      title="Copy Policy Number"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div><strong>Policyholder:</strong> {policyHolder}</div>
                </div>
              </div>

              {/* Coverage & Value */}
              <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
                  Coverage & Financials
                </span>
                <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div><strong>Sum Insured:</strong> <span style={{ color: '#059669', fontWeight: 800, fontSize: '1rem' }}>{formatINR(sumInsured)}</span></div>
                  <div><strong>Premium Paid:</strong> {price ? formatINR(price, currency) : 'Standard'}</div>
                  <div><strong>TPA / Cashless:</strong> Enabled across network</div>
                  <div><strong>Schedule Document:</strong> {warrantySource}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Product Information */}
              <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0066cc', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
                  Product Information
                </span>
                <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Brand:</strong> {brand}</div>
                  <div><strong>Product Name:</strong> {productName}</div>
                  <div><strong>Model Number:</strong> {modelNumber}</div>
                  <div><strong>Serial / IMEI / VIN:</strong> <span style={{ fontFamily: 'monospace', color: '#0066cc', fontWeight: 700 }}>{serialNumber}</span></div>
                </div>
              </div>

              {/* Purchase Information */}
              <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0066cc', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.6rem' }}>
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
          )}

          {/* Coverage Note */}
          <div style={{ background: isInsurance ? '#ecfdf5' : '#f0f9ff', borderRadius: '0.85rem', padding: '1rem', border: isInsurance ? '1px solid #a7f3d0' : '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isInsurance ? '#065f46' : '#0369a1', textTransform: 'uppercase' }}>
                {isInsurance ? 'Policy Scope & Benefits' : 'Warranty Coverage Details'}
              </span>
              <span style={{ fontSize: '0.75rem', background: '#ffffff', color: isInsurance ? '#059669' : '#0284c7', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                {warrantySource}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: isInsurance ? '#047857' : '#075985', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
              {protection.coverageInfo || (isInsurance
                ? 'Cashless hospitalization and emergency claims supported across authorized network hospitals and garages.'
                : '100% manufacturer warranty protection covering internal hardware failure, manufacturing defects, and authorized service repairs.')}
            </p>
          </div>

          {/* Documents Gallery */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
              Attached Documents:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[isInsurance ? 'Policy_Schedule.pdf' : 'Purchase_Invoice.pdf', isInsurance ? 'Health_Card.pdf' : 'Product_Label_SN.png'].map((docName, i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155', fontWeight: 600 }}>
                  <Paperclip size={14} color="#0066cc" />
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
              <span>{isInsurance ? 'File Insurance Claim' : 'File Warranty Claim'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
