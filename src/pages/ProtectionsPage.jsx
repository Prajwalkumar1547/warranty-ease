import React, { useState } from 'react';
import { Search, Filter, Plus, ShieldCheck, FileScan, Trash2, Building2 } from 'lucide-react';
import WarrantyCard from '../components/WarrantyCard';

export default function ProtectionsPage({
  protections,
  onOpenAddModal,
  onOpenBusinessModal,
  onOpenOcrModal,
  onDeleteProtection,
  onClearAllProtections,
  onOpenFileClaimForItem,
  onSelectProtectionForDetail
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredProtections = protections.filter((item) => {
    const matchesSearch =
      (item.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Status' || (item.status || '').toLowerCase() === statusFilter.toLowerCase();

    let matchesType = true;
    if (typeFilter === 'Warranties') {
      matchesType = item.protectionType === 'Warranty' || !item.protectionType;
    } else if (typeFilter === 'Insurance') {
      matchesType = item.protectionType === 'Insurance' || item.protectionType === 'Insurance Policy' || (item.protectionType || '').toLowerCase().includes('insurance');
    } else if (typeFilter !== 'All') {
      matchesType = (item.category || '').toLowerCase().includes(typeFilter.toLowerCase());
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  const warrantyCount = protections.filter(p => p.protectionType === 'Warranty' || !p.protectionType).length;
  const insuranceCount = protections.filter(p => p.protectionType === 'Insurance' || p.protectionType === 'Insurance Policy' || (p.protectionType || '').toLowerCase().includes('insurance')).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Protections ({protections.length})</h1>
          <p className="page-description">Manage all your personal warranties, insurance policies, and business assets</p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {protections.length > 0 && (
            <button className="btn btn-secondary" style={{ color: '#ef4444' }} onClick={onClearAllProtections}>
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          )}
          <button className="btn btn-secondary" onClick={onOpenBusinessModal}>
            <Building2 size={16} color="#0f172a" />
            <span>+ Business Asset</span>
          </button>
          <button className="btn btn-secondary" onClick={onOpenOcrModal}>
            <FileScan size={16} color="#2563eb" />
            <span>Scan Receipt (OCR)</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Protection</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills" style={{ marginBottom: '1.25rem' }}>
        {[
          { id: 'All', label: `All Protections (${protections.length})` },
          { id: 'Warranties', label: `Warranties (${warrantyCount})` },
          { id: 'Insurance', label: `Insurance Policies (${insuranceCount})` },
          { id: 'Electronics', label: 'Electronics' },
          { id: 'Vehicle', label: 'Vehicle' },
          { id: 'Health', label: 'Health' },
          { id: 'Home Appliances', label: 'Appliances' },
          { id: 'Computers', label: 'Computers' }
        ].map((cat) => (
          <button
            key={cat.id}
            className={`pill-btn ${typeFilter === cat.id ? 'active' : ''}`}
            onClick={() => setTypeFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search and Filter bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by brand, product name, or serial number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={18} color="#64748b" />
          <select
            className="form-control"
            style={{ width: 'auto', border: 'none', background: 'transparent', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Devices Grid */}
      {filteredProtections.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '3.5rem 2rem' }}>
          <div className="empty-icon-box">
            <ShieldCheck size={36} color="#2563eb" />
          </div>
          <h3 className="empty-title">No Protections Found</h3>
          <p className="empty-subtitle">
            Scan a receipt with AI OCR, or add a warranty or insurance policy to track active coverage and expiry dates.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onOpenBusinessModal}>
              <Building2 size={16} />
              <span>Register Business Assets</span>
            </button>
            <button className="btn btn-secondary" onClick={onOpenOcrModal}>
              <FileScan size={16} color="#2563eb" />
              <span>Scan Receipt with OCR</span>
            </button>
            <button className="btn btn-primary" onClick={onOpenAddModal}>
              <Plus size={16} />
              <span>Add Protection</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="protections-grid">
          {filteredProtections.map((item) => (
            <div key={item.id} onClick={() => onSelectProtectionForDetail && onSelectProtectionForDetail(item)} style={{ cursor: 'pointer' }}>
              <WarrantyCard
                item={item}
                onDelete={onDeleteProtection}
                onFileClaimForItem={onOpenFileClaimForItem}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
