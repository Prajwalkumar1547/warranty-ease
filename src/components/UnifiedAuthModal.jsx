import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Building2,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export const BRAND_CREDENTIALS = {
  'comp-boat': {
    id: 'comp-boat',
    name: 'boAt',
    category: 'Audio & Wearables',
    passwords: ['Boat@1547', 'boat@1547'],
    displayPass: 'Boat@1547',
    supportEmail: 'service@boat-lifestyle.com',
  },
  'comp-samsung': {
    id: 'comp-samsung',
    name: 'Samsung',
    category: 'Electronics & Appliances',
    passwords: ['samsung@1547', 'Samsung@1547'],
    displayPass: 'samsung@1547',
    supportEmail: 'support@samsung.com',
  },
  'comp-carehealth': {
    id: 'comp-carehealth',
    name: 'Care Health',
    category: 'Health Insurance',
    passwords: ['care@1547', 'Care@1547'],
    displayPass: 'care@1547',
    supportEmail: 'claims@careinsurance.com',
  },
  'comp-starhealth': {
    id: 'comp-starhealth',
    name: 'Star Health',
    category: 'Health Insurance',
    passwords: ['star@1547', 'Star@1547'],
    displayPass: 'star@1547',
    supportEmail: 'support@starhealth.in',
  },
  'comp-apple': {
    id: 'comp-apple',
    name: 'Apple',
    category: 'Computers & Mobiles',
    passwords: ['Apple@1547', 'apple@1547'],
    displayPass: 'Apple@1547',
    supportEmail: 'support@apple.com',
  },
  'comp-lg': {
    id: 'comp-lg',
    name: 'LG',
    category: 'Home Appliances & TVs',
    passwords: ['LG@1547', 'lg@1547'],
    displayPass: 'LG@1547',
    supportEmail: 'support@lg.com',
  },
  'comp-sony': {
    id: 'comp-sony',
    name: 'Sony',
    category: 'Audio & Television',
    passwords: ['Sony@1547', 'sony@1547'],
    displayPass: 'Sony@1547',
    supportEmail: 'support@sony.com',
  },
  'comp-icici': {
    id: 'comp-icici',
    name: 'ICICI Lombard',
    category: 'Motor Insurance',
    passwords: ['ICICI@1547', 'icici@1547'],
    displayPass: 'ICICI@1547',
    supportEmail: 'claims@icicilombard.com',
  },
  'comp-tataaig': {
    id: 'comp-tataaig',
    name: 'Tata AIG',
    category: 'General Insurance',
    passwords: ['Tata@1547', 'tata@1547'],
    displayPass: 'Tata@1547',
    supportEmail: 'claims@tataaig.com',
  },
};

export const ADMIN_PASSWORDS = ['admin@1547', 'Admin@1547'];
export const ADMIN_DISPLAY_PASS = 'admin@1547';

export default function UnifiedAuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'company',
  preselectedBrandId = 'comp-boat'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'customer' | 'company' | 'admin'
  const [selectedBrandId, setSelectedBrandId] = useState(preselectedBrandId);
  const [companyPassword, setCompanyPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showHelpKeys, setShowHelpKeys] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedBrandId(preselectedBrandId || 'comp-boat');
      setCompanyPassword('');
      setAdminPassword('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialTab, preselectedBrandId]);

  if (!isOpen) return null;

  const currentBrand = BRAND_CREDENTIALS[selectedBrandId] || BRAND_CREDENTIALS['comp-boat'];

  // Handle Customer Sign-in
  const handleCustomerLogin = () => {
    setErrorMsg('');
    setSuccessMsg('Welcome back to Customer View!');
    setTimeout(() => {
      onLoginSuccess('customer', null, null);
      onClose();
    }, 400);
  };

  // Handle Company Login with Private Password
  const handleCompanyLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const inputTrimmed = companyPassword.trim();
    if (!inputTrimmed) {
      setErrorMsg(`Please enter the private password for ${currentBrand.name}.`);
      return;
    }

    const isValid = currentBrand.passwords.includes(inputTrimmed);
    if (!isValid) {
      setErrorMsg(`Access Denied: Incorrect private password for ${currentBrand.name}. Only authorized brand partners may access this desk.`);
      return;
    }

    setSuccessMsg(`Authenticated as ${currentBrand.name} Service Desk! Redirecting...`);
    setTimeout(() => {
      onLoginSuccess('company', currentBrand.id, currentBrand.name);
      onClose();
    }, 500);
  };

  // Handle Admin Login with Operator Password
  const handleAdminLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const inputTrimmed = adminPassword.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter the operator admin password.');
      return;
    }

    const isValid = ADMIN_PASSWORDS.includes(inputTrimmed);
    if (!isValid) {
      setErrorMsg('Access Denied: Incorrect operator console password.');
      return;
    }

    setSuccessMsg('Operator Credentials Verified. Unlocking Console...');
    setTimeout(() => {
      onLoginSuccess('admin', null, null);
      onClose();
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '540px', padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={22} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#fff' }}>
                Unified Portal Access
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.15rem 0 0' }}>
                Secure role authentication & private brand gateways
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onClose}
            style={{ color: '#cbd5e1', background: 'rgba(255,255,255,0.1)', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Portal Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr 1fr',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('customer'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'customer' ? '2px solid #2563eb' : '2px solid transparent',
              background: activeTab === 'customer' ? '#ffffff' : 'transparent',
              color: activeTab === 'customer' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'customer' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <User size={15} />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('company'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'company' ? '2px solid #7c3aed' : '2px solid transparent',
              background: activeTab === 'company' ? '#ffffff' : 'transparent',
              color: activeTab === 'company' ? '#7c3aed' : '#64748b',
              fontWeight: activeTab === 'company' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Building2 size={15} />
            <span>Partner Brand</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'admin' ? '2px solid #dc2626' : '2px solid transparent',
              background: activeTab === 'admin' ? '#ffffff' : 'transparent',
              color: activeTab === 'admin' ? '#dc2626' : '#64748b',
              fontWeight: activeTab === 'admin' ? 800 : 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldAlert size={15} />
            <span>Admin Ops</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.65rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#b91c1c',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.65rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              color: '#15803d',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* ─── TAB 1: CUSTOMER VIEW ─── */}
          {activeTab === 'customer' && (
            <div>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.85rem',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  RS
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Rahul Sharma
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    rahul.sharma@example.com • Verified Customer
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '10px',
                    display: 'inline-block',
                    marginTop: '0.3rem'
                  }}>
                    Active Protection Vault
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Access personal product warranties, insurance policies, claim history, and AI invoice scanner without needing a brand service key.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCustomerLogin}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>Enter Customer Vault</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ─── TAB 2: PARTNER BRAND / COMPANY ─── */}
          {activeTab === 'company' && (
            <form onSubmit={handleCompanyLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.45rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Select Partner Brand:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => {
                      setSelectedBrandId(e.target.value);
                      setCompanyPassword('');
                      setErrorMsg('');
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                  >
                    {Object.values(BRAND_CREDENTIALS).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} — {b.category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand Spotlight Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.85rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '0.65rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    <BrandLogoIcon brand={currentBrand.name} size={30} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentBrand.name} Service Desk
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {currentBrand.category}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#7c3aed',
                  background: '#f5f3ff',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '12px'
                }}>
                  Private Portal
                </span>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    Brand Private Password:
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Case-sensitive passkey
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={`Enter ${currentBrand.name} private password`}
                    value={companyPassword}
                    onChange={(e) => setCompanyPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.6rem 0.65rem 0.85rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.2rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  background: '#7c3aed',
                  borderColor: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <KeyRound size={16} />
                <span>Sign In to {currentBrand.name} Portal</span>
              </button>

              {/* Quick Fill Helper for Demo / Testing */}
              <div style={{
                background: '#faf5ff',
                border: '1px solid #f3e8ff',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <KeyRound size={13} color="#7c3aed" /> Authorized Brand Password:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCompanyPassword(currentBrand.displayPass)}
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Auto-fill Key
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <code style={{ background: '#ffffff', border: '1px solid #e9d5ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', color: '#6b21a8', fontWeight: 800, fontFamily: 'monospace' }}>
                    {currentBrand.displayPass}
                  </code>
                  <span style={{ fontSize: '0.72rem', color: '#7e22ce' }}>
                    for {currentBrand.name}
                  </span>
                </div>
              </div>
            </form>
          )}

          {/* ─── TAB 3: OPERATOR ADMIN ─── */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin}>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.85rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '0.65rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#991b1b' }}>
                    WarrantyEase Platform Operator
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#b91c1c' }}>
                    Global administration, claim routing audit & database controls
                  </div>
                </div>
              </div>

              {/* Admin Password Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.45rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Operator Security Password:
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter operator master passkey"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.6rem 0.65rem 0.85rem',
                      borderRadius: '0.65rem',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '0.2rem'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  background: '#dc2626',
                  borderColor: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <ShieldCheck size={16} />
                <span>Unlock Operator Console</span>
              </button>

              {/* Admin Pass Hint */}
              <div style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <KeyRound size={13} color="#dc2626" /> Operator Console Password:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdminPassword(ADMIN_DISPLAY_PASS)}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Auto-fill Key
                  </button>
                </div>
                <code style={{ background: '#ffffff', border: '1px solid #fda4af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', color: '#9f1239', fontWeight: 800, fontFamily: 'monospace' }}>
                  {ADMIN_DISPLAY_PASS}
                </code>
              </div>
            </form>
          )}

          {/* Quick Password Reference Table Drawer */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setShowHelpKeys(!showHelpKeys)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: 0
              }}
            >
              <Info size={13} />
              <span>{showHelpKeys ? 'Hide Private Passwords Cheat Sheet' : 'Show All Private Brand Passwords'}</span>
            </button>

            {showHelpKeys && (
              <div style={{
                marginTop: '0.65rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.65rem',
                padding: '0.65rem 0.75rem',
                fontSize: '0.72rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.4rem'
              }}>
                <div>boAt: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>Boat@1547</strong></div>
                <div>Samsung: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>samsung@1547</strong></div>
                <div>Care Health: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>care@1547</strong></div>
                <div>Star Health: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>star@1547</strong></div>
                <div>Apple: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>Apple@1547</strong></div>
                <div>LG: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>LG@1547</strong></div>
                <div>Admin: <strong style={{ color: '#dc2626', fontFamily: 'monospace' }}>admin@1547</strong></div>
                <div>ICICI / Tata: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>[Brand]@1547</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
