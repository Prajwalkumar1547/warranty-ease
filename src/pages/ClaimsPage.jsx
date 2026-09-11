import React, { useState } from 'react';
import { FileText, Plus, Truck, ArrowRight, Shield, CheckCircle2, Clock, Eye, EyeOff, Wrench, Trash2, HeartPulse } from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';

const TIMELINE_STAGES = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'approved', label: 'Approved' },
  { id: 'pickup', label: 'Pickup' },
  { id: 'repair', label: 'Repair' },
  { id: 'return', label: 'Return' },
];

export default function ClaimsPage({ claims, onOpenFileClaimModal, onSelectClaimTrack, onDeleteClaim }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showOtpIds, setShowOtpIds] = useState({});

  const toggleOtp = (claimId, e) => {
    e.stopPropagation();
    setShowOtpIds(prev => ({ ...prev, [claimId]: !prev[claimId] }));
  };

  const filteredClaims = claims.filter(claim => {
    if (activeCategory === 'All') return true;
    return (claim.category || '').toLowerCase().includes(activeCategory.toLowerCase());
  });

  const getStageIndex = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('submit')) return 0;
    if (s.includes('approve') || s.includes('received')) return 1;
    if (s.includes('pickup') || s.includes('review')) return 2;
    if (s.includes('repair') || s.includes('service')) return 3;
    if (s.includes('return') || s.includes('delivery') || s.includes('complete') || s.includes('closed')) return 4;
    return 1;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Warranty & Insurance Claims ({claims.length})</h1>
          <p className="page-description">Real-time status tracking for repairs, replacements, and doorstep return delivery</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenFileClaimModal}>
          <Plus size={16} />
          <span>File New Claim</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="category-pills" style={{ marginBottom: '1.5rem' }}>
        {['All', 'Electronics', 'Vehicle', 'Health', 'Home Appliances', 'Computers'].map((cat) => (
          <button
            key={cat}
            className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Claims Content Area */}
      {filteredClaims.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '4rem 2rem' }}>
          <div className="empty-icon-box" style={{ width: 80, height: 80 }}>
            <FileText size={36} color="#94a3b8" />
          </div>
          <h3 className="empty-title">No Active Claims</h3>
          <p className="empty-subtitle">You have no active claims registered under this category.</p>
          <button className="btn btn-primary" onClick={onOpenFileClaimModal}>
            <Plus size={16} />
            <span>File Your First Claim</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredClaims.map((claim) => {
            const currentStageIdx = getStageIndex(claim.status || claim.claimStatus);
            const isOtpVisible = !!showOtpIds[claim.id];
            const otpCode = claim.otp || '1544';

            return (
              <div
                key={claim.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '1.15rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onClick={() => onSelectClaimTrack(claim)}
              >
                {/* Header with Brand Logo */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, background: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 2 }}>
                      <BrandLogoIcon brand={claim.brand} domain={claim.logoDomain} size={28} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>{claim.id}</span>
                        <span style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>{claim.category || 'Claim'}</span>
                        {(claim.protectionType === 'Insurance' || claim.claimType === 'Insurance Claim') && (
                          <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            <HeartPulse size={10} /> Insurance
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0 0 0', lineHeight: 1.2 }}>
                        {claim.brand} {claim.model || claim.productName}
                      </h3>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span className="status-badge active" style={{ fontSize: '0.72rem', flexShrink: 0 }}>{claim.status || 'Active'}</span>
                    {onDeleteClaim && (
                      <button
                        type="button"
                        title="Delete Claim"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClaim(claim.id);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fecaca',
                          borderRadius: '0.5rem',
                          padding: '0.3rem 0.45rem',
                          cursor: 'pointer',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#fecaca'; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '0.65rem 0.85rem', marginBottom: '0.85rem', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <p style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 700, margin: 0 }}>
                      Type: {claim.issueCategory || 'Service Request'}
                    </p>
                    {claim.claimedAmount ? (
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        ₹{Number(claim.claimedAmount).toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </div>
                  {claim.hospitalOrWorkshop && (
                    <p style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, margin: '0 0 0.2rem 0' }}>
                      📍 {claim.hospitalOrWorkshop} {claim.billReferenceNo ? `(Ref: #${claim.billReferenceNo})` : ''}
                    </p>
                  )}
                  {claim.preferredResolution && (
                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 0.2rem 0' }}>
                      Mode: <strong style={{ color: '#475569' }}>{claim.preferredResolution}</strong>
                    </p>
                  )}
                  {claim.description && (
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{claim.description}"
                    </p>
                  )}
                </div>

                {/* 5-Stage Timeline Bar */}
                <div style={{ marginBottom: '1rem', background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    {TIMELINE_STAGES.map((stg, idx) => {
                      const isPassed = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      return (
                        <div key={stg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: isPassed ? '#16a34a' : isCurrent ? '#0066cc' : '#f1f5f9',
                            color: isPassed || isCurrent ? '#ffffff' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            marginBottom: '0.2rem',
                            boxShadow: isCurrent ? '0 0 0 3px rgba(0,102,204,0.15)' : 'none'
                          }}>
                            {isPassed ? '✓' : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#0066cc' : isPassed ? '#16a34a' : '#94a3b8' }}>
                            {stg.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Return Delivery & OTP Security Toggle Box */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>
                    <Truck size={16} />
                    <span>Out for Return Delivery</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {isOtpVisible ? `OTP: ${otpCode}` : 'OTP: ***'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleOtp(claim.id, e)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#1d4ed8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      {isOtpVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                      {isOtpVisible ? 'Hide' : 'Show OTP'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

