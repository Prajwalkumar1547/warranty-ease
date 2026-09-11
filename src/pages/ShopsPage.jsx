import React, { useState } from 'react';
import { GraduationCap, Zap, ArrowLeftRight, ExternalLink, Star, ChevronRight, MapPin, Phone, ShieldCheck, Navigation, Search } from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';

const STUDENT_DEALS = [
  { id: 1, name: 'UniDays', brand: 'unidays', badge: 'Verified Student', discount: 'Up to 50% OFF', description: 'Apple, Samsung, Lenovo, Microsoft, Sony, Nike, Adidas & 800+ brands.', color: '#2563eb', url: 'https://www.myunidays.com', tags: ['Electronics', 'Fashion', 'Software'] },
  { id: 2, name: 'GitHub Student Developer Pack', brand: 'github', badge: 'Completely FREE', discount: '100+ Free Tools', description: 'GitHub Pro, JetBrains IDEs, Azure $100 credits, Canva Pro, Namecheap domains & 100+ premium developer tools.', color: '#0f172a', url: 'https://education.github.com/pack', tags: ['Dev Tools', 'Cloud Credits', 'Design'] },
  { id: 3, name: 'Apple Education Store', brand: 'apple', badge: 'Student & Teacher', discount: 'Up to ₹10,000 OFF', description: 'MacBook, iPad, iPhone, AirPods at special education pricing. Free AirPods during back-to-school season.', color: '#1d1d1f', url: 'https://www.apple.com/in/shop/education-individual', tags: ['MacBook', 'iPad', 'iPhone'] },
  { id: 4, name: 'StudentBeans', brand: 'studentbeans', badge: 'Student ID Required', discount: 'Up to 40% OFF', description: 'Dell, HP, Adobe, Spotify, Coursera and thousands of retail & online stores.', color: '#7c3aed', url: 'https://www.studentbeans.com', tags: ['Software', 'Electronics', 'Streaming'] },
  { id: 5, name: 'Microsoft Student', brand: 'microsoft', badge: '.edu Email', discount: '10% to 60% OFF', description: 'Microsoft 365, Surface laptops, Xbox Game Pass at exclusive student pricing.', color: '#0078d4', url: 'https://www.microsoft.com/en-in/education/students', tags: ['Office 365', 'Surface', 'Xbox'] },
  { id: 6, name: 'Amazon Prime Student', brand: 'amazon', badge: 'Student ID', discount: '50% OFF Prime', description: 'Free delivery, Prime Video, Prime Music & exclusive early access deals at 50% student discount.', color: '#ff9900', url: 'https://www.amazon.in/prime/student', tags: ['Delivery', 'Prime Video'] },
  { id: 7, name: 'Spotify Student', brand: 'spotify', badge: 'SheerID Verified', discount: '50% OFF Premium', description: 'Spotify Premium at half price for verified students. Auto-verifies via SheerID.', color: '#1db954', url: 'https://www.spotify.com/in-en/student/', tags: ['Music', 'Podcasts'] },
  { id: 8, name: 'YouTube Premium Student', brand: 'youtube', badge: 'Student Plan', discount: '₹79/month', description: 'YouTube Premium ad-free + YouTube Music at student pricing in India.', color: '#ff0000', url: 'https://www.youtube.com/premium/student', tags: ['Video', 'Ad-free'] },
  { id: 9, name: 'Lenovo Student Deals', brand: 'lenovo', badge: 'Student ID', discount: 'Up to 30% OFF', description: 'ThinkPad, IdeaPad, Legion laptops at exclusive student & alumni discount pricing.', color: '#e1251b', url: 'https://www.lenovo.com/in/en/studentoffer', tags: ['Laptops', 'Tablets'] },
  { id: 10, name: 'Discord Nitro (Student)', brand: 'discord', badge: 'GitHub Student', discount: '40% OFF Nitro', description: 'Discord Nitro via GitHub Student Developer Pack or verified student programs.', color: '#5865f2', url: 'https://discord.com/nitro', tags: ['Gaming', 'Community'] },
  { id: 11, name: 'Notion for Students', brand: 'notion', badge: 'Edu Email', discount: 'FREE Pro Plan', description: 'Notion Pro plan completely free for students — unlimited blocks, AI features, teamspaces.', color: '#0f172a', url: 'https://www.notion.so/students', tags: ['Productivity', 'AI'] },
  { id: 12, name: 'Canva Pro Student', brand: 'canva', badge: 'Edu Email', discount: 'FREE for 1 Year', description: 'Canva Pro free for students via GitHub Student Pack or Canva Education program.', color: '#00c4cc', url: 'https://www.canva.com/education/', tags: ['Design', 'Presentations'] },
];

const TODAY_DEALS = [
  { id: 1, brand: 'Samsung', model: 'Galaxy S24 FE', cat: 'Smartphones', originalPrice: '₹54,999', dealPrice: '₹42,999', discount: '22% OFF', rating: 4.7, reviews: '12.4K', badge: 'Exchange Offer + No Cost EMI', color: '#1a73e8', store: 'Flipkart', url: 'https://www.flipkart.com' },
  { id: 2, brand: 'Apple', model: 'MacBook Air M3 (15")', cat: 'Laptops', originalPrice: '₹1,34,900', dealPrice: '₹1,22,990', discount: '9% OFF', rating: 4.9, reviews: '8.2K', badge: 'EMI from ₹10,250/mo', color: '#1d1d1f', store: 'Amazon', url: 'https://www.amazon.in' },
  { id: 3, brand: 'Sony', model: 'WH-1000XM5 Headphones', cat: 'Audio', originalPrice: '₹29,990', dealPrice: '₹22,990', discount: '23% OFF', rating: 4.8, reviews: '19.1K', badge: '🔥 All-time low', color: '#0a0a0a', store: 'Amazon', url: 'https://www.amazon.in' },
  { id: 4, brand: 'OnePlus', model: 'Nord CE 4 Lite 5G', cat: 'Smartphones', originalPrice: '₹20,999', dealPrice: '₹16,999', discount: '19% OFF', rating: 4.5, reviews: '5.3K', badge: 'Bank Offer: Extra 10% OFF', color: '#eb0029', store: 'Flipkart', url: 'https://www.flipkart.com' },
  { id: 5, brand: 'Logitech', model: 'MX Master 3S Mouse', cat: 'Peripherals', originalPrice: '₹8,995', dealPrice: '₹6,995', discount: '22% OFF', rating: 4.8, reviews: '7.9K', badge: 'Free Delivery', color: '#005bac', store: 'Amazon', url: 'https://www.amazon.in' },
  { id: 6, brand: 'Samsung', model: '65" QLED 4K Smart TV', cat: 'TVs', originalPrice: '₹1,19,999', dealPrice: '₹89,990', discount: '25% OFF', rating: 4.6, reviews: '3.1K', badge: 'No-cost EMI Available', color: '#1a73e8', store: 'Vijay Sales', url: 'https://www.vijaysales.com' },
  { id: 7, brand: 'Dyson', model: 'V15 Detect Vacuum', cat: 'Appliances', originalPrice: '₹69,900', dealPrice: '₹54,900', discount: '21% OFF', rating: 4.7, reviews: '2.3K', badge: 'Refurbished Available', color: '#b5006e', store: 'Amazon', url: 'https://www.amazon.in' },
  { id: 8, brand: 'Apple', model: 'iPad Air M2 (11")', cat: 'Tablets', originalPrice: '₹74,900', dealPrice: '₹64,900', discount: '13% OFF', rating: 4.9, reviews: '4.4K', badge: 'Education Price Available', color: '#1d1d1f', store: 'Amazon', url: 'https://www.amazon.in' },
  { id: 9, brand: 'Xiaomi', model: 'Smart TV X 43" 4K', cat: 'TVs', originalPrice: '₹34,999', dealPrice: '₹24,999', discount: '29% OFF', rating: 4.4, reviews: '6.7K', badge: '⚡ Lightning Deal', color: '#ff6900', store: 'Mi.com', url: 'https://www.mi.com/in/' },
  { id: 10, brand: 'boAt', model: 'Rockerz 558 Pro BT', cat: 'Audio', originalPrice: '₹4,499', dealPrice: '₹1,499', discount: '67% OFF', rating: 4.3, reviews: '45K', badge: 'Limited Stock', color: '#e31837', store: 'Amazon', url: 'https://www.amazon.in' },
  { id: 11, brand: 'HP', model: '15s Ryzen 5 Laptop 16GB', cat: 'Laptops', originalPrice: '₹59,999', dealPrice: '₹44,999', discount: '25% OFF', rating: 4.5, reviews: '3.2K', badge: 'Free Office 365', color: '#0096d6', store: 'Flipkart', url: 'https://www.flipkart.com' },
  { id: 12, brand: 'Realme', model: 'Buds Air 5 Pro TWS', cat: 'Earbuds', originalPrice: '₹4,999', dealPrice: '₹2,499', discount: '50% OFF', rating: 4.2, reviews: '8.1K', badge: 'Today Only', color: '#f7a825', store: 'Flipkart', url: 'https://www.flipkart.com' },
];

const EXCHANGE_DEALS = [
  { id: 1, name: 'Amazon Exchange', brand: 'amazon', color: '#ff9900', bgColor: '#fff8f0', offers: ['Up to ₹20,000 off on smartphones', 'Up to ₹30,000 off on laptops', 'Instant price check for old device', 'Free pickup for exchange'], url: 'https://www.amazon.in/b?node=7110979031', note: 'Use old phone/laptop to save on new purchase' },
  { id: 2, name: 'Flipkart Exchange', brand: 'flipkart', color: '#2874f0', bgColor: '#f0f6ff', offers: ['Upto ₹25,000 off on mobiles', 'Extra ₹5,000 off on Flipkart Plus', 'Doorstep pickup & instant discount', 'Any brand accepted for exchange'], url: 'https://www.flipkart.com/exchange-offers', note: 'Best exchange value on Samsung, OnePlus, Xiaomi' },
  { id: 3, name: 'Vijay Sales Exchange', brand: 'vijaysales', color: '#e31837', bgColor: '#fff0f2', offers: ['Up to ₹18,000 off on TVs', 'Refrigerator & washing machine swap', 'Air conditioner old-to-new exchange', 'Instant valuation at store'], url: 'https://www.vijaysales.com', note: 'Best for home appliance exchange deals' },
  { id: 4, name: 'Croma Exchange', brand: 'croma', color: '#009e49', bgColor: '#f0fff7', offers: ['Mobile exchange up to ₹22,000 off', 'Laptop exchange up to ₹35,000 off', 'Same-day exchange in store', 'Croma Care+ warranty free on exchange'], url: 'https://www.croma.com/exchange', note: 'Croma Care+ warranty bundled free with exchange' },
  { id: 5, name: 'Cashify — Sell Old Device', brand: 'cashify', color: '#00baf2', bgColor: '#f0fbff', offers: ['Instant cash for phones, laptops, tablets', 'Free home pickup within 60 minutes', 'Best price guarantee across all brands', 'Same-day payment via UPI/Bank transfer'], url: 'https://www.cashify.in', note: 'Sell old, buy new from any store at best price' },
  { id: 6, name: 'Reliance Digital Exchange', brand: 'reliancedigital', color: '#1a1a5e', bgColor: '#f0f0ff', offers: ['TV upgrade exchange up to ₹20,000 off', 'Large appliance swap deals', 'JioMart exchange bonus ₹2,000', 'Extended warranty bundled on exchange'], url: 'https://www.reliancedigital.in', note: 'Best for large appliance swaps in-store' },
];

const AFFILIATED_DEALS = [
  { id: 1, name: 'HDFC SmartBuy Electronics', brand: 'hdfc', type: 'Affiliate Card Offer', discount: '10% Instant Cashback', description: '10% instant cashback on electronics & appliances at Amazon, Flipkart, Croma & Vijay Sales.', validOn: 'Amazon, Flipkart, Vijay Sales, Croma', color: '#003087', url: 'https://www.amazon.in', badge: '🔥 Hot Partner Offer' },
  { id: 2, name: 'SBI SimplyCLICK Online Shopping', brand: 'sbi', type: 'Affiliate Reward Partner', discount: '10X Reward Points', description: '10X reward points on Amazon, Flipkart, Myntra, Swiggy & Tata CLiQ online orders.', validOn: 'Amazon & Flipkart Online', color: '#22286b', url: 'https://www.flipkart.com', badge: '10X Rewards' },
  { id: 3, name: 'Amazon Pay ICICI Card', brand: 'amazon', type: 'Unlimited Cashback', discount: '5% Unlimited Cashback', description: '5% unlimited cashback for Prime members on all electronics & appliance purchases on Amazon.in.', validOn: 'Amazon.in', color: '#ff9900', url: 'https://www.amazon.in', badge: '5% Flat Cashback' },
  { id: 4, name: 'PhonePe SmartBuy Electronics', brand: 'phonepe', type: 'UPI & Payment Partner', discount: '5-20% Cashback', description: 'Exclusive cashback rewards on purchasing gadgets at Croma, Reliance Digital & Vijay Sales using PhonePe.', validOn: 'Vijay Sales, Reliance Digital', color: '#7b2cf8', url: 'https://www.phonepe.com', badge: 'UPI Offer' },
  { id: 5, name: 'Paytm Smart Electronics Pass', brand: 'paytm', type: 'Paytm Wallet Affiliated', discount: 'Flat ₹200-₹1,500 Cashback', description: 'Flat cashback on gadget purchases above ₹5,000 across online & partner retail outlets.', validOn: 'Paytm Mall & Partner Outlets', color: '#00baf2', url: 'https://paytm.com', badge: 'Instant Cashback' },
  { id: 6, name: 'Axis Bank MyZone Credit Card', brand: 'axis', type: 'Affiliate Card Perks', discount: 'Extra 10% OFF + 10X Points', description: '10% instant discount + 10X Edge Rewards on Flipkart, Myntra & Nykaa gadget sales.', validOn: 'Flipkart, Myntra, Nykaa', color: '#97040c', url: 'https://www.flipkart.com', badge: 'Exclusive Partner' }
];

const NEARBY_REPAIR_CENTERS = [
  { id: 1, name: 'Apple Authorized Service Center (Imagine)', brand: 'apple', distance: '1.2 km away', rating: 4.8, reviews: 342, address: 'MG Road, Indiranagar, Bengaluru', phone: '+91 80 4123 9800', timing: 'Open • Closes 8 PM', claimSuccess: '98% Claim Rate' },
  { id: 2, name: 'Samsung Smart Care & Service Plaza', brand: 'samsung', distance: '2.5 km away', rating: 4.6, reviews: 521, address: 'Koramanagala 5th Block, Bengaluru', phone: '+91 1800 40 7267864', timing: 'Open • Closes 7:30 PM', claimSuccess: '94% Claim Rate' },
  { id: 3, name: 'Sony Authorized Service Center (Spectrum)', brand: 'sony', distance: '3.1 km away', rating: 4.7, reviews: 189, address: 'Jayanagar 4th Block, Bengaluru', phone: '+91 1800 103 7799', timing: 'Open • Closes 7 PM', claimSuccess: '96% Claim Rate' },
  { id: 4, name: 'LG Exclusive Service & Care Point', brand: 'lg', distance: '3.8 km away', rating: 4.5, reviews: 298, address: 'HSR Layout Sector 1, Bengaluru', phone: '+91 1800 315 9999', timing: 'Open • Closes 8 PM', claimSuccess: '92% Claim Rate' },
  { id: 5, name: 'Logitech & Peripheral Authorized Care', brand: 'logitech', distance: '4.2 km away', rating: 4.4, reviews: 114, address: 'Residency Road, Commercial Street, Bengaluru', phone: '+91 1800 572 4730', timing: 'Open • Closes 6:30 PM', claimSuccess: '90% Claim Rate' },
  { id: 6, name: 'HP World Authorized Repair Hub', brand: 'hp', distance: '4.9 km away', rating: 4.6, reviews: 215, address: 'Whitefield Main Rd, Bengaluru', phone: '+91 1800 258 7170', timing: 'Open • Closes 8 PM', claimSuccess: '93% Claim Rate' },
];

const BRAND_CLAIM_RATINGS = [
  { brand: 'Apple', score: '9.4/10', rate: '98%', speed: '24-48 Hours', replacementPolicy: 'Instant Exchange / Free Repair', status: '🏆 Top Rated' },
  { brand: 'Sony', score: '8.9/10', rate: '96%', speed: '2-4 Days', replacementPolicy: 'Parts Replacement with OEM Warranty', status: '⭐ Excellent' },
  { brand: 'Samsung', score: '8.7/10', rate: '94%', speed: '1-3 Days', replacementPolicy: 'Doorstep Technician Service available', status: '⭐ Excellent' },
  { brand: 'HP', score: '8.4/10', rate: '93%', speed: '3-5 Days', replacementPolicy: 'On-site Repair for Laptops', status: '👍 Good' },
  { brand: 'LG', score: '8.2/10', rate: '92%', speed: '2-4 Days', replacementPolicy: 'Free Technician Visit for Home Appliances', status: '👍 Good' },
  { brand: 'Logitech', score: '8.0/10', rate: '90%', speed: '3-6 Days', replacementPolicy: 'Direct Express Replacement', status: '👍 Good' },
];

const TABS = [
  { id: 'student', label: 'Student Deals', icon: GraduationCap, count: STUDENT_DEALS.length, subtitle: 'UniDays, Free Dev Tools & Education pricing' },
  { id: 'today', label: "Today's Best Deals", icon: Zap, count: TODAY_DEALS.length, subtitle: 'Gadgets at lowest price with warranty' },
  { id: 'affiliated', label: 'Affiliated & Best Offers', icon: ShieldCheck, count: AFFILIATED_DEALS.length, subtitle: 'Bank cards, UPI cashback & exclusive affiliate rewards' },
  { id: 'exchange', label: 'Exchange & Upgrade', icon: ArrowLeftRight, count: EXCHANGE_DEALS.length, subtitle: 'Trade in old devices for maximum cash value' },
  { id: 'repair', label: 'Nearby Repair & Brand Ratings', icon: MapPin, count: NEARBY_REPAIR_CENTERS.length, subtitle: 'Service centers near you & claim ratings' },
];

export default function ShopsPage() {
  const [activeTab, setActiveTab] = useState('student');
  const [searchFilter, setSearchFilter] = useState('');

  return (
    <div>
      {/* Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
        borderRadius: '1.5rem',
        padding: '2.25rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 12px 32px rgba(30, 58, 138, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: 220, height: 220, background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            WarrantyEase Marketplace & Savings Hub
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, marginTop: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
            Shops, Deals, Discounts & Authorized Service
          </h1>
          <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '720px', lineHeight: 1.5, margin: 0 }}>
            Discover student discounts (UniDays & GitHub), daily gadget deals, instant exchange bonuses, and nearest authorized service centers with brand claim approval ratings.
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.85rem',
                border: isActive ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.92rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
              }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '0.5rem',
                background: isActive ? '#2563eb' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div>{tab.label}</div>
                <div style={{ fontSize: '0.7rem', color: isActive ? '#3b82f6' : '#94a3b8', fontWeight: 500 }}>{tab.subtitle}</div>
              </div>
              <span style={{
                background: isActive ? '#2563eb' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.15rem 0.55rem',
                borderRadius: '20px',
                marginLeft: '0.25rem'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* STUDENT DEALS TAB */}
      {activeTab === 'student' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {STUDENT_DEALS.map((deal) => (
              <div key={deal.id} style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: '4px', background: deal.color }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        background: '#f8fafc',
                        borderRadius: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                        flexShrink: 0
                      }}>
                        <BrandLogoIcon brand={deal.brand} size={30} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{deal.name}</div>
                        <div style={{ fontWeight: 900, fontSize: '0.92rem', color: deal.color, marginTop: '0.1rem' }}>{deal.discount}</div>
                      </div>
                    </div>
                    <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>{deal.badge}</span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '0.85rem', lineHeight: 1.55 }}>{deal.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {deal.tags.map((tag) => (
                        <span key={tag} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '0.4rem', fontWeight: 600 }}>{tag}</span>
                      ))}
                    </div>
                    <a href={deal.url} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: deal.color,
                        color: '#ffffff',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '0.65rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        flexShrink: 0
                      }}>
                      Get Deal <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TODAY'S BEST DEALS TAB */}
      {activeTab === 'today' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {TODAY_DEALS.map((deal) => (
              <div key={deal.id} style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: '4px', background: `linear-gradient(90deg, ${deal.color}, #2563eb)` }} />
                <div style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        background: '#f8fafc',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}>
                        <BrandLogoIcon brand={deal.brand} size={28} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{deal.cat}</div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.2 }}>{deal.brand} {deal.model}</div>
                      </div>
                    </div>
                    <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 900, padding: '0.2rem 0.55rem', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 }}>{deal.discount}</span>
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

                  <div style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', padding: '0.3rem 0.65rem', borderRadius: '0.5rem', marginBottom: '0.85rem', fontWeight: 600 }}>
                    ✓ {deal.badge}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>via {deal.store}</span>
                    <a href={deal.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#2563eb', color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: '0.6rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                      Buy Now <ChevronRight size={13} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AFFILIATED & BEST OFFERS TAB */}
      {activeTab === 'affiliated' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
            {AFFILIATED_DEALS.map((offer) => (
              <div key={offer.id} style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: '5px', background: offer.color }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        background: '#f8fafc',
                        borderRadius: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0
                      }}>
                        <BrandLogoIcon brand={offer.brand} size={30} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>{offer.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{offer.type}</div>
                      </div>
                    </div>
                    <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>{offer.badge}</span>
                  </div>

                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: offer.color, marginBottom: '0.4rem' }}>{offer.discount}</div>
                  <p style={{ fontSize: '0.83rem', color: '#475569', marginBottom: '0.85rem', lineHeight: 1.5 }}>{offer.description}</p>
                  
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                    Valid on: <strong style={{ color: '#0f172a' }}>{offer.validOn}</strong>
                  </div>

                  <a href={offer.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      gap: '0.4rem',
                      background: offer.color,
                      color: '#ffffff',
                      padding: '0.55rem 1rem',
                      borderRadius: '0.7rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      width: '100%'
                    }}>
                    Claim Affiliated Offer <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXCHANGE & UPGRADE TAB */}
      {activeTab === 'exchange' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {EXCHANGE_DEALS.map((deal) => (
              <div key={deal.id} style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
                <div style={{ height: '5px', background: deal.color }} />
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      background: deal.bgColor,
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${deal.color}33`,
                      flexShrink: 0
                    }}>
                      <BrandLogoIcon brand={deal.brand} size={32} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{deal.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>{deal.note}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.15rem' }}>
                    {deal.offers.map((offer, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: '#334155' }}>
                        <span style={{ color: deal.color, fontWeight: 900, flexShrink: 0 }}>✓</span>
                        <span>{offer}</span>
                      </div>
                    ))}
                  </div>

                  <a href={deal.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: deal.color,
                      color: '#ffffff',
                      padding: '0.6rem 1rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      width: '100%'
                    }}>
                    Check Exchange Values <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPAIR SERVICES & BRAND CLAIM RATINGS TAB */}
      {activeTab === 'repair' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Interactive Map Visual Mockup */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Navigation size={20} color="#2563eb" /> Authorized Service Centers Near You
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Find official service centers for warranty claims, repair & screen replacements</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem 0.75rem', borderRadius: '0.65rem' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by city or pincode..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', width: '180px' }}
                />
              </div>
            </div>

            {/* Stylized Simulated Map Container */}
            <div style={{
              height: '240px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #e2e8f0 100%)',
              border: '1px solid #93c5fd',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem'
            }}>
              {/* Map grid lines */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'radial-gradient(#0284c7 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              
              {/* Map Pins */}
              {NEARBY_REPAIR_CENTERS.slice(0, 4).map((center, index) => {
                const offsets = [
                  { top: '25%', left: '20%' },
                  { top: '55%', left: '45%' },
                  { top: '30%', left: '75%' },
                  { top: '70%', left: '80%' },
                ];
                return (
                  <div key={center.id} style={{
                    position: 'absolute',
                    ...offsets[index],
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}>
                    <div style={{
                      background: '#ffffff',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '0.6rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      whiteSpace: 'nowrap'
                    }}>
                      <BrandLogoIcon brand={center.brand} size={16} />
                      {center.brand.toUpperCase()}
                    </div>
                    <MapPin size={24} color="#dc2626" fill="#ef4444" style={{ marginTop: '-4px' }} />
                  </div>
                );
              })}
              
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>
                📍 Bengaluru, Karnataka (Detected Location)
              </div>
            </div>

            {/* List of Repair Centers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {NEARBY_REPAIR_CENTERS.map((center) => (
                <div key={center.id} style={{
                  background: '#f8fafc',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  padding: '1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 42, height: 42, background: '#ffffff', borderRadius: '0.65rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrandLogoIcon brand={center.brand} size={26} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.2 }}>{center.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, marginTop: '0.1rem' }}>📍 {center.distance} • {center.timing}</div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '20px', whiteSpace: 'nowrap' }}>{center.claimSuccess}</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{center.address}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#ea580c', fontWeight: 700 }}>
                      <Star size={12} fill="#ea580c" color="#ea580c" />
                      <span>{center.rating}</span>
                      <span style={{ color: '#94a3b8', fontWeight: 400 }}>({center.reviews})</span>
                    </div>
                    <a href={`tel:${center.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '0.35rem 0.7rem', borderRadius: '0.55rem', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                      <Phone size={12} color="#2563eb" /> Call Service
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Claim Approval Ratings Leaderboard */}
          <div style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#16a34a" /> Official Brand Warranty Claim Approval Ratings
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Real user ratings on warranty claim approval speeds and replacement hassle levels</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {BRAND_CLAIM_RATINGS.map((item, i) => (
                <div key={item.brand} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.9rem',
                  padding: '0.85rem 1.15rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '220px' }}>
                    <div style={{ width: 40, height: 40, background: '#ffffff', borderRadius: '0.65rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrandLogoIcon brand={item.brand} size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{item.brand}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Policy: {item.replacementPolicy}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>APPROVAL RATE</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#16a34a' }}>{item.rate}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>RESOLUTION SPEED</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{item.speed}</div>
                    </div>
                    <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '20px' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
