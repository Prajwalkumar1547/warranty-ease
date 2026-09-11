import React, { useState } from 'react';
import { Shield, Home, Smartphone, FileText, FolderArchive, Headphones, Settings, Plus, Sparkles, FileScan, Store, MoreHorizontal, Bot } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAiClaimModal,
  onOpenOcrModal,
  onOpenAgentCenter,
  alertCount = 0
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'protections', label: 'Protections', icon: Smartphone },
    { id: 'claims', label: 'Claims', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FolderArchive },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'shops', label: 'Deals', icon: Store },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
          <div className="brand-icon-wrapper">
            <Shield size={22} fill="#ffffff" strokeWidth={1.5} />
          </div>
          <div className="brand-text-container">
            <span className="brand-title">WarrantyEase</span>
            <span className="brand-subtitle">Smart Protection Platform</span>
          </div>
        </a>

        <nav className="nav-links">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { setActiveTab(item.id); setShowMoreMenu(false); }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ position: 'relative' }}>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreHorizontal size={17} />
              <span>More</span>
            </button>
            {showMoreMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '0.75rem', padding: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 200, minWidth: '150px' }}>
                <button
                  className="nav-item"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                  onClick={() => { setActiveTab('settings'); setShowMoreMenu(false); }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {/* AI Reminder Agents Quick Center Button */}
          <button
            className="btn btn-secondary"
            title="Open AI Reminder Agents (Email & WhatsApp)"
            onClick={onOpenAgentCenter}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Bot size={16} color="#0066cc" />
            <span className="hide-mobile">AI Agents</span>
            {alertCount > 0 && (
              <span style={{
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 900,
                padding: '0.1rem 0.35rem',
                borderRadius: '10px',
                marginLeft: '0.1rem'
              }}>
                {alertCount}
              </span>
            )}
          </button>

          <button className="btn btn-secondary" title="AI Document & Receipt Scanner" onClick={onOpenOcrModal}>
            <FileScan size={15} color="#0066cc" />
            <span className="hide-mobile">Scan Receipt</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={15} />
            <span>+ Add Protection</span>
          </button>
        </div>
      </div>
    </header>
  );
}
