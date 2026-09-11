import React, { useState } from 'react';
import { X, Phone, CheckCircle2, Circle, Clock, Truck, ShieldCheck, HelpCircle, Share2, ThumbsUp, AlertCircle, Package, Trash2, HeartPulse, IndianRupee } from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export default function ClaimTrackerModal({ claim, onClose, onDeleteClaim }) {
  const [rated, setRated] = useState(false);

  if (!claim) return null;

  const isInsuranceClaim =
    claim.protectionType === 'Insurance' ||
    claim.claimType === 'Insurance Claim' ||
    !!claim.claimedAmount ||
    ['health', 'vehicle', 'jewellery', 'property', 'life'].some((c) =>
      (claim.category || '').toLowerCase().includes(c)
    );

  // 3 Separated Status Fields
  const claimStatus = claim.claimStatus || claim.status || 'Submitted';
  const repairStatus = claim.repairStatus || (isInsuranceClaim ? 'TPA Assessment' : 'Not Started');
  const deliveryStatus = claim.deliveryStatus || 'Not Applicable';

  const isDeliveryActive = !isInsuranceClaim && (deliveryStatus === 'Out for Delivery' || deliveryStatus === 'Ready for Return');

  // Timeline Definition - Context aware for Insurance vs Warranty
  const timelineStages = isInsuranceClaim
    ? [
        { key: 'Submitted', label: 'Claim Submitted', time: claim.createdAt || '11 Sep' },
        { key: 'TPA Received', label: 'TPA / Insurer Received', time: '11 Sep' },
        { key: 'Document Review', label: 'Document & Bill Audit', time: 'Active' },
        { key: 'Approved', label: 'Claim Approved', time: 'Pending' },
        { key: 'Settlement', label: 'Payment / Settlement Order', time: 'Pending' },
        { key: 'Disbursed', label: 'Cash Reimbursed / Settled', time: 'Pending' }
      ]
    : [
        { key: 'Submitted', label: 'Claim Submitted', time: claim.createdAt || '11 Sep' },
        { key: 'Company Received', label: 'Company Received', time: '11 Sep' },
        { key: 'Under Review', label: 'Under Review', time: 'Active' },
        { key: 'Approved', label: 'Claim Approved', time: 'Pending' },
        { key: 'Repairing', label: 'Repair / Replacement', time: 'Pending' },
        { key: 'Return Delivery', label: 'Return Delivery', time: 'Pending' },
        { key: 'Completed', label: 'Completed', time: 'Pending' }
      ];

  const getStageIndex = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('submit')) return 0;
    if (s.includes('received')) return 1;
    if (s.includes('review') || s.includes('audit')) return 2;
    if (s.includes('approve')) return 3;
    if (s.includes('repair') || s.includes('settle')) return 4;
    if (s.includes('delivery') || s.includes('return') || s.includes('disburs')) return 5;
    if (s.includes('closed') || s.includes('complete') || s.includes('paid')) return isInsuranceClaim ? 5 : 6;
    return 0;
  };

  const currentStageIdx = getStageIndex(claimStatus);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px', background: '#f8fafc' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ padding: '0.4rem' }}>
              <X size={18} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {isInsuranceClaim ? 'Insurance Claim Tracker' : 'Warranty Service Tracker'}
                </h2>
                {isInsuranceClaim && (
                  <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 800 }}>
                    Insurance
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reference #{claim.id}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onDeleteClaim && (
              <button
                type="button"
                onClick={() => onDeleteClaim(claim.id)}
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.75rem',
                  borderColor: '#fecaca',
                  color: '#ef4444',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
                title="Delete or withdraw this claim"
              >
                <Trash2 size={14} />
                <span>Delete Claim</span>
              </button>
            )}
            <button className="btn btn-secondary btn-icon" style={{ padding: '0.4rem' }} title="Share Tracking Link">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#f8fafc', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Claim & Product Summary Box */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BrandLogoIcon brand={claim.brand} domain={claim.logoDomain} size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {claim.brand} {claim.model || claim.productName}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {claim.serialNumber
                      ? `Serial: ${claim.serialNumber}`
                      : <em style={{ color: '#94a3b8' }}>Serial number not provided</em>}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
                <span className="status-badge active" style={{ fontSize: '0.75rem' }}>
                  {claimStatus}
                </span>
                {claim.claimedAmount ? (
                  <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#15803d', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    Claimed: ₹{Number(claim.claimedAmount).toLocaleString('en-IN')}
                  </span>
                ) : null}
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '0.75rem 0.85rem', fontSize: '0.8rem', color: '#334155', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div><strong>Claim Type / Issue:</strong> {claim.issueCategory || claim.userIssueDescription || 'Service Request'}</div>
              {claim.preferredResolution && (
                <div><strong>Resolution Mode:</strong> <span style={{ color: '#2563eb', fontWeight: 600 }}>{claim.preferredResolution}</span></div>
              )}
              {claim.hospitalOrWorkshop && (
                <div><strong>Facility / Provider:</strong> <span style={{ color: '#0f172a', fontWeight: 600 }}>{claim.hospitalOrWorkshop} {claim.billReferenceNo ? `(Ref: #${claim.billReferenceNo})` : ''}</span></div>
              )}
              {claim.userIssueDescription && <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>"{claim.userIssueDescription}"</div>}
              {claim.description && !claim.userIssueDescription && <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>"{claim.description}"</div>}
            </div>
          </div>

          {/* 7-Stage Visual Progress Timeline Card */}
          <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={18} color="#2563eb" /> Claim Processing Lifecycle
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Current Status: <strong style={{ color: '#2563eb' }}>{claimStatus}</strong> • Repair Status: <strong>{repairStatus}</strong>
            </p>

            {/* Stage Step Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
              {timelineStages.map((stage, idx) => {
                const isPassed = idx < currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Node Dot */}
                    <div style={{ position: 'absolute', left: '-1.45rem', background: '#ffffff', borderRadius: '50%' }}>
                      {isPassed ? (
                        <CheckCircle2 size={18} color="#16a34a" fill="#dcfce7" />
                      ) : isCurrent ? (
                        <Circle size={18} color="#2563eb" fill="#eff6ff" strokeWidth={3} />
                      ) : (
                        <Circle size={18} color="#cbd5e1" fill="#ffffff" />
                      )}
                    </div>

                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 800 : isPassed ? 700 : 500, color: isCurrent ? '#1d4ed8' : isPassed ? '#15803d' : '#64748b' }}>
                        {stage.label}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: isCurrent ? '#2563eb' : '#94a3b8', fontWeight: isCurrent ? 700 : 400 }}>
                      {isCurrent ? '● Active Step' : isPassed ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STRICT RENDER GUARD: Delivery Details Card ONLY rendered if deliveryStatus IS Out for Delivery / Ready for Return */}
          {isDeliveryActive ? (
            <div style={{ background: '#ffffff', borderRadius: '1.25rem', border: '1px solid #bfdbfe', padding: '1.25rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.06)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={20} color="#2563eb" /> Out for Return Delivery
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '1rem' }}>
                Your repaired product / replacement unit is out for delivery with logistics partner.
              </p>

              <div style={{ background: '#eff6ff', borderRadius: '0.85rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block' }}>
                    Delivery agent: Ramesh K.
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                    SECURITY PIN: 158
                  </span>
                </div>
                <a href="tel:+919876543210" className="btn btn-secondary btn-icon" style={{ borderRadius: '50%', width: 36, height: 36, background: '#ffffff', borderColor: '#bfdbfe', color: '#2563eb' }}>
                  <Phone size={16} />
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>Delivery Verification OTP:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 900, padding: '0.2rem 0.6rem', borderRadius: '0.4rem' }}>
                    {rated ? 'OTP: 1544' : 'OTP: ***'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRated(!rated)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                  >
                    {rated ? 'Hide OTP' : 'Show OTP'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '0.85rem', padding: '0.85rem 1rem', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
              {isInsuranceClaim ? (
                <span>
                  ℹ️ Insurance settlement is currently in <strong>{claimStatus}</strong> stage. Bank transfer credit / cashless approval details will be updated once auditor clears documentation.
                </span>
              ) : (
                <span>
                  ℹ️ Delivery status is <strong>Not Applicable</strong> while claim is in {claimStatus} stage. Shipping tracking details will be generated once repair is completed.
                </span>
              )}
            </div>
          )}

          {/* Rate Experience Section */}
          <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setRated(!rated)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <ThumbsUp size={18} color={rated ? '#16a34a' : '#64748b'} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                {rated ? 'Thank you for rating your claim experience!' : 'Did you find this claim tracking helpful?'}
              </span>
            </div>
            <span style={{ fontSize: '1rem', color: '#94a3b8' }}>›</span>
          </div>
        </div>
      </div>
    </div>
  );
}
