import React, { useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  HeartPulse,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Sparkles,
  FileScan,
  PackageCheck,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Tag,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import BrandLogoIcon from '../components/BrandLogoIcon';
import { formatINR } from '../utils/warrantyCalculator';
import { runAutonomousCheckAndAlert } from '../utils/reminderAgents';

export default function DashboardPage({
  protections = [],
  claims = [],
  onNavigateToProtections,
  onNavigateToInsurance,
  onNavigateToClaims,
  onOpenAddWarrantyModal,
  onOpenAddInsuranceModal,
  onOpenOcrModal,
  onOpenFileClaimModal,
  onOpenFileClaimForItem,
  onSelectProtectionForDetail,
  onSelectClaimTrack,
  user
}) {
  // Metric calculations
  const totalProtections = protections.length;
  const activeWarranties = protections.filter(p => (p.protectionType === 'Warranty' || p.protection_type === 'Warranty' || !p.protectionType) && p.status === 'Active').length;
  const expiringSoon = protections.filter(p => p.status === 'Expiring Soon').length;
  const expired = protections.filter(p => p.status === 'Expired').length;
  const openClaims = claims.filter(c => !['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(c.status)).length;
  const completedClaims = claims.filter(c => ['RESOLVED', 'CLOSED', 'Resolved', 'Closed'].includes(c.status)).length;

  const userName = user?.name ? user.name.split(' ')[0] : 'Rahul';

  // Watchdog alert triggers
  useEffect(() => {
    runAutonomousCheckAndAlert(protections, claims);
  }, [protections, claims]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ─── Top Welcome & Main Actions ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '1.25rem',
        padding: '2rem 2.25rem',
        marginBottom: '2rem',
        color: '#ffffff',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '240px', height: '240px',
          background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#93c5fd', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            <span>Welcome Back, {userName}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Your Protection Command Center
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', margin: '0 0 1.75rem 0', maxWidth: '620px', lineHeight: 1.5 }}>
            One single place to store, manage, protect, and claim all your warranties, insurance policies, and receipts.
          </p>

          {/* 4 Main Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={onOpenAddWarrantyModal}
              style={{ padding: '0.65rem 1.15rem', fontSize: '0.88rem', fontWeight: 800, gap: '0.45rem', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
            >
              <Plus size={16} />
              <span>+ Add Warranty</span>
            </button>

            <button
              className="btn"
              onClick={onOpenAddInsuranceModal}
              style={{
                background: '#15803d', color: '#ffffff', border: 'none',
                padding: '0.65rem 1.15rem', fontSize: '0.88rem', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                borderRadius: '0.65rem', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(21,128,61,0.35)'
              }}
            >
              <HeartPulse size={16} />
              <span>+ Add Insurance</span>
            </button>

            <button
              className="btn"
              onClick={onOpenOcrModal}
              style={{
                background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)',
                padding: '0.65rem 1.15rem', fontSize: '0.88rem', fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                borderRadius: '0.65rem', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s'
              }}
            >
              <FileScan size={16} color="#60a5fa" />
              <span>Scan Document</span>
            </button>

            <button
              className="btn"
              onClick={onOpenFileClaimModal}
              style={{
                background: '#ea580c', color: '#ffffff', border: 'none',
                padding: '0.65rem 1.15rem', fontSize: '0.88rem', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                borderRadius: '0.65rem', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(234,88,12,0.35)'
              }}
            >
              <AlertTriangle size={16} />
              <span>Start a Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Protection Overview (6 KPIs) ─── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Protection Overview
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Live Platform Sync</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem'
        }}>
          {/* Total Protections */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Total Protections</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{totalProtections}</div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '0.2rem' }}>All active policies & items</div>
          </div>

          {/* Active Warranties */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Active Warranties</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#16a34a' }}>{activeWarranties}</div>
            <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, marginTop: '0.2rem' }}>Full manufacturer cover</div>
          </div>

          {/* Expiring Soon */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Expiring Soon</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ea580c' }}>{expiringSoon}</div>
            <div style={{ fontSize: '0.72rem', color: '#c2410c', fontWeight: 600, marginTop: '0.2rem' }}>Next 30 days window</div>
          </div>

          {/* Expired */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Expired</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#64748b' }}>{expired}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.2rem' }}>Eligible for extension</div>
          </div>

          {/* Open Claims */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Open Claims</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7c3aed' }}>{openClaims}</div>
            <div style={{ fontSize: '0.72rem', color: '#6d28d9', fontWeight: 600, marginTop: '0.2rem' }}>Active brand queue</div>
          </div>

          {/* Completed Claims */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Completed Claims</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0284c7' }}>{completedClaims}</div>
            <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '0.2rem' }}>Resolved & closed</div>
          </div>
        </div>
      </div>

      {/* ─── My Protection Cards Section ─── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
              My Protections
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Registered warranties and insurance policies in your personal vault
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onNavigateToProtections} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              View Warranties ({protections.filter(p => p.protectionType !== 'Insurance').length})
            </button>
            <button className="btn btn-secondary" onClick={onNavigateToInsurance} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
              View Insurance ({protections.filter(p => p.protectionType === 'Insurance').length})
            </button>
          </div>
        </div>

        {protections.length === 0 ? (
          <div className="empty-state-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
            <div className="empty-icon-box" style={{ width: 72, height: 72, margin: '0 auto 1.25rem' }}>
              <PackageCheck size={36} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>No Protections in Vault</h3>
            <p style={{ color: '#64748b', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: 1.5, fontSize: '0.9rem' }}>
              Start by uploading an invoice or warranty card. WarrantyEase AI will understand the document and schedule automatic expiry alerts.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onOpenAddWarrantyModal}>
                <Plus size={15} /><span>Add Warranty</span>
              </button>
              <button className="btn btn-secondary" onClick={onOpenOcrModal}>
                <FileScan size={15} color="#2563eb" /><span>Scan Receipt</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {protections.slice(0, 6).map((p) => {
              const isInsurance = p.protectionType === 'Insurance' || p.protection_type === 'Insurance';
              const isExpiringSoon = p.status === 'Expiring Soon';
              const isExpired = p.status === 'Expired';

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '1.15rem',
                    border: '1px solid #e2e8f0',
                    padding: '1.35rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)'; }}
                  onClick={() => onSelectProtectionForDetail(p)}
                >
                  <div>
                    {/* Top Row: Brand Logo + Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', flexShrink: 0 }}>
                          <BrandLogoIcon brand={p.brand} domain={p.logoDomain} size={28} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                            {p.brand}
                          </span>
                          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0 0', lineHeight: 1.3 }}>
                            {p.productName || p.product_name || p.model || 'Protection Asset'}
                          </h3>
                        </div>
                      </div>

                      {/* Status pill */}
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800,
                        padding: '0.2rem 0.55rem', borderRadius: '20px',
                        background: isExpired ? '#fef2f2' : isExpiringSoon ? '#fff7ed' : '#f0fdf4',
                        color: isExpired ? '#dc2626' : isExpiringSoon ? '#c2410c' : '#15803d',
                        border: `1px solid ${isExpired ? '#fecaca' : isExpiringSoon ? '#ffedd5' : '#bbf7d0'}`
                      }}>
                        {p.status || 'Active'}
                      </span>
                    </div>

                    {/* Metadata Specs */}
                    <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.75rem 0.85rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Type</span>
                        <strong style={{ color: '#0f172a' }}>{isInsurance ? 'Insurance Policy' : (p.type || 'Product Warranty')}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Category</span>
                        <strong style={{ color: '#0f172a' }}>{p.category || 'Personal'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Start Date</span>
                        <span style={{ color: '#334155' }}>{p.purchaseDate || p.purchase_date || p.startDate || '—'}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b', display: 'block', fontSize: '0.68rem', fontWeight: 600 }}>Expires</span>
                        <span style={{ color: isExpiringSoon ? '#ea580c' : '#0f172a', fontWeight: isExpiringSoon ? 800 : 600 }}>
                          {p.expiryDate || p.expiry_date || 'Ongoing'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={(e) => { e.stopPropagation(); onSelectProtectionForDetail(p); }}
                      style={{ fontSize: '0.78rem', padding: '0.38rem 0.75rem' }}
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => { e.stopPropagation(); onOpenFileClaimForItem(p); }}
                      style={{ fontSize: '0.78rem', padding: '0.38rem 0.85rem', gap: '0.35rem' }}
                    >
                      <AlertTriangle size={13} />
                      <span>{isInsurance ? 'Claim Policy' : 'Claim Warranty'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Recent Claims Section ─── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
              Recent Claims & Repair Tickets
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Track ticket resolution, company service review, and doorstep repair milestones
            </p>
          </div>
          <button className="btn btn-secondary" onClick={onNavigateToClaims} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
            View All Claims ({claims.length})
          </button>
        </div>

        {claims.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center' }}>
            <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontWeight: 800 }}>No Active Claims</h4>
            <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b' }}>
              When you experience any hardware breakdown or damage, click Start a Claim to route it to brand support.
            </p>
            <button className="btn btn-primary" onClick={onOpenFileClaimModal} style={{ fontSize: '0.8rem' }}>
              Start a Claim
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {claims.slice(0, 3).map((claim) => (
              <div
                key={claim.id}
                onClick={() => onSelectClaimTrack(claim)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '1rem',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3, background: '#f8fafc' }}>
                    <BrandLogoIcon brand={claim.brand} domain={claim.logoDomain} size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#2563eb' }}>{claim.id}</span>
                      <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        {claim.claimType || 'Warranty Claim'}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                      {claim.brand} {claim.productName || claim.model}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {claim.problemDescription ? claim.problemDescription.slice(0, 75) + '...' : claim.issueCategory}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800,
                    padding: '0.25rem 0.65rem', borderRadius: '20px',
                    background: ['APPROVED', 'Approved'].includes(claim.status) ? '#f0fdf4' : ['REJECTED', 'Rejected'].includes(claim.status) ? '#fef2f2' : '#eff6ff',
                    color: ['APPROVED', 'Approved'].includes(claim.status) ? '#16a34a' : ['REJECTED', 'Rejected'].includes(claim.status) ? '#dc2626' : '#2563eb',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    {claim.status}
                  </span>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
