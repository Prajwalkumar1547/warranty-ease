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
    'Audio',
    'Electronics',
    'Automobiles',
    'Computers',
    'Home Appliances',
    'Gaming',
    'Wearables'
  ];

  // Get unique brands from registered protections
  const registeredBrandsMap = new Map();
  protections.forEach(p => {
    if (p.brand && !registeredBrandsMap.has(p.brand.toLowerCase())) {
      const matchedData = BRAND_SUPPORT_DATA.find(b => b.name.toLowerCase() === p.brand.toLowerCase());
      registeredBrandsMap.set(p.brand.toLowerCase(), {
        name: p.brand,
        productName: p.productName || p.model || 'Registered Product',
        phone: matchedData?.phone || '1800-102-9999',
        email: matchedData?.email || `support@${p.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
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

    const matchesCategory =
      selectedCategory === 'All' ||
      brand.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Brand Support Directory ({BRAND_SUPPORT_DATA.length}+ Brands)</h1>
          <p className="page-description">Customer service contacts, live chat links, and instant AI warranty claim email generators</p>
        </div>
      </div>

      {/* Quick Support for User's Registered Products Section */}
      {registeredBrands.length > 0 && !searchTerm && selectedCategory === 'All' && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '1.15rem', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="#0066cc" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Support for Your Registered Products
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {registeredBrands.map((b) => (
              <div key={b.name} style={{ background: '#ffffff', borderRadius: '0.85rem', border: '1px solid #e2e8f0', padding: '0.85rem 1rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BrandLogoIcon brand={b.name} size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{b.name}</h3>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.productName}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <a href={`tel:${b.phone}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', textDecoration: 'none', justifyContent: 'center' }}>
                    <Phone size={12} color="#0066cc" /> Call
                  </a>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', backgroundColor: '#fff7ed', borderColor: '#ffedd5', color: '#c2410c' }} onClick={() => onOpenAiClaim(b)}>
                    <Sparkles size={12} /> AI Email
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={20} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search for any brand (e.g. Apple, Maruti, Samsung, Dell, Dyson, Sony)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="category-pills" style={{ marginBottom: '1.5rem' }}>
        {categories.map((cat) => {
          const count = cat === 'All'
            ? BRAND_SUPPORT_DATA.length
            : BRAND_SUPPORT_DATA.filter(b => b.category.toLowerCase() === cat.toLowerCase()).length;
          return (
            <button
              key={cat}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Brands Grid - 3 Column Responsive Desktop Layout */}
      {filteredBrands.length === 0 ? (
        <div className="empty-state-card" style={{ padding: '3.5rem 2rem' }}>
          <div className="empty-icon-box">
            <Headphones size={32} />
          </div>
          <h3 className="empty-title">No brand matches found</h3>
          <p className="empty-subtitle">Try searching with a different brand name or keyword.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.15rem' }}>
          {filteredBrands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onStartLiveChat={onStartLiveChat}
              onOpenAiClaim={onOpenAiClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
}

