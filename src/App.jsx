import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ProtectionsPage from './pages/ProtectionsPage';
import InsurancePage from './pages/InsurancePage';
import ClaimsPage from './pages/ClaimsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CompanyPortalPage from './pages/CompanyPortalPage';
import NotificationsPage from './pages/NotificationsPage';
import DocumentsPage from './pages/DocumentsPage';
import SupportDirectoryPage from './pages/SupportDirectoryPage';
import RepairsPage from './pages/RepairsPage';
import ShopsPage from './pages/ShopsPage';
import SettingsPage from './pages/SettingsPage';

import AddProtectionModal from './components/AddProtectionModal';
import AddBusinessProtectionModal from './components/AddBusinessProtectionModal';
import FileClaimModal from './components/FileClaimModal';
import DirectChatModal from './components/DirectChatModal';
import OCRScannerModal from './components/OCRScannerModal';
import AiClaimWriterModal from './components/AiClaimWriterModal';
import ClaimTrackerModal from './components/ClaimTrackerModal';
import ProtectionDetailModal from './components/ProtectionDetailModal';
import WarrantyEmailModal from './components/WarrantyEmailModal';
import RetailerInvoiceLinkModal from './components/RetailerInvoiceLinkModal';
import AgentCommandCenterModal from './components/AgentCommandCenterModal';
import GoogleAuthModal from './components/GoogleAuthModal';
import UnifiedAuthModal from './components/UnifiedAuthModal';

import { checkForDuplicateProtection } from './utils/warrantyCalculator';
import { scanProtectionsAndClaims } from './utils/reminderAgents';
import { getStoredGoogleUser } from './utils/googleAuth';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('customer'); // 'customer' | 'admin' | 'company'
  const [activeCompanyId, setActiveCompanyId] = useState('comp-boat');
  const [activeCompanyName, setActiveCompanyName] = useState('boAt');

  const [protections, setProtections] = useState([]);
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Unified Role & Brand Authentication Modal
  const [isUnifiedAuthOpen, setIsUnifiedAuthOpen] = useState(false);
  const [unifiedAuthTab, setUnifiedAuthTab] = useState('company');
  const [unifiedAuthBrandId, setUnifiedAuthBrandId] = useState('comp-boat');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState('Warranty');
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [isFileClaimModalOpen, setIsFileClaimModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isAiClaimModalOpen, setIsAiClaimModalOpen] = useState(false);
  const [isAgentCenterOpen, setIsAgentCenterOpen] = useState(false);

  const [activeLiveChatBrand, setActiveLiveChatBrand] = useState(null);
  const [aiClaimBrand, setAiClaimBrand] = useState(null);
  const [ocrPrefilledData, setOcrPrefilledData] = useState(null);
  const [selectedClaimForTrack, setSelectedClaimForTrack] = useState(null);
  const [selectedProtectionDetail, setSelectedProtectionDetail] = useState(null);
  const [prefilledClaimItem, setPrefilledClaimItem] = useState(null);
  const [isWarrantyEmailOpen, setIsWarrantyEmailOpen] = useState(false);
  const [warrantyEmailBrand, setWarrantyEmailBrand] = useState(null);
  const [warrantyEmailClaim, setWarrantyEmailClaim] = useState(null);
  const [isRetailerModalOpen, setIsRetailerModalOpen] = useState(false);
  const [user, setUser] = useState(getStoredGoogleUser);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Initial Load from API / SQLite Database
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [loadedProts, loadedClaims, u] = await Promise.all([
          api.getProtections(),
          api.getClaims(),
          api.getCurrentUser(),
        ]);
        if (loadedProts) setProtections(loadedProts);
        if (loadedClaims) setClaims(loadedClaims);
        if (u?.role) {
          setCurrentRole(u.role);
          if (u.role === 'admin') setActiveTab('admin_dashboard');
          else if (u.role === 'company') setActiveTab('company_portal');
        }
      } catch (err) {
        console.warn('Backend offline, using client persistence:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Multi-Agent alerts count
  const agentAlerts = scanProtectionsAndClaims(protections, claims);

  const handleSwitchRole = async (newRole, companyId = null, companyName = null) => {
    setCurrentRole(newRole);
    if (companyId) setActiveCompanyId(companyId);
    if (companyName) setActiveCompanyName(companyName);

    await api.switchRole(newRole, companyId, companyName);

    if (newRole === 'admin') {
      setActiveTab('admin_dashboard');
    } else if (newRole === 'company') {
      setActiveTab('company_portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleAddProtection = async (newProtection) => {
    // Duplicate Protection Detection
    const duplicate = checkForDuplicateProtection(newProtection, protections);
    if (duplicate) {
      const confirmAdd = window.confirm(
        `Possible duplicate protection detected!\n\nAn existing protection for "${duplicate.brand} ${duplicate.productName || duplicate.model}" is already in your inventory.\n\nClick OK to add anyway, or Cancel to view existing protection.`
      );
      if (!confirmAdd) {
        setSelectedProtectionDetail(duplicate);
        return;
      }
    }

    setProtections((prev) => [newProtection, ...prev]);
    await api.addProtection(newProtection);
  };

  const handleDeleteProtection = async (id) => {
    setProtections((prev) => prev.filter((p) => p.id !== id));
    await api.deleteProtection(id);
  };

  const handleClearAllProtections = () => {
    setProtections([]);
    localStorage.removeItem('warranty_ease_protections');
  };

  const handleAddClaim = async (newClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
    await api.createClaim(newClaim);
  };

  const handleDeleteClaim = (claimId) => {
    if (window.confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      setClaims((prev) => prev.filter((c) => c.id !== claimId));
      if (selectedClaimForTrack && selectedClaimForTrack.id === claimId) {
        setSelectedClaimForTrack(null);
      }
    }
  };

  const handleOpenFileClaimForItem = (item) => {
    setPrefilledClaimItem(item);
    setIsFileClaimModalOpen(true);
  };

  const handleApplyExtractedData = (extracted) => {
    setOcrPrefilledData(extracted);
    setIsAddModalOpen(true);
  };

  const handleOpenAiClaimForBrand = (brand) => {
    setAiClaimBrand(brand);
    setIsAiClaimModalOpen(true);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setOcrPrefilledData(null);
          setAddModalInitialType('Warranty');
          setIsAddModalOpen(true);
        }}
        onOpenFileClaimModal={() => {
          setPrefilledClaimItem(null);
          setIsFileClaimModalOpen(true);
        }}
        onOpenAiClaimModal={() => {
          setAiClaimBrand(null);
          setIsAiClaimModalOpen(true);
        }}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenAgentCenter={() => setIsAgentCenterOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
        onOpenUnifiedAuth={(tab = 'company', brandId = 'comp-boat') => {
          setUnifiedAuthTab(tab);
          if (brandId) setUnifiedAuthBrandId(brandId);
          setIsUnifiedAuthOpen(true);
        }}
        user={user}
        alertCount={agentAlerts.length}
        currentRole={currentRole}
        activeCompanyId={activeCompanyId}
        activeCompanyName={activeCompanyName}
        onSwitchRole={handleSwitchRole}
      />

      <main className="main-content">
        {/* Customer Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardPage
            protections={protections}
            claims={claims}
            onNavigateToProtections={() => setActiveTab('protections')}
            onNavigateToInsurance={() => setActiveTab('insurance')}
            onNavigateToClaims={() => setActiveTab('claims')}
            onOpenFileClaimModal={() => {
              setPrefilledClaimItem(null);
              setIsFileClaimModalOpen(true);
            }}
            onOpenFileClaimForItem={handleOpenFileClaimForItem}
            onSelectClaimTrack={(claim) => setSelectedClaimForTrack(claim)}
            onOpenAddWarrantyModal={() => {
              setOcrPrefilledData(null);
              setAddModalInitialType('Warranty');
              setIsAddModalOpen(true);
            }}
            onOpenAddInsuranceModal={() => {
              setOcrPrefilledData(null);
              setAddModalInitialType('Insurance');
              setIsAddModalOpen(true);
            }}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onSelectProtectionForDetail={(prot) => setSelectedProtectionDetail(prot)}
            user={user}
          />
        )}

        {/* Operator Admin Dashboard */}
        {activeTab === 'admin_dashboard' && (
          <AdminDashboardPage />
        )}

        {/* Partner Company Portal */}
        {activeTab === 'company_portal' && (
          <CompanyPortalPage
            activeCompanyId={activeCompanyId}
            onOpenUnifiedAuth={(tab = 'company') => {
              setUnifiedAuthTab(tab);
              setIsUnifiedAuthOpen(true);
            }}
          />
        )}

        {/* Warranties Page */}
        {activeTab === 'protections' && (
          <ProtectionsPage
            protections={protections.filter(p => p.protectionType !== 'Insurance')}
            onOpenAddModal={() => {
              setOcrPrefilledData(null);
              setAddModalInitialType('Warranty');
              setIsAddModalOpen(true);
            }}
            onOpenBusinessModal={() => setIsBusinessModalOpen(true)}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onDeleteProtection={handleDeleteProtection}
            onClearAllProtections={handleClearAllProtections}
            onOpenFileClaimForItem={handleOpenFileClaimForItem}
            onSelectProtectionForDetail={(prot) => setSelectedProtectionDetail(prot)}
          />
        )}

        {/* Dedicated Insurance Section (Section 11) */}
        {activeTab === 'insurance' && (
          <InsurancePage
            protections={protections}
            onOpenAddInsuranceModal={() => {
              setOcrPrefilledData(null);
              setAddModalInitialType('Insurance');
              setIsAddModalOpen(true);
            }}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onOpenFileClaimForItem={handleOpenFileClaimForItem}
            onSelectProtectionForDetail={(prot) => setSelectedProtectionDetail(prot)}
            onDeleteProtection={handleDeleteProtection}
          />
        )}

        {/* Claims Page */}
        {activeTab === 'claims' && (
          <ClaimsPage
            claims={claims}
            onOpenFileClaimModal={() => {
              setPrefilledClaimItem(null);
              setIsFileClaimModalOpen(true);
            }}
            onSelectClaimTrack={(claim) => setSelectedClaimForTrack(claim)}
            onDeleteClaim={handleDeleteClaim}
          />
        )}

        {/* In-App Notifications Page */}
        {activeTab === 'notifications' && (
          <NotificationsPage
            onNavigateToWarranties={() => setActiveTab('protections')}
            onNavigateToClaims={() => setActiveTab('claims')}
          />
        )}

        {/* Documents Vault */}
        {activeTab === 'documents' && (
          <DocumentsPage
            protections={protections}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onOpenAddModal={() => {
              setOcrPrefilledData(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* Support Directory */}
        {activeTab === 'support' && (
          <SupportDirectoryPage
            protections={protections}
            onStartLiveChat={(brand) => setActiveLiveChatBrand(brand)}
            onOpenAiClaim={handleOpenAiClaimForBrand}
          />
        )}

        {/* Repairs */}
        {activeTab === 'repairs' && (
          <RepairsPage />
        )}

        {/* Shops & Deals */}
        {activeTab === 'shops' && (
          <ShopsPage onOpenRetailerModal={() => setIsRetailerModalOpen(true)} />
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <SettingsPage
            protections={protections}
            claims={claims}
            user={user}
            onOpenGoogleAuth={() => setIsGoogleModalOpen(true)}
          />
        )}
      </main>

      {/* Global Interactive Modals */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        user={user}
        onUserChange={(newUser) => setUser(newUser)}
      />

      <AddProtectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProtection}
        onOpenOcr={() => {
          setIsAddModalOpen(false);
          setIsOcrModalOpen(true);
        }}
        prefilledData={ocrPrefilledData}
        initialProtectionType={addModalInitialType}
      />

      <AddBusinessProtectionModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        onAddBusinessProtection={handleAddProtection}
      />

      <FileClaimModal
        isOpen={isFileClaimModalOpen}
        onClose={() => setIsFileClaimModalOpen(false)}
        protections={protections}
        prefilledItem={prefilledClaimItem}
        onAddClaim={handleAddClaim}
        onTrackClaim={(claim) => {
          setSelectedClaimForTrack(claim);
          setActiveTab('claims');
        }}
      />

      <DirectChatModal
        brand={activeLiveChatBrand}
        onClose={() => setActiveLiveChatBrand(null)}
      />

      <OCRScannerModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onAddProtectionDirect={handleAddProtection}
        onApplyExtractedData={handleApplyExtractedData}
      />

      <AiClaimWriterModal
        isOpen={isAiClaimModalOpen}
        onClose={() => setIsAiClaimModalOpen(false)}
        protections={protections}
        initialBrand={aiClaimBrand}
        onAddClaim={handleAddClaim}
      />

      <ClaimTrackerModal
        claim={selectedClaimForTrack}
        onClose={() => setSelectedClaimForTrack(null)}
        onDeleteClaim={handleDeleteClaim}
      />

      <ProtectionDetailModal
        protection={selectedProtectionDetail}
        onClose={() => setSelectedProtectionDetail(null)}
        onFileClaimForItem={handleOpenFileClaimForItem}
      />

      <WarrantyEmailModal
        isOpen={isWarrantyEmailOpen}
        onClose={() => setIsWarrantyEmailOpen(false)}
        brand={warrantyEmailBrand}
        claim={warrantyEmailClaim}
      />

      <RetailerInvoiceLinkModal
        isOpen={isRetailerModalOpen}
        onClose={() => setIsRetailerModalOpen(false)}
        onImportOrder={(order) => {
          handleAddProtection(order);
          setIsRetailerModalOpen(false);
        }}
      />

      <AgentCommandCenterModal
        isOpen={isAgentCenterOpen}
        onClose={() => setIsAgentCenterOpen(false)}
        protections={protections}
        claims={claims}
      />

      <UnifiedAuthModal
        isOpen={isUnifiedAuthOpen}
        onClose={() => setIsUnifiedAuthOpen(false)}
        initialTab={unifiedAuthTab}
        preselectedBrandId={unifiedAuthBrandId}
        onLoginSuccess={(role, companyId, companyName) => {
          handleSwitchRole(role, companyId, companyName);
        }}
      />
    </div>
  );
}
