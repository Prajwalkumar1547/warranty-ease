import React, { useState } from 'react';
import { Tag, GraduationCap, Zap, CreditCard, ExternalLink, Star, ChevronRight, Gift, Percent } from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';

const STUDENT_DEALS = [
  { id: 1, name: 'UniDays Student Deals', brand: 'unidays', category: 'Student Hub', description: 'Exclusive student discounts on Apple, Samsung, Lenovo, Microsoft, Sony, Adidas, Nike & 800+ brands.', discount: 'Up to 50% OFF', badge: 'Verified Student', color: '#2563eb', url: 'https://www.myunidays.com', tags: ['Electronics', 'Fashion', 'Software'] },
  { id: 2, name: 'GitHub Student Pack', brand: 'github', category: 'Developer Hub', description: 'Free GitHub Pro, JetBrains IDEs, Azure $100 credits, Canva Pro & 100+ developer tools.', discount: 'Completely FREE', badge: 'Student Email', color: '#0f172a', url: 'https://education.github.com/pack', tags: ['Dev Tools', 'Cloud Credits'] },
  { id: 3, name: 'Apple Education Store', brand: 'apple', category: 'Electronics', description: 'MacBook, iPad, iPhone, AirPods at special education pricing with free AirPods offer.', discount: 'Up to ₹10,000 OFF', badge: 'Student & Teacher', color: '#1d1d1f', url: 'https://www.apple.com/in/shop/education-individual', tags: ['MacBook', 'iPad', 'iPhone'] },
  { id: 4, name: 'StudentBeans', brand: 'studentbeans', category: 'Student Hub', description: 'Student discounts on Dell, HP, Adobe, Spotify, Coursera, and thousands of retail stores.', discount: 'Up to 40% OFF', badge: 'Student ID Required', color: '#7c3aed', url: 'https://www.studentbeans.com', tags: ['Software', 'Electronics', 'Streaming'] },
  { id: 5, name: 'Microsoft Student', brand: 'microsoft', category: 'Software', description: 'Microsoft 365, Surface laptops, Xbox Game Pass at exclusive student pricing.', discount: '10% to 60% OFF', badge: '.edu Email', color: '#0078d4', url: 'https://www.microsoft.com/en-in/education/students', tags: ['Office 365', 'Surface', 'Xbox'] },
  { id: 6, name: 'Spotify Student', brand: 'spotify', category: 'Streaming', description: 'Spotify Premium at half price for verified students. Auto-verifies via SheerID.', discount: '50% OFF Premium', badge: 'SheerID Verified', color: '#1db954', url: 'https://www.spotify.com/in-en/student/', tags: ['Music', 'Podcasts'] },
  { id: 7, name: 'YouTube Premium Student', brand: 'youtube', category: 'Streaming', description: 'YouTube Premium ad-free + YouTube Music at student pricing.', discount: '₹79/month', badge: 'Student Plan', color: '#ff0000', url: 'https://www.youtube.com/premium/student', tags: ['Video', 'Music'] },
  { id: 8, name: 'Amazon Prime Student', brand: 'amazon', category: 'Shopping', description: 'Amazon Prime at 50% discount for students — free delivery, Prime Video, Prime Music.', discount: '50% OFF Prime', badge: 'Student ID', color: '#ff9900', url: 'https://www.amazon.in/prime/student', tags: ['Delivery', 'Prime Video'] },
  { id: 9, name: 'Lenovo Student Deals', brand: 'lenovo', category: 'Electronics', description: 'ThinkPad, IdeaPad, Legion laptops and accessories at exclusive student pricing.', discount: 'Up to 30% OFF', badge: 'Student ID', color: '#e1251b', url: 'https://www.lenovo.com/in/en/studentoffer', tags: ['Laptops', 'Tablets'] },
  { id: 10, name: 'Discord Nitro (Student)', brand: 'discord', category: 'Gaming', description: 'Discord Nitro at student pricing through GitHub Student Developer Pack.', discount: '40% OFF Nitro', badge: 'GitHub Student', color: '#5865f2', url: 'https://discord.com/nitro', tags: ['Gaming', 'Community'] },
];

const ELECTRONICS_DEALS = [
  { id: 1, brand: 'Samsung', model: 'Galaxy S24 FE', category: 'Smartphones', originalPrice: '₹54,999', dealPrice: '₹42,999', discount: '22% OFF', rating: 4.7, reviews: '12.4K', badge: 'Exchange Offer Available', color: '#1a73e8', url: 'https://www.flipkart.com', store: 'Flipkart' },
  { id: 2, brand: 'Apple', model: 'MacBook Air M3 (15")', category: 'Laptops', originalPrice: '₹1,34,900', dealPrice: '₹1,22,990', discount: '9% OFF', rating: 4.9, reviews: '8.2K', badge: 'EMI from ₹10,250/mo', color: '#1d1d1f', url: 'https://www.amazon.in', store: 'Amazon' },
  { id: 3, brand: 'Sony', model: 'WH-1000XM5 Headphones', category: 'Audio', originalPrice: '₹29,990', dealPrice: '₹22,990', discount: '23% OFF', rating: 4.8, reviews: '19.1K', badge: 'All-time low price', color: '#0a0a0a', url: 'https://www.amazon.in', store: 'Amazon' },
  { id: 4, brand: 'OnePlus', model: 'Nord CE 4 Lite 5G', category: 'Smartphones', originalPrice: '₹20,999', dealPrice: '₹16,999', discount: '19% OFF', rating: 4.5, reviews: '5.3K', badge: 'Bank Offer: Extra 10% OFF', color: '#eb0029', url: 'https://www.flipkart.com', store: 'Flipkart' },
  { id: 5, brand: 'Logitech', model: 'MX Master 3S Mouse', category: 'Peripherals', originalPrice: '₹8,995', dealPrice: '₹6,995', discount: '22% OFF', rating: 4.8, reviews: '7.9K', badge: 'Free Delivery', color: '#005bac', url: 'https://www.amazon.in', store: 'Amazon' },
  { id: 6, brand: 'Samsung', model: '65" QLED 4K Smart TV', category: 'TVs', originalPrice: '₹1,19,999', dealPrice: '₹89,990', discount: '25% OFF', rating: 4.6, reviews: '3.1K', badge: 'No-cost EMI Available', color: '#1a73e8', url: 'https://www.vijaysales.com', store: 'Vijay Sales' },
  { id: 7, brand: 'Dyson', model: 'V15 Detect Vacuum', category: 'Appliances', originalPrice: '₹69,900', dealPrice: '₹54,900', discount: '21% OFF', rating: 4.7, reviews: '2.3K', badge: 'Certified Refurbished Available', color: '#b5006e', url: 'https://www.amazon.in', store: 'Amazon' },
  { id: 8, brand: 'Apple', model: 'iPad Air M2 (11")', category: 'Tablets', originalPrice: '₹74,900', dealPrice: '₹64,900', discount: '13% OFF', rating: 4.9, reviews: '4.4K', badge: 'Education Price Available', color: '#1d1d1f', url: 'https://www.amazon.in', store: 'Amazon' },
];

const CASHBACK_OFFERS = [
  { id: 1, name: 'HDFC SmartBuy', brand: 'amazon', type: 'Credit / Debit Card', offer: '10% instant cashback on electronics (up to ₹2,500 per txn)', validOn: 'Amazon, Flipkart, Croma, Vijay Sales', color: '#003087', url: 'https://www.amazon.in/gp/cobrandcard/marketing' },
  { id: 2, name: 'SBI SimplyCLICK', brand: 'flipkart', type: 'Credit Card', offer: '10X reward points on Amazon + Flipkart purchases', validOn: 'Amazon, Flipkart, Myntra, Swiggy', color: '#22286b', url: 'https://www.sbi.co.in/simplyCLICK' },
  { id: 3, name: 'Amazon Pay ICICI', brand: 'amazon', type: 'Credit Card', offer: '5% unlimited cashback on Amazon + 1% everywhere else', validOn: 'Amazon.in', color: '#ff9900', url: 'https://www.amazon.in/amazonpay/icici-credit-card' },
  { id: 4, name: 'PhonePe SmartBuy', brand: 'vijaysales', type: 'UPI Cashback', offer: '5-20% cashback on electronics via PhonePe Smart Deals', validOn: 'Vijay Sales, Croma, Reliance Digital', color: '#7b2cf8', url: 'https://www.phonepe.com/en/smartbuys.html' },
  { id: 5, name: 'Paytm Cashback', brand: 'croma', type: 'Paytm Wallet', offer: 'Flat ₹200 cashback on electronics purchases above ₹5,000', validOn: 'Paytm Mall, partner stores', color: '#00baf2', url: 'https://paytm.com/offers' },
  { id: 6, name: 'Axis Bank MyZone', brand: 'flipkart', type: 'Credit Card', offer: '1.5% cashback online + 10X Edge Points on Flipkart', validOn: 'Flipkart, Myntra, Nykaa', color: '#97040c', url: 'https://www.axisbank.com/retail/cards/credit-card/myzone-credit-card' },
];

const TABS = [
  { id: 'student', label: 'Student Deals', icon: GraduationCap, count: STUDENT_DEALS.length },
  { id: 'electronics', label: 'Best Electronics Deals', icon: Zap, count: ELECTRONICS_DEALS.length },
  { id: 'cashback', label: 'Cashback & Cards', icon: CreditCard, count: CASHBACK_OFFERS.length },
];

export default function DealsPage() {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }}>
            <Tag size={22} color="#ea580c" /> Deals & Discounts
          </h1>
          <p className="page-description">Best student discounts, electronics deals, and cashback offers to maximise savings on purchases.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.1rem',
                borderRadius: '0.65rem',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#2563eb' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}>
              <Icon size={16} />{tab.label}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: isActive ? '#fff' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '20px'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 'student' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)', borderRadius: '1.25rem', padding: '1.5rem 2rem', marginBottom: '2rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <GraduationCap size={28} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>Student & Education Offers</h2>
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.92rem', margin: 0 }}>{STUDENT_DEALS.length} student programs — verify student status to unlock instantly.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
            {STUDENT_DEALS.map((deal) => (
              <div key={deal.id} style={{ background: '#fff', borderRadius: '1.15rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: '4px', background: deal.color }} />
                <div style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: 44, height: 44, background: '#f8fafc', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        <BrandLogoIcon brand={deal.brand} size={28} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{deal.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{deal.category}</div>
                      </div>
                    </div>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>{deal.badge}</span>
                  </div>
                  <p style={{ fontSize: '0.83rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.5 }}>{deal.description}</p>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                    {deal.tags.map((tag) => (<span key={tag} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '0.35rem', fontWeight: 600 }}>{tag}</span>))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 900, fontSize: '1rem', color: deal.color }}>{deal.discount}</span>
                    <a href={deal.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: deal.color, color: '#fff', padding: '0.4rem 0.85rem', borderRadius: '0.6rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>Get Deal <ExternalLink size={12} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'electronics' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.5rem 2rem', marginBottom: '2rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Zap size={28} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>Best Electronics & Gadget Deals</h2>
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.92rem', margin: 0 }}>Curated deals on products with full manufacturer warranty — scan & add to WarrantyEase after buy.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {ELECTRONICS_DEALS.map((deal) => (
              <div key={deal.id} style={{ background: '#fff', borderRadius: '1.15rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: '4px', background: `linear-gradient(90deg, ${deal.color}, #2563eb)` }} />
                <div style={{ padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 42, height: 42, background: '#f8fafc', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        <BrandLogoIcon brand={deal.brand} size={28} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{deal.category}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{deal.brand} {deal.model}</div>
                      </div>
                    </div>
                    <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>{deal.discount}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#ea580c', fontWeight: 700, marginBottom: '0.65rem' }}>
                    <Star size={13} fill="#ea580c" color="#ea580c" />
                    <span>{deal.rating}</span>
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>({deal.reviews} reviews)</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>{deal.dealPrice}</span>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through' }}>{deal.originalPrice}</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', padding: '0.3rem 0.65rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>✓ {deal.badge}</div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>on {deal.store}</span>
                    <a href={deal.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#2563eb', color: '#fff', padding: '0.4rem 0.85rem', borderRadius: '0.6rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>View Deal <ChevronRight size={12} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'cashback' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #0369a1 100%)', borderRadius: '1.25rem', padding: '1.5rem 2rem', marginBottom: '2rem', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Percent size={28} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0 }}>Bank Cashback & Card Offers</h2>
            </div>
            <p style={{ opacity: 0.85, fontSize: '0.92rem', margin: 0 }}>Combine card offers with sale prices for extra savings on tech & appliances.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {CASHBACK_OFFERS.map((offer) => (
              <div key={offer.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ width: 52, height: 52, background: offer.color, borderRadius: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BrandLogoIcon brand={offer.brand} size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{offer.name}</span>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '0.3rem', fontWeight: 600 }}>{offer.type}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, margin: '0 0 0.2rem 0' }}>{offer.offer}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Valid on: {offer.validOn}</p>
                  </div>
                </div>
                <a href={offer.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: offer.color, color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.65rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <Gift size={14} />Get Offer <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
