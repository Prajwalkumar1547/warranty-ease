import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Layers, FileText } from 'lucide-react';

export default function AddBusinessProtectionModal({ isOpen, onClose, onAddBusinessProtection }) {
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Office Computers');
  const [unitCount, setUnitCount] = useState(1);
  const [serialNumbers, setSerialNumbers] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [warrantyProvider, setWarrantyProvider] = useState('Official OEM Commercial AMC');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!businessName || !brand || !model || !expiryDate) return;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let status = 'Active';
    if (daysLeft <= 0) {
      status = 'Expired';
    } else if (daysLeft <= 30) {
      status = 'Expiring Soon';
    }

    const expDateObj = new Date(expiryDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedExpiry = `Expires ${months[expDateObj.getMonth()]} ${expDateObj.getDate()}, ${expDateObj.getFullYear()}`;

    const newBusinessProtection = {
      id: `biz-${Date.now()}`,
      isBusiness: true,
      businessName,
      gstNumber: gstNumber || 'GST-PENDING',
      brand,
      model: `${model} (${unitCount} Units)`,
      unitCount: Number(unitCount) || 1,
      category: `Business (${category})`,
      status,
      expiryDate,
      expiryFormatted: formattedExpiry,
      price: Number(price) || 0,
      currency,
      serialNumber: serialNumbers || `BIZ-SN-RANGE-100${unitCount}`,
      invoiceNumber: invoiceNumber || `INV-BIZ-${Math.floor(10000 + Math.random() * 90000)}`,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      warrantyProvider,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      progressPercentage: daysLeft <= 0 ? 100 : Math.min(100, Math.max(10, Math.round((1 - daysLeft / 1460) * 100)))
    };

    onAddBusinessProtection(newBusinessProtection);
    onClose();

    // Reset Form
    setBusinessName('');
    setGstNumber('');
    setBrand('');
    setModel('');
    setPrice('');
    setExpiryDate('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.15rem' }}>Add Business & Bulk Warranty</h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Commercial Asset & AMC Protection</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company / Business Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Acme Enterprises Pvt Ltd"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GSTIN / Business Tax ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand / Manufacturer *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Apple, Dell, Lenovo, LG, Maruti"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product / Equipment Model *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. MacBook Pro M3, Commercial Air Conditioner"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Asset Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Office Computers">Office Computers & Laptops</option>
                  <option value="Server & IT Infrastructure">Server & IT Infrastructure</option>
                  <option value="Fleet Vehicles">Fleet & Commercial Vehicles</option>
                  <option value="Store POS Systems">Store POS & Display Systems</option>
                  <option value="Commercial HVAC / AC">Commercial HVAC / AC Units</option>
                  <option value="Office Furniture & Appliances">Office Furniture & Appliances</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity / Unit Count *</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  required
                  value={unitCount}
                  onChange={(e) => setUnitCount(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bulk Serial Numbers / Tag List (Optional)</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. SN-101, SN-102, SN-103 or Asset Range TAG-2026-A to D"
                value={serialNumbers}
                onChange={(e) => setSerialNumbers(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tax Invoice Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. INV-2026-9901"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Commercial Invoice Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">AMC / Warranty Expiry Date *</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#0f172a' }}>
              <Building2 size={16} />
              <span>Register Business Protection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
