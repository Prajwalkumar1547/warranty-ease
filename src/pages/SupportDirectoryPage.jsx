import React, { useState } from 'react';
import { Search, Headphones, Sparkles, ShieldCheck, Phone, Mail, MessageCircle } from 'lucide-react';
import { BRAND_SUPPORT_DATA } from '../data/supportDirectoryData';
import BrandCard from '../components/BrandCard';
import BrandLogoIcon from '../components/BrandLogoIcon';

export default function SupportDirectoryPage({ protections = [], onStartLiveChat, onOpenAiClaim }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Health Insurance',
    'Life & Term Insurance',
    'General & Motor Insurance',
    'Electronics',
    'Computers',
    'Audio',
    'Home Appliances',
    'Automobiles',
    'Wearables'
  ];

  const matchBrandCategory = (brandCat, targetCat) => {
    if (targetCat === 'All') return true;
    const b = (brandCat || '').toLowerCase();
    const t = targetCat.toLowerCase();
    if (t === 'health insurance') return b.includes('health');
    if (t === 'life & term insurance') return b.includes('life') || b.includes('term');
    if (t === 'general & motor insurance') return b.includes('general') || b.includes('motor') || b.includes('vehicle') || b === 'insurance';
    return b === t;
  };

  // Quick support from user's registered protections
  const registeredBrandsMap = new Map();
  protections.forEach(p => {
    if (p.brand && !registeredBrandsMap.has(p.brand.toLowerCase())) {
      const matchedData = BRAND_SUPPORT_DATA.find(b => b.name.toLowerCase().includes(p.brand.toLowerCase()));
      registeredBrandsMap.set(p.brand.toLowerCase(), {
        name: p.brand,
        productName: p.productName || p.model || 'Registered Product',
        phone: matchedData?.phone || '1800-102-9999',
        email: matchedData?.email || `support@${p.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        whatsapp: matchedData?.whatsapp || null,
        hasLiveChat: matchedData?.hasLiveChat || false,
        website: matchedData?.website || `https://www.${p.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      });
    }
  });
  const registeredBrands = Array.from(registeredBrandsMap.values());

  const filteredBrands = BRAND_SUPPORT_DATA.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.phone.includes(searchTerm) ||
      brand.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = matchBrandCategory(brand.category, selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Compact Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }}>
            <Headphones size={22} color="#2563eb" /> Support Directory
          </h1>
          <p className="page-description">
            Verified toll-free numbers, emails & WhatsApp for {BRAND_SUPPORT_DATA.length}+ brands.
          </p>
        </div>
      </div>

      {/* Quick Support for Registered Products */}
      {registeredBrands.length > 0 && !searchTerm && selectedCategory === 'All' && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '1rem',
          padding: '1rem 1.15rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <ShieldCheck size={17} color="#2563eb" />
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e40af' }}>
              Your Registered Products
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {registeredBrands.map((b) => {
              const cleanWa = b.whatsapp ? b.whatsapp.replace(/[^0-9]/g, '') : null;
              return (
                <div key={b.name} style={{
                  background: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                  padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
                  boxShadow: 'var(--shadow-sm)', minWidth: 0, flex: '1 1 200px'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BrandLogoIcon brand={b.name} size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.productName}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    <a href={`tel:${b.phone}`} style={{ width: 28, height: 28, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="Call">
                      <Phone size={13} color="#2563eb" />
                    </a>
                    {cleanWa ? (
                      <a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="WhatsApp">
                        <MessageCircle size={13} color="#16a34a" />
                      </a>
                    ) : (
                      <button onClick={() => onOpenAiClaim(b)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff7ed', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="AI Claim">
                        <Sparkles size={13} color="#c2410c" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unified Search + Filter Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.85rem',
        padding: '0.55rem 1rem', marginBottom: '1.1rem', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap'
      }}>
        <Search size={17} color="#94a3b8" style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search brand, category, phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.88rem', color: '#0f172a', background: 'transparent', minWidth: 120 }}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}
            style={{ border: 'none', background: '#f1f5f9', borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.72rem', color: '#64748b', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
            Clear
          </button>
        )}
      </div>

      {/* Category Pill Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '2px', WebkitOverflowScrolling: 'touch' }}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const count = cat === 'All' ? BRAND_SUPPORT_DATA.length : BRAND_SUPPORT_DATA.filter(b => matchBrandCategory(b.category, cat)).length;
          return (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: isActive ? '#2563eb' : '#f1f5f9',
                color: isActive ? '#fff' : '#475569',
                fontWeight: isActive ? 800 : 600, fontSize: '0.82rem',
                transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0
              }}>
              <span>{cat}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: isActive ? '#fff' : '#64748b',
                fontSize: '0.68rem', fontWeight: 700,
                padding: '0.05rem 0.38rem', borderRadius: '10px'
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {(searchTerm || selectedCategory !== 'All') && (
        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
          Showing {filteredBrands.length} result{filteredBrands.length !== 1 ? 's' : ''}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          {searchTerm ? ` for "${searchTerm}"` : ''}
        </p>
      )}

      {/* Brands Grid */}
      {filteredBrands.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon-box"><Headphones size={30} /></div>
          <h3 className="empty-title">No brand found</h3>
          <p className="empty-subtitle">Try searching with a different name or clearing filters.</p>
          <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filteredBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onStartLiveChat={onStartLiveChat} onOpenAiClaim={onOpenAiClaim} />
          ))}
        </div>
      )}
    </div>
  );
}
