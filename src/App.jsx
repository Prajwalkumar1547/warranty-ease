import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ProtectionsPage from './pages/ProtectionsPage';
import ClaimsPage from './pages/ClaimsPage';
import DocumentsPage from './pages/DocumentsPage';
import SupportDirectoryPage from './pages/SupportDirectoryPage';
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

import { INITIAL_PROTECTIONS } from './data/initialProtections';
import { INITIAL_CLAIMS } from './data/initialClaims';
import { checkForDuplicateProtection } from './utils/warrantyCalculator';
import { scanProtectionsAndClaims } from './utils/reminderAgents';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [protections, setProtections] = useState(() => {
    const saved = localStorage.getItem('warranty_ease_protections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse protections', e);
      }
    }
    return INITIAL_PROTECTIONS;
  });

  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('warranty_ease_claims');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse claims', e);
      }
    }
    return INITIAL_CLAIMS;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('warranty_ease_protections', JSON.stringify(protections));
  }, [protections]);

  useEffect(() => {
    localStorage.setItem('warranty_ease_claims', JSON.stringify(claims));
  }, [claims]);

  // Active Multi-Agent alerts count
  const agentAlerts = scanProtectionsAndClaims(protections, claims);

  const handleAddProtection = (newProtection) => {
    // Duplicate Protection Detection
    const duplicate = checkForDuplicateProtection(newProtection, protections);
    if (duplicate) {
      const confirmAdd = window.confirm(
        `Possible duplicate protection detected!\n\nAn existing protection for "${duplicate.brand} ${duplicate.productName || duplicate.model}" (S/N: ${duplicate.serialNumber}) is already in your inventory.\n\nClick OK to add anyway, or Cancel to view existing protection.`
      );
      if (!confirmAdd) {
        setSelectedProtectionDetail(duplicate);
        return;
      }
    }

    setProtections((prev) => [newProtection, ...prev]);
  };

  const handleDeleteProtection = (id) => {
    setProtections((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAllProtections = () => {
    setProtections([]);
    localStorage.removeItem('warranty_ease_protections');
  };

  const handleAddClaim = (newClaim) => {
    setClaims((prev) => [newClaim, ...prev]);
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
        alertCount={agentAlerts.length}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardPage
            protections={protections}
            claims={claims}
            onNavigateToProtections={() => setActiveTab('protections')}
            onOpenFileClaimModal={() => {
              setPrefilledClaimItem(null);
              setIsFileClaimModalOpen(true);
            }}
            onOpenFileClaimForItem={handleOpenFileClaimForItem}
            onSelectClaimTrack={(claim) => setSelectedClaimForTrack(claim)}
            onOpenAddModal={() => {
              setOcrPrefilledData(null);
              setIsAddModalOpen(true);
            }}
            onAddProtection={handleAddProtection}
            onOpenBusinessModal={() => setIsBusinessModalOpen(true)}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onOpenAiClaimModal={() => setIsAiClaimModalOpen(true)}
            onSelectProtectionForDetail={(prot) => setSelectedProtectionDetail(prot)}
            onOpenAgentCenter={() => setIsAgentCenterOpen(true)}
          />
        )}

        {activeTab === 'protections' && (
          <ProtectionsPage
            protections={protections}
            onOpenAddModal={() => {
              setOcrPrefilledData(null);
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

        {activeTab === 'support' && (
          <SupportDirectoryPage
            protections={protections}
            onStartLiveChat={(brand) => setActiveLiveChatBrand(brand)}
            onOpenAiClaim={handleOpenAiClaimForBrand}
          />
        )}

        {activeTab === 'shops' && (
          <ShopsPage onOpenRetailerModal={() => setIsRetailerModalOpen(true)} />
        )}

        {activeTab === 'settings' && (
          <SettingsPage protections={protections} claims={claims} />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>© 2026 WarrantyEase Smart Protection Platform. All rights reserved.</p>
      </footer>

      {/* Global Interactive Modals */}
      <AddProtectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProtection}
        onOpenOcr={() => {
          setIsAddModalOpen(false);
          setIsOcrModalOpen(true);
        }}
        prefilledData={ocrPrefilledData}
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

      {/* Autonomous Multi-Agent Command Center Modal */}
      <AgentCommandCenterModal
        isOpen={isAgentCenterOpen}
        onClose={() => setIsAgentCenterOpen(false)}
        protections={protections}
        claims={claims}
      />
    </div>
  );
}
