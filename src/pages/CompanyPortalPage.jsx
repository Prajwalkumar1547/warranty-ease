import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Wrench,
  Send,
  Sparkles,
  ShieldCheck,
  Package,
  HelpCircle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import BrandLogoIcon from '../components/BrandLogoIcon';

const COMPANY_OPTIONS = [
  { id: 'comp-boat', name: 'boAt', category: 'Audio & Wearables' },
  { id: 'comp-samsung', name: 'Samsung', category: 'Electronics & Appliances' },
  { id: 'comp-carehealth', name: 'Care Health', category: 'Health Insurance' },
  { id: 'comp-starhealth', name: 'Star Health', category: 'Health Insurance' },
  { id: 'comp-apple', name: 'Apple', category: 'Computers & Mobiles' },
  { id: 'comp-lg', name: 'LG', category: 'Home Appliances & TVs' },
  { id: 'comp-sony', name: 'Sony', category: 'Audio & Television' },
  { id: 'comp-icici', name: 'ICICI Lombard', category: 'Motor Insurance' },
  { id: 'comp-tataaig', name: 'Tata AIG', category: 'General Insurance' },
];

export default function CompanyPortalPage({ activeCompanyId = 'comp-boat', onOpenUnifiedAuth }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompanyId);
  const [claims, setClaims] = useState([]);
  const [protections, setProtections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected claim for review
  const [reviewClaim, setReviewClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [infoRequestMsg, setInfoRequestMsg] = useState('');
  const [showInfoInput, setShowInfoInput] = useState(false);
  const [assignHub, setAssignHub] = useState('');
  const [showAssignInput, setShowAssignInput] = useState(false);
  const [companyReplyMsg, setCompanyReplyMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedCompany = COMPANY_OPTIONS.find(c => c.id === selectedCompanyId) || COMPANY_OPTIONS[0];

  const loadCompanyData = async () => {
    setLoading(true);
    try {
      const [allClaims, allProts] = await Promise.all([
        api.getClaims(),
        api.getProtections(),
      ]);

      const brandName = selectedCompany.name.toLowerCase();
      const filteredClaims = allClaims.filter(c =>
        c.company_id === selectedCompany.id ||
        (c.brand && c.brand.toLowerCase() === brandName)
      );

      const filteredProts = allProts.filter(p =>
        p.company_id === selectedCompany.id ||
        (p.brand && p.brand.toLowerCase() === brandName)
      );

      setClaims(filteredClaims);
      setProtections(filteredProts);
    } catch (e) {
      console.error('Failed to load company portal data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCompanyId) {
      setSelectedCompanyId(activeCompanyId);
    }
  }, [activeCompanyId]);

  useEffect(() => {
    loadCompanyData();
  }, [selectedCompanyId]);

  const handleOpenClaim = async (claim) => {
    const fresh = await api.getClaimById(claim.id);
    setReviewClaim(fresh || claim);
    setShowRejectInput(false);
    setShowInfoInput(false);
    setShowAssignInput(false);
    setCompanyReplyMsg('');
  };

  const handleAction = async (actionType) => {
    if (!reviewClaim) return;
    setIsProcessing(true);
    try {
      let newStatus = reviewClaim.status;
      let notes = '';
      let hub = '';

      if (actionType === 'APPROVE') {
        newStatus = 'APPROVED';
        notes = 'Claim approved by brand representative. Replacement / repair authorization issued.';
      } else if (actionType === 'REJECT') {
        if (!rejectReason.trim()) {
          alert('Please enter a rejection reason.');
          setIsProcessing(false);
          return;
        }
        newStatus = 'REJECTED';
        notes = `Claim rejected by brand representative: ${rejectReason}`;
      } else if (actionType === 'REQUEST_INFO') {
        if (!infoRequestMsg.trim()) {
          alert('Please enter the information required from the customer.');
          setIsProcessing(false);
          return;
        }
        newStatus = 'MORE_INFORMATION_REQUIRED';
        notes = `Brand requested information: ${infoRequestMsg}`;
      } else if (actionType === 'ASSIGN_HUB') {
        if (!assignHub.trim()) {
          alert('Please enter service hub details.');
          setIsProcessing(false);
          return;
        }
        newStatus = 'ASSIGNED_TO_SERVICE_CENTRE';
        notes = `Assigned to service centre: ${assignHub}`;
        hub = assignHub;
      } else if (actionType === 'RESOLVE') {
        newStatus = 'RESOLVED';
        notes = 'Service completed and customer confirmed satisfaction.';
      }

      await api.updateClaimStatus(
        reviewClaim.id,
        newStatus,
        `${selectedCompany.name} Service Lead`,
        'company',
        notes,
        hub
      );

      if (companyReplyMsg.trim()) {
        await api.addClaimMessage(
          reviewClaim.id,
          `usr-${selectedCompany.name.toLowerCase().replace(/\s+/g, '')}-rep`,
          `${selectedCompany.name} Official Support`,
          'company',
          companyReplyMsg.trim()
        );
      }

      setReviewClaim(null);
      await loadCompanyData();
    } catch (e) {
      alert('Error updating claim: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Metrics
  const pendingCount = claims.filter(c => ['SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(c.status)).length;
  const approvedCount = claims.filter(c => c.status === 'APPROVED').length;
  const rejectedCount = claims.filter(c => c.status === 'REJECTED').length;
  const resolvedCount = claims.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Brand Header with Official Logo & Auth Status */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        borderRadius: '1.25rem', padding: '2rem 2.25rem', marginBottom: '2rem',
        color: '#ffffff', boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 62,
            height: 62,
            borderRadius: '0.85rem',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            flexShrink: 0
          }}>
            <BrandLogoIcon brand={selectedCompany.name} size={38} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', background: '#312e81', color: '#c7d2fe', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>
                🏢 Partner Company Portal
              </span>
              <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 700 }}>
                ● Password Verified Desk
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: '#fff' }}>
              {selectedCompany.name} Service & Warranty Desk
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem' }}>
              Authorized manufacturer queue for {selectedCompany.name} ({selectedCompany.category}). Review tickets, authorize replacements, and route to official service centres.
            </p>
          </div>
        </div>

        {/* Password-Protected Portal Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              if (onOpenUnifiedAuth) onOpenUnifiedAuth('company');
            }}
            className="btn btn-primary"
            style={{
              background: '#4f46e5',
              borderColor: '#6366f1',
              fontSize: '0.84rem',
              padding: '0.55rem 1.1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 800,
              borderRadius: '0.65rem',
              boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
            }}
          >
            <Lock size={15} />
            <span>Switch Company Portal</span>
          </button>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Requires target brand private password
          </span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Registered Products</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>{protections.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>In customer vaults</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Claims</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7c3aed', margin: '0.2rem 0' }}>{claims.length}</div>
          <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>Routed to brand</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Pending Review</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ea580c', margin: '0.2rem 0' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 700 }}>Requires brand decision</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Approved Claims</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a', margin: '0.2rem 0' }}>{approvedCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>Replacement / Repair</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Rejected</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#dc2626', margin: '0.2rem 0' }}>{rejectedCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 700 }}>Non-warranty terms</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Resolved & Closed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284c7', margin: '0.2rem 0' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700 }}>Customer confirmed</div>
        </div>
      </div>

      {/* Claims List Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {selectedCompany.name} Warranty & Service Claims Queue ({claims.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.15rem 0 0' }}>
              Claims filed by customers for {selectedCompany.name} products awaiting company action
            </p>
          </div>
        </div>

        {claims.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#94a3b8' }}>
            <Package size={40} style={{ margin: '0 auto 0.75rem' }} color="#cbd5e1" />
            <h4 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontWeight: 800 }}>No Claims in {selectedCompany.name} Queue</h4>
            <p style={{ fontSize: '0.82rem', margin: 0 }}>Any new claims filed for {selectedCompany.name} products will appear here instantly.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '0.75rem' }}>Claim ID</th>
                  <th style={{ padding: '0.75rem' }}>Product & Model</th>
                  <th style={{ padding: '0.75rem' }}>Issue Description</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>
                      {claim.id}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{claim.productName || claim.model}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{claim.category || 'Audio'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', maxWidth: '320px', color: '#334155' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{claim.issueCategory}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {claim.problemDescription}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px',
                        background: claim.status === 'APPROVED' ? '#f0fdf4' : claim.status === 'REJECTED' ? '#fef2f2' : '#fef3c7',
                        color: claim.status === 'APPROVED' ? '#16a34a' : claim.status === 'REJECTED' ? '#dc2626' : '#b45309'
                      }}>
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenClaim(claim)}
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Review Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── COMPANY CLAIM ACTION MODAL ─── */}
      {reviewClaim && (
        <div className="modal-overlay" onClick={() => setReviewClaim(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                  <BrandLogoIcon brand={reviewClaim.brand} size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{reviewClaim.id}</div>
                  <h2 className="modal-title">{reviewClaim.brand} {reviewClaim.productName || reviewClaim.model}</h2>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setReviewClaim(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product & Issue Details */}
              <div style={{ background: '#f8fafc', borderRadius: '0.85rem', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.88rem', color: '#0f172a' }}>Customer Problem Statement</h4>
                <p style={{ margin: 0, fontSize: '0.83rem', color: '#334155', lineHeight: 1.5 }}>
                  {reviewClaim.problemDescription}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Issue: <strong style={{ color: '#0f172a' }}>{reviewClaim.issueCategory}</strong></span>
                  <span>Requested: <strong style={{ color: '#0f172a' }}>{reviewClaim.preferredResolution}</strong></span>
                  <span>Current Status: <strong style={{ color: '#2563eb' }}>{reviewClaim.status}</strong></span>
                </div>
              </div>

              {/* Service Centre Info if already assigned */}
              {reviewClaim.service_centre_info && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#15803d' }}>
                  <strong>Assigned Service Hub:</strong> {reviewClaim.service_centre_info}
                </div>
              )}

              {/* Action Buttons Row */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Representative Decision Actions:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleAction('APPROVE')}
                    disabled={isProcessing}
                    style={{
                      background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.6rem',
                      padding: '0.5rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    ✓ Approve Claim
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowRejectInput(v => !v); setShowInfoInput(false); setShowAssignInput(false); }}
                    style={{
                      background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.6rem',
                      padding: '0.5rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    ✕ Reject Claim
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowInfoInput(v => !v); setShowRejectInput(false); setShowAssignInput(false); }}
                    style={{
                      background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '0.6rem',
                      padding: '0.5rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Request More Info
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowAssignInput(v => !v); setShowRejectInput(false); setShowInfoInput(false); }}
                    style={{
                      background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '0.6rem',
                      padding: '0.5rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Assign Service Hub
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAction('RESOLVE')}
                    disabled={isProcessing}
                    style={{
                      background: '#0284c7', color: '#fff', border: 'none', borderRadius: '0.6rem',
                      padding: '0.5rem 0.95rem', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Expandable Rejection Reason Input */}
              {showRejectInput && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.35rem' }}>
                    Reason for rejection (e.g. Physical liquid damage excluded, expired warranty):
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                  />
                  <button
                    className="btn"
                    onClick={() => handleAction('REJECT')}
                    style={{ background: '#dc2626', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                  >
                    Confirm Rejection
                  </button>
                </div>
              )}

              {/* Expandable Info Request Input */}
              {showInfoInput && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#b45309', marginBottom: '0.35rem' }}>
                    What information is needed from the customer?
                  </label>
                  <input
                    type="text"
                    value={infoRequestMsg}
                    onChange={(e) => setInfoRequestMsg(e.target.value)}
                    placeholder="e.g. Please upload clear photo of back serial number sticker..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #f59e0b', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                  />
                  <button
                    className="btn"
                    onClick={() => handleAction('REQUEST_INFO')}
                    style={{ background: '#d97706', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                  >
                    Send Request to Customer
                  </button>
                </div>
              )}

              {/* Expandable Service Hub Input */}
              {showAssignInput && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.35rem' }}>
                    Authorized Service Centre details & instructions:
                  </label>
                  <input
                    type="text"
                    value={assignHub}
                    onChange={(e) => setAssignHub(e.target.value)}
                    placeholder="e.g. boAt Care Hub - Indiranagar, 100ft Road. Phone: 080-41234567"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #3b82f6', fontSize: '0.8rem', marginBottom: '0.5rem' }}
                  />
                  <button
                    className="btn"
                    onClick={() => handleAction('ASSIGN_HUB')}
                    style={{ background: '#2563eb', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.85rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                  >
                    Confirm Service Hub Assignment
                  </button>
                </div>
              )}

              {/* Direct Company Message to Customer */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Message Customer:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Write a message directly to customer's claim thread..."
                    value={companyReplyMsg}
                    onChange={(e) => setCompanyReplyMsg(e.target.value)}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleAction('MESSAGE_ONLY')}
                    disabled={!companyReplyMsg.trim()}
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setReviewClaim(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
