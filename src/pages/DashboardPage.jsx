import React, { useEffect } from 'react';
import {
  ShieldCheck,
  IndianRupee,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Sparkles,
  FileScan
} from 'lucide-react';
import StatCard from '../components/StatCard';
import WarrantyCard from '../components/WarrantyCard';
import { formatINR } from '../utils/warrantyCalculator';
import { runAutonomousCheckAndAlert } from '../utils/reminderAgents';

export default function DashboardPage({
  protections = [],
  claims = [],
  onNavigateToProtections,
  onOpenFileClaimModal,
  onOpenFileClaimForItem,
  onSelectClaimTrack,
  onOpenAddModal,
  onAddProtection,
  onOpenOcrModal,
  onOpenAiClaimModal,
  onSelectProtectionForDetail,
  onOpenAgentCenter
}) {
  const activeWarrantiesCount = protections.filter(p => p.status === 'Active').length;
  const activeProtections = protections.filter(p => p.status === 'Active');
  const protectedValueINR = activeProtections.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const expiringSoonCount = protections.filter(p => p.status === 'Expiring Soon').length;
  const activeClaimsCount = claims.filter(c => c.status !== 'Closed' && c.status !== 'Delivered').length;

  // Background Watchdog: evaluates expiring warranties to send to user's WhatsApp & Email in background
  useEffect(() => {
    runAutonomousCheckAndAlert(protections, claims);
  }, [protections, claims]);

  return (
    <div>

      {/* Top Welcome & Actions Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Warranty & Asset Command</h1>
          <p className="page-description">
            Track expiry dates, manufacturer service SLA, insurance claims, and active protections.
          </p>
        </div>

        {/* Primary Header Quick Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onOpenOcrModal}>
            <FileScan size={15} color="#0066cc" />
            <span>Scan Receipt</span>
          </button>

          <button className="btn btn-secondary" onClick={onOpenAiClaimModal}>
            <Sparkles size={15} color="#c93400" />
            <span>AI Claim Assistant</span>
          </button>

          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={15} />
            <span>+ Add Protection</span>
          </button>
        </div>
      </div>

      {/* Top 4 Compact Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          label="Active Protections"
          value={activeWarrantiesCount}
          icon={ShieldCheck}
          iconBg="#e5f9e7"
          iconColor="#248a3d"
          trend={{ label: 'Live Sync', bg: '#dcfce7', color: '#15803d' }}
          subtitle={`${protections.length} total registered assets`}
        />
        <StatCard
          label="Protected Value"
          value={formatINR(protectedValueINR)}
          icon={IndianRupee}
          iconBg="#f2f7fd"
          iconColor="#0066cc"
          trend={{ label: '100% Insured', bg: '#dbeafe', color: '#1d4ed8' }}
          subtitle="Total covered replacement cost"
        />
        <StatCard
          label="Expiring Soon"
          value={expiringSoonCount}
          icon={Clock}
          iconBg="#fff2e5"
          iconColor="#c93400"
          trend={expiringSoonCount > 0 ? { label: 'Action needed', bg: '#ffedd5', color: '#c2410c' } : { label: 'All Safe', bg: '#f1f5f9', color: '#64748b' }}
          subtitle="Next 30 days window"
        />
        <StatCard
          label="Open Claims"
          value={activeClaimsCount}
          icon={AlertTriangle}
          iconBg="#f5f2fd"
          iconColor="#af52de"
          trend={{ label: 'AI Assisted', bg: '#f3e8ff', color: '#7e22ce' }}
          subtitle="Active escalation tickets"
        />
      </div>

      {/* Main Grid: My Protections & Recent Claims */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* MY PROTECTIONS */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d1d1f' }}>Active Protections</h2>
              <p style={{ fontSize: '0.85rem', color: '#6e6e73' }}>Warranties, insurance policies, and AMC coverage</p>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }} onClick={onNavigateToProtections}>
              View All
            </button>
          </div>

          {protections.length === 0 ? (
            <div className="empty-state-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
              <div className="empty-icon-box" style={{ width: 64, height: 64, margin: '0 auto 1rem auto' }}>
                <PackageCheck size={30} color="#0066cc" />
              </div>
              <h3 className="empty-title" style={{ fontSize: '1.15rem' }}>No protections yet</h3>
              <p className="empty-subtitle" style={{ fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Keep warranties and insurance policies in one secure place. Scan receipts or add protection records in seconds.
              </p>
              
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={onOpenAddModal}>
                  <Plus size={15} />
                  <span>Add Protection</span>
                </button>
                <button className="btn btn-secondary" onClick={onOpenOcrModal}>
                  <FileScan size={15} color="#0066cc" />
                  <span>Scan Receipt</span>
                </button>
              </div>

              {/* Onboarding Steps */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e5ea', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                  <strong style={{ display: 'block', color: '#1d1d1f', marginBottom: '0.2rem' }}>1. Add Purchase</strong>
                  Enter product or policy details
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                  <strong style={{ display: 'block', color: '#1d1d1f', marginBottom: '0.2rem' }}>2. Vault Docs</strong>
                  Upload invoices & PDFs
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                  <strong style={{ display: 'block', color: '#1d1d1f', marginBottom: '0.2rem' }}>3. Expiry Alerts</strong>
                  Get automatic reminders
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                  <strong style={{ display: 'block', color: '#1d1d1f', marginBottom: '0.2rem' }}>4. File Claims</strong>
                  Instant AI claim assistant
                </div>
              </div>
            </div>
          ) : (
            <div className="protections-grid">
              {protections.slice(0, 4).map((item) => (
                <div key={item.id} onClick={() => onSelectProtectionForDetail(item)} style={{ cursor: 'pointer' }}>
                  <WarrantyCard
                    item={item}
                    onFileClaimForItem={onOpenFileClaimForItem}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT CLAIMS SIDEBAR */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d1d1f' }}>Recent Claims</h2>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={onOpenFileClaimModal}>
              + File Claim
            </button>
          </div>

          {claims.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '1rem', border: '1px solid #e5e5ea', padding: '1.75rem', textAlign: 'center', color: '#6e6e73' }}>
              <FileText size={28} color="#86868b" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', margin: 0 }}>No active claims right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {claims.slice(0, 3).map((claim) => (
                <div
                  key={claim.id}
                  style={{ background: '#ffffff', borderRadius: '0.85rem', border: '1px solid #e5e5ea', padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => onSelectClaimTrack(claim)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#1d1d1f' }}>{claim.brand} {claim.model}</strong>
                    <span className="status-badge active" style={{ fontSize: '0.7rem' }}>{claim.status}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6e6e73', margin: 0 }}>Issue: {claim.issueCategory}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
