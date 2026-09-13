import React, { useState } from 'react';
import {
  HeartPulse,
  Car,
  Gem,
  Plane,
  Home,
  Shield,
  ShieldCheck,
  Plus,
  FileScan,
  Calendar,
  Clock,
  Building2,
  Search,
  X,
  Copy,
  Check,
  ChevronRight,
  FileText,
  AlertTriangle,
  ExternalLink,
  IndianRupee,
  Sparkles,
  Trash2
} from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';
import { formatINR } from '../utils/warrantyCalculator';

const CATEGORY_TABS = [
  { id: 'All', label: 'All Policies', icon: Shield },
  { id: 'Health Insurance', label: 'Health', icon: HeartPulse },
  { id: 'Vehicle Insurance', label: 'Vehicle', icon: Car },
  { id: 'Jewellery & Valuables', label: 'Jewellery', icon: Gem },
  { id: 'Travel Insurance', label: 'Travel', icon: Plane },
  { id: 'Property / Home', label: 'Property / Home', icon: Home },
  { id: 'Other Policy', label: 'Other', icon: FileText },
];

function toTitleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(dateStr) {
  if (!dateStr) return 'Annual Renewal';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  try {
    const expiry = new Date(dateStr);
    if (isNaN(expiry.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export default function InsurancePage({
  protections = [],
  onOpenAddInsuranceModal,
  onOpenOcrModal,
  onOpenFileClaimForItem,
  onSelectProtectionForDetail,
  onDeleteProtection
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Strict insurance filtering (never mix with product warranties)
  const insuranceList = protections.filter((p) => {
    return (
      p.protectionType === 'Insurance' ||
      p.protection_type === 'Insurance' ||
      p.type === 'INSURANCE' ||
      (p.category || '').toLowerCase().includes('insurance')
    );
  });

  const filteredPolicies = insuranceList.filter((item) => {
    const categoryLower = (item.category || '').toLowerCase();
    const matchesCategory =
      selectedCategory === 'All' ||
      categoryLower.includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Health Insurance' && categoryLower.includes('health')) ||
      (selectedCategory === 'Vehicle Insurance' && (categoryLower.includes('vehicle') || categoryLower.includes('motor') || categoryLower.includes('car')));

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (item.brand || '').toLowerCase().includes(query) ||
      (item.productName || item.product_name || item.model || '').toLowerCase().includes(query) ||
      (item.policyNumber || item.policy_number || '').toLowerCase().includes(query) ||
      (item.policyHolder || item.policy_holder || item.customerName || '').toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const totalSumInsured = insuranceList.reduce(
    (sum, p) => sum + (Number(p.sumInsured || p.sum_insured || p.price) || 0),
    0
  );

  const expiringCount = insuranceList.filter((p) => {
    const days = getDaysRemaining(p.expiryDate || p.expiry_date);
    return days !== null && days <= 30 && days >= 0;
  }).length;

  const handleCopyPolicyNumber = (e, policyNo, id) => {
    e.stopPropagation();
    if (!policyNo || policyNo === 'Not Stated') return;
    navigator.clipboard.writeText(policyNo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryCount = (tabId) => {
    if (tabId === 'All') return insuranceList.length;
    return insuranceList.filter((item) => {
      const cat = (item.category || '').toLowerCase();
      if (tabId === 'Health Insurance') return cat.includes('health');
      if (tabId === 'Vehicle Insurance') return cat.includes('vehicle') || cat.includes('motor') || cat.includes('car');
      return cat.includes(tabId.toLowerCase());
    }).length;
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ─── Clean Modern Header ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0284c7',
              background: '#e0f2fe',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px'
            }}>
              Protection Vault
            </span>
          </div>
          <h1 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.025em'
          }}>
            Insurance Policies
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Manage health, vehicle, travel, and property policies. Instant access to policy schedules and claim desks.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenOcrModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '0.65rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <FileScan size={16} color="#0284c7" />
            <span>Scan Policy</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddInsuranceModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '0.65rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Add Policy</span>
          </button>
        </div>
      </div>

      {/* ─── Metric Cards Strip (Clean & Readable) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Active Policies */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1rem',
          padding: '1.25rem 1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Policies
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.1rem' }}>
              {insuranceList.length}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Registered in vault</span>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '0.75rem',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        {/* Card 2: Total Sum Insured */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1rem',
          padding: '1.25rem 1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Sum Insured
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.1rem' }}>
              {formatINR(totalSumInsured)}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Combined medical & asset cover</span>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '0.75rem',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <HeartPulse size={22} />
          </div>
        </div>

        {/* Card 3: Upcoming Renewals */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1rem',
          padding: '1.25rem 1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Renewal Status
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: expiringCount > 0 ? '#ea580c' : '#0f172a', margin: '0.25rem 0 0.1rem' }}>
              {expiringCount > 0 ? `${expiringCount} Due Soon` : 'Up to Date'}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Next 30-day renewals</span>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '0.75rem',
            background: expiringCount > 0 ? '#fff7ed' : '#f8fafc',
            color: expiringCount > 0 ? '#ea580c' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={22} />
          </div>
        </div>

        {/* Card 4: Cashless Support */}
        <div style={{
          background: '#ffffff',
          borderRadius: '1rem',
          padding: '1.25rem 1.35rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cashless Network
            </span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.1rem' }}>
              Ready
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>TPAs & garages supported</span>
          </div>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '0.75rem',
            background: '#f1f5f9',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs & Polished Search Bar ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none'
        }}>
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            const count = getCategoryCount(tab.id);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  background: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} color={isActive ? '#ffffff' : '#64748b'} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b'
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Polished Search Box */}
        <div style={{
          position: 'relative',
          minWidth: '280px',
          flex: '1',
          maxWidth: '360px'
        }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search insurer, policy #, or holder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 2.2rem 0.55rem 2.4rem',
              borderRadius: '0.65rem',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '0.84rem',
              color: '#0f172a',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#0066cc'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Policies Grid (Clean & Modern Cards) ─── */}
      {filteredPolicies.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto 1.25rem',
            background: '#f0fdf4',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#16a34a'
          }}>
            <HeartPulse size={32} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            No Insurance Policies Found
          </h3>
          <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: 1.5, fontSize: '0.88rem' }}>
            {searchQuery
              ? `No policies match "${searchQuery}". Try a different keyword.`
              : 'Add your health, motor, travel, or home insurance policies to track renewals and initiate cashless hospital or garage claims.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenAddInsuranceModal}
              style={{ fontSize: '0.84rem', padding: '0.55rem 1.15rem' }}
            >
              <Plus size={15} />
              <span>Add Policy</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenOcrModal}
              style={{ fontSize: '0.84rem', padding: '0.55rem 1.15rem' }}
            >
              <FileScan size={15} color="#0284c7" />
              <span>Scan Policy Document</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredPolicies.map((p) => {
            const sumVal = p.sumInsured || p.sum_insured || p.price;
            const policyNo = p.policyNumber || p.policy_number || 'Not Stated';
            const holder = p.policyHolder || p.policy_holder || p.customerName || 'Registered User';
            const expiryRaw = p.expiryDate || p.expiry_date;
            const daysLeft = getDaysRemaining(expiryRaw);
            const isExpiringSoon = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
            const isExpired = daysLeft !== null && daysLeft < 0;

            const brandName = p.brand || 'Insurance Provider';
            const productName = toTitleCase(p.productName || p.product_name || p.model || 'Insurance Policy');
            const categoryName = p.category || 'Insurance';

            return (
              <div
                key={p.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.35rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.15rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
                onClick={() => onSelectProtectionForDetail(p)}
              >
                <div>
                  {/* Card Header: Brand Logo, Name, Category & Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '0.65rem',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        flexShrink: 0
                      }}>
                        <BrandLogoIcon brand={p.brand} domain={p.logoDomain} size={28} />
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          margin: 0,
                          lineHeight: 1.25
                        }}>
                          {brandName}
                        </h3>
                        <div style={{
                          fontSize: '0.82rem',
                          color: '#64748b',
                          fontWeight: 500,
                          marginTop: '0.15rem'
                        }}>
                          {productName}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: isExpired
                          ? '#fef2f2'
                          : isExpiringSoon
                          ? '#fffbeb'
                          : '#f0fdf4',
                        color: isExpired
                          ? '#b91c1c'
                          : isExpiringSoon
                          ? '#b45309'
                          : '#15803d',
                        border: isExpired
                          ? '1px solid #fecaca'
                          : isExpiringSoon
                          ? '1px solid #fde68a'
                          : '1px solid #bbf7d0'
                      }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#22c55e'
                        }} />
                        {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                      </span>

                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px'
                      }}>
                        {categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Clean Info Box */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid #f1f5f9',
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    {/* Top Row: Sum Insured & Expiry Date */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      paddingBottom: '0.65rem',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                          Sum Insured
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                          {sumVal ? formatINR(sumVal) : 'Standard Cover'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                          Valid Until
                        </span>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isExpiringSoon ? '#ea580c' : '#0f172a', marginTop: '0.2rem' }}>
                          {formatDate(expiryRaw)}
                        </div>
                        {isExpiringSoon && (
                          <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600 }}>
                            ({daysLeft} days left)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Policy Number with Copy & Policyholder */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
                          Policy Number
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '0.82rem'
                          }}>
                            {policyNo}
                          </span>
                          {policyNo !== 'Not Stated' && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyPolicyNumber(e, policyNo, p.id)}
                              title="Copy Policy Number"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: copiedId === p.id ? '#16a34a' : '#94a3b8',
                                padding: '1px',
                                display: 'inline-flex',
                                alignItems: 'center'
                              }}
                            >
                              {copiedId === p.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.68rem', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>
                          Policyholder
                        </span>
                        <span style={{ color: '#1e293b', fontWeight: 600, display: 'block', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {holder}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Snippet if Available */}
                  {p.coverageInfo && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginTop: '0.75rem',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.35rem'
                    }}>
                      <span style={{ color: '#0284c7', flexShrink: 0 }}>🛡️</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {p.coverageInfo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.85rem',
                  gap: '0.5rem'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProtectionForDetail(p);
                    }}
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '0.55rem',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff'
                    }}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenFileClaimForItem(p);
                    }}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '0.4rem 0.95rem',
                      borderRadius: '0.55rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>File Claim</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
