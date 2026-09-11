import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  HeartPulse,
  Wrench,
  IndianRupee,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import CustomSelect from './CustomSelect';
import BrandLogo from './BrandLogo';

// WARRANTY ISSUE CATEGORIES (Electronics, Appliances, Gadgets)
const WARRANTY_CATEGORIES = [
  { value: 'Hardware Failure', label: 'Hardware Failure & Malfunction', icon: '⚙️', subtitle: 'Component breakdown, power failure, motor stopped' },
  { value: 'Screen & Display Defect', label: 'Screen & Display Defect', icon: '📱', subtitle: 'Cracked screen, dead pixels, touch unresponsive' },
  { value: 'Battery & Power Issue', label: 'Battery & Charging Issue', icon: '🔋', subtitle: 'Rapid battery drain, loose port, charging failure' },
  { value: 'Physical & Liquid Damage', label: 'Physical & Liquid Damage', icon: '💧', subtitle: 'Accidental spill, drops or liquid ingress' },
  { value: 'Software & Firmware Glitch', label: 'Software & Firmware Glitch', icon: '💻', subtitle: 'Boot loop, system crash, OS freeze' },
  { value: 'Motor & Compressor Issue', label: 'Motor & Compressor Failure', icon: '🌀', subtitle: 'Inverter motor noise, drum stuck, cooling failure' }
];

const WARRANTY_RESOLUTIONS = [
  { value: 'Authorized Service Center Repair', label: 'Authorized Service Center Repair', icon: '🛠️', subtitle: 'Free repair at official brand service center' },
  { value: 'Doorstep Technician Visit', label: 'Technician Home Visit', icon: '🏠', subtitle: 'On-site doorstep inspection and repair' },
  { value: 'Full Product Replacement', label: 'Full Product Replacement', icon: '🔄', subtitle: 'Replacement unit under manufacturer warranty' },
  { value: 'Refund / Store Credit', label: 'Refund or Store Credit', icon: '💰', subtitle: 'Direct monetary refund if unrepairable' }
];

// INSURANCE CLAIM CATEGORIES (Health, Vehicle, Jewellery, Property, Life)
const INSURANCE_CATEGORIES = [
  { value: 'Cashless Hospitalization', label: 'Cashless Hospitalization', icon: '🏥', subtitle: 'Direct hospital settlement (Planned or emergency)' },
  { value: 'Medical Reimbursement (OPD / Pharmacy)', label: 'Medical Reimbursement (OPD / Pharmacy)', icon: '💸', subtitle: 'Post-hospitalization bills, doctor consultation, lab tests' },
  { value: 'Vehicle Accident & Collision Repair', label: 'Vehicle Accident & Collision Repair', icon: '🚗', subtitle: 'Cashless network garage repair or surveyor claim' },
  { value: 'Theft / Burglary / Total Loss', label: 'Theft, Burglary or Loss Claim', icon: '💎', subtitle: 'Valuables / jewellery / vehicle theft with FIR' },
  { value: 'Property & Fire / Water Damage', label: 'Property / Home Structure Damage', icon: '🏠', subtitle: 'Natural disaster, water seepage, fire damage' },
  { value: 'Travel Delay & Baggage Loss', label: 'Travel Delay / Lost Baggage', icon: '✈️', subtitle: 'Flight cancellation, overseas medical emergencies' },
  { value: 'Critical Illness Benefit', label: 'Critical Illness Benefit Payout', icon: '❤️', subtitle: 'Lump-sum policy payout on diagnosed condition' }
];

const INSURANCE_RESOLUTIONS = [
  { value: 'Direct Bank Cash Reimbursement', label: 'Direct Bank Cash Reimbursement', icon: '💰', subtitle: 'Direct payout of approved bill amounts to your bank account' },
  { value: 'Cashless Network Settlement', label: 'Cashless Network Settlement', icon: '🏥', subtitle: 'TPA pays hospital, garage or workshop directly' },
  { value: 'Surveyor Inspection Required', label: 'Surveyor Inspection & Assessment', icon: '📋', subtitle: 'Insurance surveyor appointment for damage estimate' }
];

export default function FileClaimModal({
  isOpen,
  onClose,
  protections = [],
  prefilledItem = null,
  onAddClaim
}) {
  const [claimType, setClaimType] = useState('warranty'); // 'warranty' | 'insurance'
  const [selectedProtectionId, setSelectedProtectionId] = useState('');
  const [issueCategory, setIssueCategory] = useState('Hardware Failure');
  const [preferredResolution, setPreferredResolution] = useState('Authorized Service Center Repair');
  const [incidentDate, setIncidentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  
  // Insurance-specific fields
  const [claimedAmount, setClaimedAmount] = useState('');
  const [hospitalOrWorkshop, setHospitalOrWorkshop] = useState('');
  const [billReferenceNo, setBillReferenceNo] = useState('');

  // Manual / Custom item entry fallback
  const [customBrand, setCustomBrand] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  
  const [submitted, setSubmitted] = useState(false);

  // Sync when prefilled item is passed or changed
  useEffect(() => {
    if (prefilledItem) {
      setSelectedProtectionId(prefilledItem.id);
      const isInsurance =
        prefilledItem.protectionType === 'Insurance' ||
        prefilledItem.protectionType === 'Insurance Policy' ||
        ['health', 'vehicle', 'jewellery', 'property', 'life', 'travel'].some((c) =>
          (prefilledItem.category || '').toLowerCase().includes(c)
        );

      if (isInsurance) {
        setClaimType('insurance');
        setIssueCategory('Cashless Hospitalization');
        setPreferredResolution('Direct Bank Cash Reimbursement');
      } else {
        setClaimType('warranty');
        setIssueCategory('Hardware Failure');
        setPreferredResolution('Authorized Service Center Repair');
      }
    } else if (protections.length > 0 && !selectedProtectionId) {
      setSelectedProtectionId(protections[0].id);
    } else if (protections.length === 0) {
      setSelectedProtectionId('custom');
    }
  }, [prefilledItem, isOpen, protections]);

  if (!isOpen) return null;

  const protectionOptions = [
    ...protections.map((p) => ({
      value: p.id,
      label: `${p.brand} ${p.productName || p.model}`,
      brand: p.brand,
      subtitle: `${p.protectionType || 'Warranty'} • ${p.category || 'Personal'} • Expiry: ${p.expiryDate || 'Active'}`
    })),
    {
      value: 'custom',
      label: '+ Enter Another / Unregistered Policy or Item',
      brand: 'Other',
      subtitle: 'Type brand and details manually'
    }
  ];

  const handleProtectionSelect = (protId) => {
    setSelectedProtectionId(protId);
    if (protId === 'custom') return;

    const item = protections.find((p) => p.id === protId);
    if (!item) return;

    const isInsurance =
      item.protectionType === 'Insurance' ||
      item.protectionType === 'Insurance Policy' ||
      ['health', 'vehicle', 'jewellery', 'property', 'life', 'travel'].some((c) =>
        (item.category || '').toLowerCase().includes(c)
      );

    if (isInsurance) {
      setClaimType('insurance');
      setIssueCategory('Cashless Hospitalization');
      setPreferredResolution('Direct Bank Cash Reimbursement');
    } else {
      setClaimType('warranty');
      setIssueCategory('Hardware Failure');
      setPreferredResolution('Authorized Service Center Repair');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const item = protections.find((p) => p.id === selectedProtectionId);
    const brandName = item ? item.brand : (customBrand.trim() || (claimType === 'insurance' ? 'Health Insurer' : 'General'));
    const prodName = item ? (item.productName || item.model) : (customProductName.trim() || (claimType === 'insurance' ? 'Health Policy' : 'Equipment'));

    const newClaim = {
      id: `CLM-${Math.floor(10000 + Math.random() * 90000)}`,
      protectionId: item ? item.id : 'custom',
      brand: brandName,
      model: prodName,
      productName: prodName,
      category: item ? item.category : claimType === 'insurance' ? 'Health' : 'Electronics',
      protectionType: claimType === 'insurance' ? 'Insurance' : 'Warranty',
      claimType: claimType === 'insurance' ? 'Insurance Claim' : 'Warranty Claim',
      issueCategory,
      incidentDate: incidentDate || new Date().toISOString().split('T')[0],
      description,
      preferredResolution,
      claimedAmount: claimedAmount ? Number(claimedAmount) : item ? Number(item.price || 0) : 0,
      hospitalOrWorkshop: hospitalOrWorkshop || null,
      billReferenceNo: billReferenceNo || null,
      status: 'Submitted',
      claimStatus: 'Submitted',
      otp: `${Math.floor(1000 + Math.random() * 9000)}`,
      filedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    onAddClaim(newClaim);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setDescription('');
      setClaimedAmount('');
      setHospitalOrWorkshop('');
      setBillReferenceNo('');
      setCustomBrand('');
      setCustomProductName('');
    }, 1300);
  };

  const isInsuranceMode = claimType === 'insurance';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '0.75rem',
                background: isInsuranceMode
                  ? 'linear-gradient(135deg, #16a34a 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #0066cc 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              {isInsuranceMode ? <HeartPulse size={22} /> : <FileText size={22} />}
            </div>
            <div>
              <h2 className="modal-title">
                {isInsuranceMode ? 'File Insurance Claim' : 'File Warranty Claim'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                {isInsuranceMode
                  ? 'Cashless hospitalization, doctor bills, vehicle repair, and cash reimbursement'
                  : 'Authorized brand service center repair, replacement, or technician visit'}
              </p>
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Claim Nature Switcher Tabs */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.55rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-secondary ${!isInsuranceMode ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            onClick={() => {
              setClaimType('warranty');
              setIssueCategory('Hardware Failure');
              setPreferredResolution('Authorized Service Center Repair');
            }}
          >
            <Wrench size={14} />
            <span>Warranty Service Claim</span>
          </button>

          <button
            type="button"
            className={`btn btn-secondary ${isInsuranceMode ? 'btn-primary' : ''}`}
            style={{
              fontSize: '0.8rem',
              padding: '0.4rem 0.85rem',
              backgroundColor: isInsuranceMode ? '#16a34a' : undefined,
              borderColor: isInsuranceMode ? '#16a34a' : undefined
            }}
            onClick={() => {
              setClaimType('insurance');
              setIssueCategory('Cashless Hospitalization');
              setPreferredResolution('Direct Bank Cash Reimbursement');
            }}
          >
            <HeartPulse size={14} />
            <span>Insurance Claim (Cashless / Reimbursement)</span>
          </button>
        </div>

        {submitted ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <CheckCircle2 size={54} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              {isInsuranceMode ? 'Insurance Claim Submitted!' : 'Warranty Claim Submitted!'}
            </h3>
            <p style={{ color: '#64748b', marginTop: '0.4rem', fontSize: '0.88rem' }}>
              {isInsuranceMode
                ? 'Your reimbursement / cashless request has been registered. TPA and insurer notified.'
                : 'Your claim ticket has been dispatched to official brand support.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Select Protection Dropdown */}
              <CustomSelect
                label="Select Covered Protection / Policy"
                required
                value={selectedProtectionId}
                onChange={handleProtectionSelect}
                options={protectionOptions}
                placeholder="Choose a registered product or insurance policy..."
              />

              {/* Conditional Manual Inputs for Custom / Unlisted Protection */}
              {selectedProtectionId === 'custom' && (
                <div className="form-row" style={{ marginTop: '0.9rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>
                      {isInsuranceMode ? 'Insurance Provider / Company *' : 'Brand Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder={isInsuranceMode ? 'e.g. Star Health / HDFC ERGO' : 'e.g. Apple / Samsung'}
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>
                      {isInsuranceMode ? 'Policy Name / Plan *' : 'Product / Model Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder={isInsuranceMode ? 'e.g. Family Optima Health Insurance' : 'e.g. iPhone 15 Pro 256GB'}
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Issue / Claim Category */}
              <div className="form-row" style={{ marginTop: '0.9rem' }}>
                <CustomSelect
                  label={isInsuranceMode ? 'Insurance Claim Category' : 'Warranty Issue Category'}
                  value={issueCategory}
                  onChange={(val) => setIssueCategory(val)}
                  options={isInsuranceMode ? INSURANCE_CATEGORIES : WARRANTY_CATEGORIES}
                />

                <div className="form-group">
                  <label className="form-label">
                    {isInsuranceMode ? 'Date of Incident / Admission' : 'Date Issue Occurred'}
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Dynamic Preferred Resolution */}
              <div style={{ marginTop: '0.9rem' }}>
                <CustomSelect
                  label={isInsuranceMode ? 'Settlement Preference' : 'Preferred Resolution'}
                  value={preferredResolution}
                  onChange={(val) => setPreferredResolution(val)}
                  options={isInsuranceMode ? INSURANCE_RESOLUTIONS : WARRANTY_RESOLUTIONS}
                />
              </div>

              {/* INSURANCE-SPECIFIC FIELDS: Cash Reimbursement Amount & Hospital/Garage */}
              {isInsuranceMode && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.85rem', padding: '1rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.65rem' }}>
                    Reimbursement & Facility Details
                  </span>

                  <div className="form-row" style={{ marginBottom: '0.65rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem', color: '#14532d' }}>
                        Claimed Amount (₹) *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 45000"
                        value={claimedAmount}
                        onChange={(e) => setClaimedAmount(e.target.value)}
                        required={isInsuranceMode}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.78rem', color: '#14532d' }}>
                        Hospital / Workshop / Doctor Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Apollo Hospitals / Authorized Center"
                        value={hospitalOrWorkshop}
                        onChange={(e) => setHospitalOrWorkshop(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#14532d' }}>
                      Hospital IPD No. / Doctor Bill Reference / FIR No.
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BILL-2026-9921 or IPD-88219"
                      value={billReferenceNo}
                      onChange={(e) => setBillReferenceNo(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Detailed Description */}
              <div className="form-group" style={{ marginTop: '0.9rem' }}>
                <label className="form-label">Detailed Description of Incident / Claim *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  placeholder={
                    isInsuranceMode
                      ? 'Describe medical condition, diagnosis, emergency or planned hospitalization, doctor advice, or accidental damage...'
                      : 'Explain what went wrong, symptoms observed, or how the hardware failure occurred...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  backgroundColor: isInsuranceMode ? '#16a34a' : undefined,
                  borderColor: isInsuranceMode ? '#16a34a' : undefined
                }}
              >
                {isInsuranceMode ? 'Submit Insurance Claim' : 'Submit Warranty Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
