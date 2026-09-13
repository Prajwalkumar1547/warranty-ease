import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, Home, Smartphone, FileText, FolderArchive, Headphones,
  Settings, Plus, FileScan, Store, MoreHorizontal, Bot, Wrench,
  ChevronDown, Tag, LogOut, User, HeartPulse, Bell, ShieldAlert,
  Building2, Users, Layers, ShieldCheck, MessageSquare, Lock, KeyRound
} from 'lucide-react';
import BrandLogoIcon from './BrandLogoIcon';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAiClaimModal,
  onOpenOcrModal,
  onOpenAgentCenter,
  onOpenGoogleAuth,
  onOpenUnifiedAuth,
  user,
  alertCount = 0,
  currentRole = 'customer',
  activeCompanyId = 'comp-boat',
  activeCompanyName = 'boAt',
  onSwitchRole
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);

  const moreRef = useRef(null);
  const userRef = useRef(null);
  const roleRef = useRef(null);

  // ─── Role-Based Navigation Items (Section 29) ───
  let primaryNavItems = [];
  let secondaryNavItems = [];

  if (currentRole === 'admin') {
    primaryNavItems = [
      { id: 'admin_dashboard', label: 'Operator Console', icon: ShieldAlert },
      { id: 'claims', label: 'All Claims', icon: FileText },
      { id: 'protections', label: 'Warranties', icon: Smartphone },
      { id: 'insurance', label: 'Insurance', icon: HeartPulse },
      { id: 'documents', label: 'Documents', icon: FolderArchive },
    ];
    secondaryNavItems = [
      { id: 'settings', label: 'Platform Settings', icon: Settings },
    ];
  } else if (currentRole === 'company') {
    primaryNavItems = [
      { id: 'company_portal', label: 'Company Portal', icon: Building2 },
      { id: 'claims', label: 'Claims Queue', icon: FileText },
      { id: 'protections', label: 'Registered Products', icon: ShieldCheck },
      { id: 'documents', label: 'Evidence Docs', icon: FolderArchive },
    ];
    secondaryNavItems = [
      { id: 'settings', label: 'Company Settings', icon: Settings },
    ];
  } else {
    // Customer navigation
    primaryNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'protections', label: 'My Warranties', icon: Smartphone },
      { id: 'insurance', label: 'Insurance', icon: HeartPulse },
      { id: 'claims', label: 'Claims', icon: FileText },
      { id: 'documents', label: 'Documents', icon: FolderArchive },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ];
    secondaryNavItems = [
      { id: 'repairs', label: 'Repairs', icon: Wrench },
      { id: 'support', label: 'Support Directory', icon: Headphones },
      { id: 'shops', label: 'Deals', icon: Tag },
    ];
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMoreMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigate = (tab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
    setShowUserMenu(false);
    setShowRoleMenu(false);
    setShowMobileSheet(false);
  };

  const handleRoleSelect = (role, companyId = null, companyName = null) => {
    setShowRoleMenu(false);
    if (role === 'customer') {
      if (onSwitchRole) {
        onSwitchRole('customer');
      }
    } else {
      if (onOpenUnifiedAuth) {
        onOpenUnifiedAuth(role, companyId);
      } else if (onSwitchRole) {
        onSwitchRole(role, companyId, companyName);
      }
    }
  };

  const isSecondaryActive = secondaryNavItems.some(i => i.id === activeTab);

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); navigate(currentRole === 'admin' ? 'admin_dashboard' : currentRole === 'company' ? 'company_portal' : 'dashboard'); }}>
            <div className="brand-icon-wrapper">
              <Shield size={20} fill="#ffffff" strokeWidth={1.5} />
            </div>
            <div className="brand-text-container">
              <span className="brand-title">WarrantyEase</span>
              <span className="brand-subtitle">
                {currentRole === 'admin' ? 'Admin Operator' : currentRole === 'company' ? 'Partner Portal' : 'Smart Protection'}
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="nav-links">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* More Dropdown */}
            {secondaryNavItems.length > 0 && (
              <div ref={moreRef} style={{ position: 'relative' }}>
                <button
                  className={`nav-item ${isSecondaryActive ? 'active' : ''}`}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                >
                  <span>More</span>
                  <ChevronDown size={13} style={{ transform: showMoreMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showMoreMenu && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.85rem',
                    padding: '0.4rem', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', zIndex: 200, minWidth: '165px'
                  }}>
                    {secondaryNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button key={item.id}
                          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                          style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.6rem' }}
                          onClick={() => navigate(item.id)}
                        >
                          <Icon size={15} /><span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right-side Action Controls */}
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

            {/* ─── Role Switcher / Unified Auth Gateway ─── */}
            <div ref={roleRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.35rem 0.75rem', borderRadius: '2rem',
                  border: currentRole === 'admin' ? '1.5px solid #f87171' : currentRole === 'company' ? '1.5px solid #818cf8' : '1.5px solid #93c5fd',
                  background: currentRole === 'admin' ? '#fef2f2' : currentRole === 'company' ? '#e0e7ff' : '#eff6ff',
                  color: currentRole === 'admin' ? '#b91c1c' : currentRole === 'company' ? '#4338ca' : '#1d4ed8',
                  fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                {currentRole === 'admin' ? (
                  <>
                    <ShieldAlert size={14} color="#dc2626" />
                    <span>Admin Operator</span>
                  </>
                ) : currentRole === 'company' ? (
                  <>
                    <div style={{ width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrandLogoIcon brand={activeCompanyName || 'boAt'} size={14} />
                    </div>
                    <span>{activeCompanyName || 'Brand'} Portal</span>
                  </>
                ) : (
                  <>
                    <User size={14} color="#2563eb" />
                    <span>Customer View</span>
                  </>
                )}
                <ChevronDown size={13} style={{ transform: showRoleMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {showRoleMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.85rem',
                  padding: '0.5rem', boxShadow: '0 12px 32px rgba(0,0,0,0.14)', zIndex: 300, minWidth: '240px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.5rem 0.2rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Portal Access:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        if (onOpenUnifiedAuth) onOpenUnifiedAuth('company');
                      }}
                      style={{
                        background: 'none', border: 'none', color: '#2563eb', fontSize: '0.7rem',
                        fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}
                    >
                      <Lock size={11} />
                      <span>Unified Login</span>
                    </button>
                  </div>

                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.55rem', fontWeight: currentRole === 'customer' ? 800 : 500 }}
                    onClick={() => handleRoleSelect('customer')}
                  >
                    <User size={14} color="#2563eb" />
                    <span>Customer View (Rahul Sharma)</span>
                  </button>

                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.55rem', fontWeight: currentRole === 'admin' ? 800 : 500 }}
                    onClick={() => handleRoleSelect('admin')}
                  >
                    <ShieldAlert size={14} color="#dc2626" />
                    <span style={{ flex: 1, textAlign: 'left' }}>Operator Admin Console</span>
                    <Lock size={12} color="#94a3b8" />
                  </button>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.35rem 0.4rem' }} />
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', padding: '0.2rem 0.5rem' }}>
                    Partner Brand Desks (Private Passkey):
                  </div>

                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.55rem', gap: '0.5rem' }}
                    onClick={() => handleRoleSelect('company', 'comp-boat', 'boAt')}
                  >
                    <BrandLogoIcon brand="boAt" size={16} />
                    <span style={{ flex: 1, textAlign: 'left' }}>boAt Service Desk</span>
                    <Lock size={12} color="#94a3b8" />
                  </button>

                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.55rem', gap: '0.5rem' }}
                    onClick={() => handleRoleSelect('company', 'comp-samsung', 'Samsung')}
                  >
                    <BrandLogoIcon brand="Samsung" size={16} />
                    <span style={{ flex: 1, textAlign: 'left' }}>Samsung Support Ops</span>
                    <Lock size={12} color="#94a3b8" />
                  </button>

                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.55rem', gap: '0.5rem' }}
                    onClick={() => handleRoleSelect('company', 'comp-carehealth', 'Care Health')}
                  >
                    <BrandLogoIcon brand="Care Health" size={16} />
                    <span style={{ flex: 1, textAlign: 'left' }}>Care Health Claims Desk</span>
                    <Lock size={12} color="#94a3b8" />
                  </button>

                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.55rem', gap: '0.5rem' }}
                    onClick={() => handleRoleSelect('company', 'comp-starhealth', 'Star Health')}
                  >
                    <BrandLogoIcon brand="Star Health" size={16} />
                    <span style={{ flex: 1, textAlign: 'left' }}>Star Health Claims Desk</span>
                    <Lock size={12} color="#94a3b8" />
                  </button>

                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.35rem 0.4rem' }} />
                  <button
                    className="nav-item"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: '0.55rem', color: '#7c3aed', fontWeight: 800, fontSize: '0.78rem' }}
                    onClick={() => {
                      setShowRoleMenu(false);
                      if (onOpenUnifiedAuth) onOpenUnifiedAuth('company');
                    }}
                  >
                    <KeyRound size={13} />
                    <span>Enter Other Brand Password...</span>
                  </button>
                </div>
              )}
            </div>

            {/* Scan Receipt */}
            <button
              className="btn btn-secondary hide-mobile"
              title="Scan Receipt / Document"
              onClick={onOpenOcrModal}
              style={{ padding: '0.38rem 0.7rem', fontSize: '0.82rem' }}
            >
              <FileScan size={15} color="#0066cc" />
              <span>Scan</span>
            </button>

            {/* Add Protection */}
            <button className="btn btn-primary" onClick={onOpenAddModal}
              style={{ padding: '0.38rem 0.8rem', fontSize: '0.82rem' }}>
              <Plus size={15} />
              <span className="hide-mobile">Add</span>
            </button>

            {/* User avatar with dropdown */}
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={user ? `${user.name} — ${user.email}` : 'Sign in'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.25rem 0.6rem 0.25rem 0.25rem',
                  borderRadius: '2rem', border: '1px solid #e2e8f0',
                  background: '#fff', cursor: 'pointer', position: 'relative'
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: currentRole === 'admin' ? '#dc2626' : currentRole === 'company' ? '#4f46e5' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} color="#fff" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                  {currentRole === 'admin' ? 'Admin' : currentRole === 'company' ? 'Brand' : (user?.name ? user.name.split(' ')[0] : 'Rahul')}
                </span>
                {alertCount > 0 && (
                  <span style={{ width: 8, height: 8, background: '#dc2626', borderRadius: '50%', position: 'absolute', top: 2, right: 2 }} />
                )}
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.85rem',
                  padding: '0.4rem', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', zIndex: 200, minWidth: '185px'
                }}>
                  <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.6rem' }}
                    onClick={() => navigate('settings')}>
                    <Settings size={15} /><span>Settings</span>
                  </button>
                  <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.6rem' }}
                    onClick={() => { setShowUserMenu(false); onOpenAgentCenter(); }}>
                    <Bot size={15} />
                    <span>AI Agents {alertCount > 0 ? `(${alertCount})` : ''}</span>
                  </button>
                  <div style={{ height: '1px', background: '#f1f5f9', margin: '0.3rem 0.4rem' }} />
                  <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '0.6rem' }}
                    onClick={() => { setShowUserMenu(false); onOpenGoogleAuth(); }}>
                    {user ? <LogOut size={15} /> : <User size={15} />}
                    <span>{user ? 'Switch Account' : 'Sign In'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
