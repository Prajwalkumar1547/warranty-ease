import React, { useState } from 'react';
import { X, Link2, CheckCircle2, Package, ShoppingBag, ChevronRight, Loader2, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

const RETAILERS = [
  { id: 'amazon', name: 'Amazon India', emoji: '📦', color: '#ff9900', bgColor: '#fff8f0', description: 'Import orders from Amazon.in — electronics, appliances, gadgets', note: 'Supports Amazon Pay orders' },
  { id: 'flipkart', name: 'Flipkart', emoji: '🛒', color: '#2874f0', bgColor: '#f0f6ff', description: 'Import orders from Flipkart — mobiles, TVs, home appliances', note: 'Flipkart Plus & regular orders' },
  { id: 'vijaysales', name: 'Vijay Sales', emoji: '🏪', color: '#e31837', bgColor: '#fff0f2', description: 'Link your Vijay Sales purchase history and warranty cards', note: 'In-store & online orders' },
  { id: 'croma', name: 'Croma', emoji: '🟢', color: '#009e49', bgColor: '#f0fff7', description: 'Link Croma electronics purchases and service history', note: 'Croma app orders' },
  { id: 'reliancedigital', name: 'Reliance Digital', emoji: '💡', color: '#1a1a5e', bgColor: '#f0f0ff', description: 'Link Reliance Digital in-store and JioMart purchases', note: 'Reliance Retail orders' },
  { id: 'myntra', name: 'Myntra', emoji: '👗', color: '#ff3f6c', bgColor: '#fff0f3', description: 'Myntra fashion gadgets, wearables, smartwatches', note: 'Fashion & wearables' },
];

const MOCK_ORDERS = {
  amazon: [
    { id: 'AMZ-40211-8812', product: 'Samsung Galaxy S24 FE 5G (Graphite, 8GB RAM, 256GB)', date: '2026-09-05', price: '₹42,999', category: 'Smartphones', brand: 'Samsung' },
    { id: 'AMZ-40188-2231', product: 'Sony WH-1000XM5 Wireless Headphones', date: '2026-08-20', price: '₹22,990', category: 'Audio', brand: 'Sony' },
    { id: 'AMZ-39982-7741', product: 'Logitech MX Master 3S Wireless Mouse', date: '2026-07-14', price: '₹6,995', category: 'Peripherals', brand: 'Logitech' },
  ],
  flipkart: [
    { id: 'FK-OD-8821-00921', product: 'OnePlus Nord CE 4 Lite 5G (Super Silver, 8GB+256GB)', date: '2026-09-01', price: '₹16,999', category: 'Smartphones', brand: 'OnePlus' },
    { id: 'FK-OD-8800-11872', product: 'LG 260L Smart Double Door Refrigerator', date: '2026-08-12', price: '₹31,490', category: 'Home Appliances', brand: 'LG' },
  ],
  vijaysales: [
    { id: 'VS-BILL-88291', product: 'Samsung 65" QLED 4K Smart TV (2026)', date: '2026-09-08', price: '₹89,990', category: 'Television', brand: 'Samsung' },
    { id: 'VS-BILL-88100', product: 'Dyson V15 Detect Cordless Vacuum Cleaner', date: '2026-08-28', price: '₹54,900', category: 'Home Appliances', brand: 'Dyson' },
  ],
  croma: [
    { id: 'CROMA-8821-99', product: 'Apple MacBook Air M3 15" 8GB 256GB Space Grey', date: '2026-07-20', price: '₹1,22,990', category: 'Laptops', brand: 'Apple' },
  ],
  reliancedigital: [
    { id: 'RD-JIOMART-7712', product: 'Xiaomi 14 5G (Black, 12GB+512GB)', date: '2026-09-03', price: '₹59,999', category: 'Smartphones', brand: 'Xiaomi' },
  ],
  myntra: [
    { id: 'MYN-8812-GAD', product: 'Noise ColorFit Pro 5 Smartwatch', date: '2026-08-15', price: '₹4,499', category: 'Wearables', brand: 'Noise' },
  ],
};

export default function RetailerInvoiceLinkModal({ isOpen, onClose, onImportOrder }) {
  const [step, setStep] = useState('select'); // select | connecting | orders
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connectedRetailers, setConnectedRetailers] = useState([]);
  const [importedOrders, setImportedOrders] = useState([]);

  if (!isOpen) return null;

  const handleConnect = (retailer) => {
    setSelectedRetailer(retailer);
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnectedRetailers(prev => [...new Set([...prev, retailer.id])]);
      setStep('orders');
    }, 1800);
  };

  const handleImportOrder = (order) => {
    setImportedOrders(prev => [...prev, order.id]);
    if (onImportOrder) {
      onImportOrder({
        id: `retailer-${Date.now()}`,
        brand: order.brand,
        productName: order.product,
        model: order.product,
        category: order.category,
        purchaseDate: order.date,
        price: Number(order.price.replace(/[₹,]/g, '')),
        currency: '₹',
        serialNumber: null,
        warrantyDurationMonths: null,
        warrantyVerified: false,
        protectionType: 'Warranty',
        status: 'Active',
        retailerOrderId: order.id,
        warrantySource: `${selectedRetailer?.name} Order #${order.id}`,
      });
    }
  };

  const orders = selectedRetailer ? (MOCK_ORDERS[selectedRetailer.id] || []) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link2 size={22} color="#2563eb" />
            <div>
              <h2 className="modal-title">Link Retailer Invoice</h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Connect your online store account to import invoices & add warranties</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {step === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.85rem', padding: '0.85rem 1rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#1d4ed8', margin: 0, fontWeight: 600 }}>
                  🔒 Connect your retailer account to automatically fetch invoices. No passwords stored — uses secure OAuth or order ID linking.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '0.85rem' }}>
                {RETAILERS.map((retailer) => (
                  <div key={retailer.id} style={{ background: retailer.bgColor, borderRadius: '1rem', border: `1px solid ${retailer.color}22`, padding: '1rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${retailer.color}22`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    onClick={() => handleConnect(retailer)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{retailer.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{retailer.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{retailer.note}</div>
                        </div>
                      </div>
                      {connectedRetailers.includes(retailer.id)
                        ? <CheckCircle2 size={20} color="#16a34a" />
                        : <ChevronRight size={18} color={retailer.color} />}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>{retailer.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'select' && connecting && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader2 size={36} className="spin-animation" color="#2563eb" style={{ margin: '0 auto 0.75rem auto' }} />
              <p style={{ fontWeight: 800, color: '#0f172a' }}>Connecting to {selectedRetailer?.name}...</p>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Fetching recent orders and invoices securely</p>
            </div>
          )}

          {step === 'orders' && selectedRetailer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.65rem 0.85rem' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d' }}>Connected to {selectedRetailer.name} — {orders.length} recent orders found</span>
                <button onClick={() => setStep('select')} style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Switch Retailer</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((order) => {
                  const alreadyImported = importedOrders.includes(order.id);
                  return (
                    <div key={order.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', flex: 1 }}>
                        <Package size={32} color="#2563eb" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.15rem' }}>{order.product}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Order #{order.id} • {order.date} • <strong style={{ color: '#0f172a' }}>{order.price}</strong></div>
                          {!alreadyImported && (
                            <div style={{ fontSize: '0.72rem', color: '#d97706', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <AlertTriangle size={12} />Serial number will need to be scanned from product label after import.
                            </div>
                          )}
                        </div>
                      </div>
                      {alreadyImported ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700 }}>
                          <ShieldCheck size={18} />Added to Protections
                        </div>
                      ) : (
                        <button onClick={() => handleImportOrder(order)} className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', flexShrink: 0 }}>
                          <ShoppingBag size={14} />
                          <span>Import & Add Warranty</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.85rem', padding: '0.75rem 1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>
                  ⚠️ <strong>Note:</strong> Invoice fetching uses a simulated connection (real OAuth integration requires a backend API). After importing, scan the product's serial number sticker using the AI Scanner to complete your warranty record.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {step === 'orders' && (
            <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ExternalLink size={14} />Connect Another Retailer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
