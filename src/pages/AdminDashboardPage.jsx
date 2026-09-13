import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Edit3,
  MessageSquare,
  Wrench,
  Send,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  HelpCircle,
  FileCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import BrandLogoIcon from '../components/BrandLogoIcon';

const STATUS_PILLS = {
  SUBMITTED: { label: 'Submitted', bg: '#eff6ff', color: '#2563eb' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#fef3c7', color: '#b45309' },
  MORE_INFORMATION_REQUIRED: { label: 'More Info Needed', bg: '#ffedd5', color: '#c2410c' },
  APPROVED: { label: 'Approved', bg: '#f0fdf4', color: '#16a34a' },
  REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626' },
  ASSIGNED_TO_SERVICE_CENTRE: { label: 'Assigned Hub', bg: '#f5f3ff', color: '#7c3aed' },
  IN_REPAIR: { label: 'In Repair', bg: '#faf5ff', color: '#9333ea' },
  REPLACEMENT_PROCESS: { label: 'Replacement', bg: '#ecfeff', color: '#0891b2' },
  RESOLVED: { label: 'Resolved', bg: '#f0fdf4', color: '#15803d' },
  CLOSED: { label: 'Closed', bg: '#f1f5f9', color: '#475569' },
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'claims' | 'users' | 'companies' | 'audit'
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [taxonomyData, setTaxonomyData] = useState(null);
  const [taxonomySearch, setTaxonomySearch] = useState('');
  const [selectedTaxonomyCat, setSelectedTaxonomyCat] = useState('all');
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [claimSearch, setClaimSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected claim for review / status modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [statusUpdateVal, setStatusUpdateVal] = useState('');
  const [internalNotesVal, setInternalNotesVal] = useState('');
  const [serviceCentreInfoVal, setServiceCentreInfoVal] = useState('');
  const [adminMessageVal, setAdminMessageVal] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, c, u, comps, aud, tax] = await Promise.all([
        api.getAdminStats(),
        api.getClaims(),
        api.getAdminUsers(),
        api.getCompanies(),
        api.getAuditLogs(),
        api.getAdminTaxonomy(),
      ]);
      setStats(s);
      setClaims(c);
      setUsers(u);
      setCompanies(comps);
      setAuditLogs(aud);
      setTaxonomyData(tax);
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenClaimModal = async (claim) => {
    const fresh = await api.getClaimById(claim.id);
    setSelectedClaim(fresh || claim);
    setStatusUpdateVal((fresh || claim).status || 'SUBMITTED');
    setInternalNotesVal((fresh || claim).internal_notes || '');
    setServiceCentreInfoVal((fresh || claim).service_centre_info || '');
    setAdminMessageVal('');
  };

  const handleSaveStatusUpdate = async () => {
    if (!selectedClaim) return;
    setIsUpdating(true);
    try {
      const updated = await api.updateClaimStatus(
        selectedClaim.id,
        statusUpdateVal,
        'WarrantyEase Operator',
        'admin',
        internalNotesVal,
        serviceCentreInfoVal
      );
      if (adminMessageVal.trim()) {
        await api.addClaimMessage(
          selectedClaim.id,
          'usr-admin',
          'WarrantyEase Support',
          'admin',
          adminMessageVal.trim()
        );
      }
      setSelectedClaim(null);
      await loadData();
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filtered claims for table
  const filteredClaims = claims.filter(c => {
    const q = claimSearch.toLowerCase();
    const matchesSearch = !q ||
      c.id.toLowerCase().includes(q) ||
      (c.brand || '').toLowerCase().includes(q) ||
      (c.productName || c.product_name || '').toLowerCase().includes(q) ||
      (c.problemDescription || c.problem_description || '').toLowerCase().includes(q);

    const matchesCompany = companyFilter === 'All' ||
      (c.brand || '').toLowerCase() === companyFilter.toLowerCase();

    const matchesStatus = statusFilter === 'All' ||
      (c.status || '').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesCompany && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', paddingBottom: '3rem' }}>

      {/* Admin Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#dc2626', padding: '0.15rem 0.55rem', borderRadius: '12px', fontWeight: 800, border: '1px solid #fecaca' }}>
              🛡️ Operator Console
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>WarrantyEase Central Command</span>
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>Platform Administration & Claim Router</h1>
          <p className="page-description">
            Oversee all registered users, claims routing, brand queues, service networks, and audit trails.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={loadData} style={{ fontSize: '0.82rem' }}>
            Refresh Live State
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'overview', label: 'Platform KPIs & Analytics', icon: BarChart3 },
          { id: 'claims', label: `Claims Router (${claims.length})`, icon: FileText },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'companies', label: `Partner Brands (${companies.length})`, icon: Building2 },
          { id: 'taxonomy', label: `Taxonomy & Rules (${taxonomyData?.total_issues || 28})`, icon: Tag },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.55rem 1rem', borderRadius: '0.6rem', border: 'none',
                background: isActive ? '#0f172a' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 800 : 600, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: OVERVIEW & KPIS ─── */}
      {activeTab === 'overview' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Users</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>{stats.total_users}</div>
              <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>+100% Verified accounts</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Warranties</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#2563eb', margin: '0.2rem 0' }}>{stats.active_warranties}</div>
              <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>{stats.expiring_soon} expiring in 30 days</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Insurance</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#16a34a', margin: '0.2rem 0' }}>{stats.total_insurance}</div>
              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>Health & Motor Policies</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Claims</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#7c3aed', margin: '0.2rem 0' }}>{stats.total_claims}</div>
              <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700 }}>{stats.pending_claims} awaiting action</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Partner Companies</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0284c7', margin: '0.2rem 0' }}>{stats.total_companies}</div>
              <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 700 }}>Active service networks</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Claim Resolution Rate</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#059669', margin: '0.2rem 0' }}>94.2%</div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>Avg SLA: 2.4 days</div>
            </div>
          </div>

          {/* Two Columns: Brand Breakdown & Operator Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="#2563eb" />
                <span>Top Registered Brands by Volume</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(stats.brand_distribution || []).map((b, idx) => (
                  <div key={b.brand} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', width: 20 }}>#{idx + 1}</span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{b.brand}</strong>
                    </div>
                    <span style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 800 }}>
                      {b.count} assets
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#7c3aed" />
                <span>Operator Quick Actions & System Health</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', fontSize: '0.82rem', color: '#15803d' }}>
                  <strong>✓ Relational Engine:</strong> SQLite database active with full ACID support at <code>backend/warrantyease.db</code>.
                </div>
                <div style={{ padding: '0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', fontSize: '0.82rem', color: '#1d4ed8' }}>
                  <strong>✓ Claim Router:</strong> Automated sequential claim assignment (<code>WE-XXXXXX</code>) active.
                </div>
                <div style={{ padding: '0.85rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', fontSize: '0.82rem', color: '#92400e' }}>
                  <strong>⚠ Pending Review:</strong> {stats.pending_claims} customer claims require operator routing.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CLAIMS MANAGEMENT ─── */}
      {activeTab === 'claims' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search Claim ID, Brand, Product, Problem..."
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
              >
                <option value="All">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ASSIGNED_TO_SERVICE_CENTRE">Assigned to Centre</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
              >
                <option value="All">All Brands</option>
                {companies.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                  <th style={{ padding: '0.75rem' }}>Claim ID</th>
                  <th style={{ padding: '0.75rem' }}>Customer / Product</th>
                  <th style={{ padding: '0.75rem' }}>Issue Description</th>
                  <th style={{ padding: '0.75rem' }}>Assigned Brand</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No claims match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => {
                    const pill = STATUS_PILLS[claim.status] || { label: claim.status, bg: '#f1f5f9', color: '#475569' };
                    return (
                      <tr key={claim.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>
                          {claim.id}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <strong style={{ color: '#0f172a', display: 'block' }}>{claim.brand} {claim.productName || claim.model}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{claim.protectionType || 'Warranty'}</span>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', maxWidth: '280px', color: '#334155' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{claim.issueCategory}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {claim.problemDescription}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                            {claim.brand}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <span style={{ background: pill.bg, color: pill.color, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid rgba(0,0,0,0.06)' }}>
                            {pill.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleOpenClaimModal(claim)}
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                          >
                            Manage Ticket
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: USERS DIRECTORY ─── */}
      {activeTab === 'users' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Registered Platform Accounts
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                <th style={{ padding: '0.75rem' }}>User ID</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Role</th>
                <th style={{ padding: '0.75rem' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>{u.id}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{u.name}</td>
                  <td style={{ padding: '0.75rem', color: '#334155' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 800,
                      padding: '0.15rem 0.5rem', borderRadius: '10px',
                      background: u.role === 'admin' ? '#fef2f2' : u.role === 'company' ? '#f5f3ff' : '#eff6ff',
                      color: u.role === 'admin' ? '#dc2626' : u.role === 'company' ? '#7c3aed' : '#2563eb'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>{u.created_at ? u.created_at.slice(0, 10) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 4: PARTNER BRANDS ─── */}
      {activeTab === 'companies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {companies.map(c => (
            <div key={c.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
                  <BrandLogoIcon brand={c.name} size={28} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{c.name}</h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.category}</span>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.65rem', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.85rem' }}>
                <div><span style={{ color: '#64748b' }}>Support Email:</span> <strong>{c.support_email}</strong></div>
                <div><span style={{ color: '#64748b' }}>Support Phone:</span> <strong>{c.support_phone}</strong></div>
                <div><span style={{ color: '#64748b' }}>Routing Channel:</span> <span style={{ color: '#2563eb', fontWeight: 700 }}>{c.claim_method}</span></div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#15803d', background: '#f0fdf4', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 700, display: 'inline-block' }}>
                ● Active Internal Queue
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TAB 5: CLAIM TAXONOMY & RULES ─── */}
      {activeTab === 'taxonomy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, border: '1px solid #bfdbfe' }}>
                    3-Tier Taxonomy Engine
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Database-Driven Rules (No Hardcoded Electronic Questions)
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                  Category-Aware Issue Taxonomy & Diagnostic Rules
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Inspect issue templates, dynamic follow-up diagnostic questions, and required evidence checklists configured per product family.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', minWidth: '260px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search issues, symptoms, questions..."
                    value={taxonomySearch}
                    onChange={(e) => setTaxonomySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => setSelectedTaxonomyCat('all')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedTaxonomyCat === 'all' ? '#2563eb' : '#e2e8f0',
                  background: selectedTaxonomyCat === 'all' ? '#eff6ff' : '#ffffff',
                  color: selectedTaxonomyCat === 'all' ? '#2563eb' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: selectedTaxonomyCat === 'all' ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                All Categories ({taxonomyData?.total_issues || 0})
              </button>
              {(taxonomyData?.categories || []).map((cat) => {
                const isSelected = selectedTaxonomyCat === cat.id;
                const count = (taxonomyData?.issues || []).filter(i => i.category_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedTaxonomyCat(cat.id)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#2563eb' : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer'
                    }}
                  >
                    {cat.icon} {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Tier Resolution Explainer Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                1
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Level 1: Exact Model Match</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Matches specific product keywords first (e.g. Front Load AI Ecobubble).</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                2
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Level 2: Category Template</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Resolves to dedicated appliance taxonomy (e.g. Drum/Spin/Drain).</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                3
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Level 3: Safe Generic Fallback</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>General hardware taxonomy if brand/model category is ambiguous.</div>
              </div>
            </div>
          </div>

          {/* Issues Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {(taxonomyData?.issues || [])
              .filter(issue => {
                if (selectedTaxonomyCat !== 'all' && issue.category_id !== selectedTaxonomyCat) return false;
                if (!taxonomySearch.trim()) return true;
                const q = taxonomySearch.toLowerCase();
                return (
                  issue.label?.toLowerCase().includes(q) ||
                  issue.description?.toLowerCase().includes(q) ||
                  issue.category_id?.toLowerCase().includes(q) ||
                  issue.questions?.some(qu => qu.question_text?.toLowerCase().includes(q))
                );
              })
              .map((issue) => {
                const catObj = (taxonomyData?.categories || []).find(c => c.id === issue.category_id);
                return (
                  <div
                    key={issue.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace' }}>
                          {catObj?.icon || '📦'} {issue.category_id}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {issue.issue_key}
                        </span>
                      </div>
                      <h3 style={{ margin: '0.2rem 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                        {issue.label}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                        {issue.description}
                      </p>
                    </div>

                    {/* Diagnostic Questions Section */}
                    {issue.questions && issue.questions.length > 0 && (
                      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '0.65rem', padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                          <HelpCircle size={13} color="#2563eb" />
                          <span>Diagnostic Follow-Up Questions ({issue.questions.length})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {issue.questions.map((q, idx) => (
                            <div key={idx} style={{ fontSize: '0.74rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                              <span style={{ fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>Q{idx + 1}:</span>
                              <div style={{ flex: 1 }}>
                                <span>{q.question_text}</span>
                                <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: '#e2e8f0', color: '#475569', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>
                                  {q.question_type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence Checklist Section */}
                    {issue.evidence && issue.evidence.length > 0 && (
                      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '0.65rem', padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>
                          <FileCheck size={13} color="#16a34a" />
                          <span>Tailored Evidence Checklist ({issue.evidence.length})</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {issue.evidence.map((ev, idx) => (
                            <div key={idx} style={{ fontSize: '0.74rem', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Check size={12} color={ev.is_mandatory ? '#dc2626' : '#64748b'} />
                                <span>{ev.item_name}</span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '10px',
                                  background: ev.is_mandatory ? '#fef2f2' : '#f1f5f9',
                                  color: ev.is_mandatory ? '#dc2626' : '#64748b',
                                  border: ev.is_mandatory ? '1px solid #fecaca' : '1px solid #e2e8f0',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {ev.is_mandatory ? 'Required' : 'Optional'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ─── TAB 6: AUDIT LOGS ─── */}
      {activeTab === 'audit' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            System Audit Trail & Security Log
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.78rem' }}>
                <div>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', marginRight: '0.5rem' }}>[{log.action}]</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>By: {log.user_id} ({log.user_role})</span>
                  <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>Target: {log.object_type} #{log.object_id}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                  {log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CLAIM MANAGEMENT MODAL ─── */}
      {selectedClaim && (
        <div className="modal-overlay" onClick={() => setSelectedClaim(null)} style={{ zIndex: 1200 }}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{selectedClaim.id}</span>
                <h2 className="modal-title">{selectedClaim.brand} {selectedClaim.productName || selectedClaim.model}</h2>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedClaim(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Customer Issue Details */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.88rem', color: '#0f172a' }}>Issue Description</h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  {selectedClaim.problemDescription}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Preferred Resolution: <strong>{selectedClaim.preferredResolution}</strong></span>
                  <span>Claimed Amount: <strong>₹{selectedClaim.claimedAmount || 0}</strong></span>
                </div>
              </div>

              {/* Status Update Form */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Change Claim Lifecycle Status:
                </label>
                <select
                  value={statusUpdateVal}
                  onChange={(e) => setStatusUpdateVal(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  <option value="SUBMITTED">SUBMITTED (Customer Filed)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Operator Validated)</option>
                  <option value="MORE_INFORMATION_REQUIRED">MORE_INFORMATION_REQUIRED (Request Details)</option>
                  <option value="APPROVED">APPROVED (Authorized for Repair/Replacement)</option>
                  <option value="REJECTED">REJECTED (Out of Warranty / Policy Clause)</option>
                  <option value="ASSIGNED_TO_SERVICE_CENTRE">ASSIGNED_TO_SERVICE_CENTRE (Hub Pickup)</option>
                  <option value="IN_REPAIR">IN_REPAIR (Under Technical Service)</option>
                  <option value="REPLACEMENT_PROCESS">REPLACEMENT_PROCESS (New Unit Dispatch)</option>
                  <option value="RESOLVED">RESOLVED (Customer Delivery Confirmed)</option>
                  <option value="CLOSED">CLOSED (Archived)</option>
                </select>
              </div>

              {/* Assign Service Center */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Assign Authorized Service Center / Hub:
                </label>
                <input
                  type="text"
                  placeholder="e.g. boAt Indiranagar Hub, Bangalore - Indiranagar 100ft Road"
                  value={serviceCentreInfoVal}
                  onChange={(e) => setServiceCentreInfoVal(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              {/* Internal Operator Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Internal Operator Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="Private notes for WarrantyEase audit trail..."
                  value={internalNotesVal}
                  onChange={(e) => setInternalNotesVal(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>

              {/* Message Customer */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  Send Update Message to Customer:
                </label>
                <input
                  type="text"
                  placeholder="Customer will see this update directly in their claim timeline..."
                  value={adminMessageVal}
                  onChange={(e) => setAdminMessageVal(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '0.6rem', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedClaim(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveStatusUpdate} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Apply Status Update'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
