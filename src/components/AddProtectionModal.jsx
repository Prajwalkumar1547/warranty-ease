import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileScan,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  Check,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Utensils,
  Sofa,
  Wrench,
  Package,
  HeartPulse,
  Car,
  Gem,
  Home,
  User,
  Plane,
  Building,
  FileCheck
} from 'lucide-react';
import { PROTECTION_TYPES, WARRANTY_CATEGORIES, INSURANCE_CATEGORIES } from '../data/protectionSchemas';
import BrandLogo from './BrandLogo';
import CustomSelect from './CustomSelect';
import { calculateWarrantyExpiry } from '../utils/warrantyCalculator';

// Map icon names to clean Lucide icon components (No cartoon emojis)
const ICON_MAP = {
  ShieldCheck,
  FileText,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Utensils,
  Sofa,
  Wrench,
  Package,
  HeartPulse,
  Car,
  Gem,
  Home,
  User,
  Plane,
  Building,
  FileCheck
};

const CategoryIcon = ({ iconName, size = 20, color = '#0066cc' }) => {
  const IconComp = ICON_MAP[iconName] || Package;
  return <IconComp size={size} color={color} />;
};

const ELECTRONICS_BRAND_OPTIONS = [
  { value: 'Apple', label: 'Apple', brand: 'Apple', subtitle: 'Consumer Electronics & Mac' },
  { value: 'Meta', label: 'Meta', brand: 'Meta', subtitle: 'Ray-Ban Meta Smart Glasses & Quest VR' },
  { value: 'Lenskart', label: 'Lenskart', brand: 'Lenskart', subtitle: 'Smart Eyewear & Bluetooth Glasses' },
  { value: 'Samsung', label: 'Samsung', brand: 'Samsung', subtitle: 'Mobiles, TVs & Home Appliances' },
  { value: 'Sony', label: 'Sony', brand: 'Sony', subtitle: 'Audio, Playstations & Cameras' },
  { value: 'OnePlus', label: 'OnePlus', brand: 'OnePlus', subtitle: 'Smartphones & Audio' },
  { value: 'Xiaomi', label: 'Xiaomi', brand: 'Xiaomi', subtitle: 'Smartphones & Smart Home' },
  { value: 'Dell', label: 'Dell', brand: 'Dell', subtitle: 'Laptops, Desktops & Displays' },
  { value: 'HP', label: 'HP', brand: 'HP', subtitle: 'Laptops, Printers & Accessories' },
  { value: 'Lenovo', label: 'Lenovo', brand: 'Lenovo', subtitle: 'ThinkPad, IdeaPad & Gaming' },
  { value: 'LG', label: 'LG', brand: 'LG', subtitle: 'OLED TVs, Refrigerators & Washers' },
  { value: 'Bosch', label: 'Bosch', brand: 'Bosch', subtitle: 'Premium Home Appliances' },
  { value: 'Dyson', label: 'Dyson', brand: 'Dyson', subtitle: 'Vacuum Cleaners & Air Purifiers' },
  { value: 'Logitech', label: 'Logitech', brand: 'Logitech', subtitle: 'Mice, Keyboards & Webcams' },
  { value: 'Bose', label: 'Bose', brand: 'Bose', subtitle: 'Headphones & Home Audio' },
  { value: 'JBL', label: 'JBL', brand: 'JBL', subtitle: 'Bluetooth Speakers & Earbuds' },
  { value: 'Whirlpool', label: 'Whirlpool', brand: 'Whirlpool', subtitle: 'Washing Machines & Fridges' },
];

const HEALTH_INSURER_OPTIONS = [
  { value: 'Star Health Insurance', label: 'Star Health Insurance', brand: 'Star Health', subtitle: 'Health Insurance Specialist' },
  { value: 'Care Health Insurance', label: 'Care Health Insurance', brand: 'Care Health', subtitle: 'Comprehensive Family & Critical Cover' },
  { value: 'Niva Bupa Health Insurance', label: 'Niva Bupa Health Insurance', brand: 'Niva Bupa', subtitle: 'Reassurance & Max Health Cover' },
  { value: 'ICICI Lombard', label: 'ICICI Lombard Health', brand: 'ICICI Lombard', subtitle: 'Complete Health Cover' },
  { value: 'HDFC ERGO', label: 'HDFC ERGO Health', brand: 'HDFC ERGO', subtitle: 'Optima Secure & Health Suraksha' },
  { value: 'Bajaj Allianz', label: 'Bajaj Allianz General Insurance', brand: 'Bajaj Allianz', subtitle: 'Health & Personal Accident' },
  { value: 'Tata AIG', label: 'Tata AIG Health Insurance', brand: 'Tata AIG', subtitle: 'Medicare & Critical Care' },
  { value: 'SBI General Insurance', label: 'SBI General Insurance', brand: 'SBI', subtitle: 'Arogya Sanjeevani & Health' },
  { value: 'Aditya Birla Health', label: 'Aditya Birla Health Insurance', brand: 'Aditya Birla', subtitle: 'Activ Health & Wellness' },
  { value: 'Digit Insurance', label: 'Digit Insurance', brand: 'Digit', subtitle: 'Zero Hassle Health Cover' }
];

const VEHICLE_MFR_OPTIONS = [
  { value: 'Maruti Suzuki', label: 'Maruti Suzuki', brand: 'Maruti Suzuki', subtitle: 'Cars & SUV Range' },
  { value: 'Toyota', label: 'Toyota', brand: 'Toyota', subtitle: 'Automotive Manufacturer' },
  { value: 'Tata Motors', label: 'Tata Motors', brand: 'Tata Motors', subtitle: 'EVs, Passenger & Commercial' },
  { value: 'Mahindra', label: 'Mahindra & Mahindra', brand: 'Mahindra', subtitle: 'SUVs & Electric Vehicles' },
  { value: 'Hyundai', label: 'Hyundai', brand: 'Hyundai', subtitle: 'Hatchbacks, Sedans & SUVs' },
  { value: 'Honda', label: 'Honda Cars', brand: 'Honda', subtitle: 'Sedans & City Range' },
  { value: 'BMW', label: 'BMW', brand: 'BMW', subtitle: 'Luxury Cars & Performance' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz', brand: 'Mercedes-Benz', subtitle: 'Luxury Vehicles' },
  { value: 'Volkswagen', label: 'Volkswagen', brand: 'Volkswagen', subtitle: 'German Engineering Cars' },
  { value: 'Kia', label: 'Kia Motors', brand: 'Kia', subtitle: 'SUVs & Compacts' },
];

const DURATION_OPTIONS = [
  { value: 12, label: '12 Months (1 Year)', subtitle: 'Standard 1-year product warranty / annual policy' },
  { value: 24, label: '24 Months (2 Years)', subtitle: '2-year comprehensive protection' },
  { value: 36, label: '36 Months (3 Years)', subtitle: '3-year extended warranty / multi-year policy' },
  { value: 60, label: '60 Months (5 Years)', subtitle: '5-year maximum warranty protection' },
];

const COVERAGE_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual Policy', subtitle: 'Covers single policyholder' },
  { value: 'Family Floater', label: 'Family Floater Plan', subtitle: 'Covers family members under shared sum insured' },
  { value: 'Senior Citizen', label: 'Senior Citizen Care', subtitle: 'Specialized healthcare cover for seniors' },
  { value: 'Critical Illness', label: 'Critical Illness Cover', subtitle: 'Lumpsum payout for specified critical conditions' }
];

const VEHICLE_TYPE_OPTIONS = [
  { value: 'Car', label: 'Four Wheeler / Car', subtitle: 'Private cars & SUVs' },
  { value: 'Motorcycle', label: 'Two Wheeler / Bike', subtitle: 'Motorcycles & Scooters' },
  { value: 'EV', label: 'Electric Vehicle (EV)', subtitle: 'Battery Electric Vehicles & Hybrid' },
  { value: 'Commercial', label: 'Commercial Vehicle', subtitle: 'Goods & transport vehicles' }
];

export default function AddProtectionModal({ isOpen, onClose, onAdd, onOpenOcr, prefilledData }) {
  const [step, setStep] = useState(1); // 1: Type, 2: Category, 3: Details, 4: Coverage, 5: Documents, 6: Review
  
  // Step 1 State
  const [protectionType, setProtectionType] = useState('Warranty');

  // Step 2 State
  const [selectedCategoryId, setSelectedCategoryId] = useState('electronics');
  const [categorySearch, setCategorySearch] = useState('');

  // Step 3 & 4 State (Category Specific Dynamic Fields)
  const [brand, setBrand] = useState('Apple');
  const [customBrand, setCustomBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  
  // Health Insurance Fields
  const [planName, setPlanName] = useState('');
  const [insurer, setInsurer] = useState('Star Health Insurance');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyHolder, setPolicyHolder] = useState('SPV');
  const [coverageType, setCoverageType] = useState('Individual');
  const [sumInsured, setSumInsured] = useState('500000');

  // Vehicle Insurance Fields
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleMfr, setVehicleMfr] = useState('Maruti Suzuki');
  const [vehicleModel, setVehicleModel] = useState('');
  const [regNumber, setRegNumber] = useState('');

  // Jewellery Fields
  const [jewelleryType, setJewelleryType] = useState('Gold Necklace');
  const [jewellerName, setJewellerName] = useState('Tanishq');
  const [insuredValue, setInsuredValue] = useState('');

  // Common Financial & Date Fields
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [seller, setSeller] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [durationMonths, setDurationMonths] = useState(12);
  const [warrantyStartDate, setWarrantyStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');

  // Step 5 State - Documents
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Sync category when switching protection type
  useEffect(() => {
    if (protectionType === 'Warranty') {
      setSelectedCategoryId('electronics');
    } else {
      setSelectedCategoryId('health_insurance');
    }
  }, [protectionType]);

  // Auto-calculate Expiry Date based on purchase date and duration
  useEffect(() => {
    if (purchaseDate && durationMonths) {
      setWarrantyStartDate(purchaseDate);
      const calculated = calculateWarrantyExpiry(purchaseDate, Number(durationMonths));
      setExpiryDate(calculated.expiryDateStr);
    }
  }, [purchaseDate, durationMonths]);

  // Handle OCR prefilled data if passed
  useEffect(() => {
    if (prefilledData) {
      setStep(3);
      if (prefilledData.brand) setBrand(prefilledData.brand);
      if (prefilledData.model || prefilledData.productName) setProductName(prefilledData.model || prefilledData.productName);
      if (prefilledData.serialNumber) setSerialNumber(prefilledData.serialNumber);
      if (prefilledData.price) setPrice(prefilledData.price);
      if (prefilledData.purchaseDate) setPurchaseDate(prefilledData.purchaseDate);
      if (prefilledData.warrantyDurationMonths) setDurationMonths(prefilledData.warrantyDurationMonths);
    }
  }, [prefilledData]);

  if (!isOpen) return null;

  const currentCategoryList = protectionType === 'Warranty' ? WARRANTY_CATEGORIES : INSURANCE_CATEGORIES;
  const filteredCategories = currentCategoryList.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.examples.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const activeCategoryObj = currentCategoryList.find(c => c.id === selectedCategoryId) || currentCategoryList[0];

  // Dynamically compute the REAL brand based on protection type & category
  const getEffectiveBrand = () => {
    if (protectionType === 'Insurance') {
      if (selectedCategoryId === 'vehicle_insurance') return vehicleMfr || insurer || 'Maruti Suzuki';
      if (selectedCategoryId === 'jewellery_insurance') return jewellerName || insurer || 'Tanishq';
      return insurer || 'Star Health Insurance';
    }
    return customBrand.trim() || brand || 'Apple';
  };

  // Step validation checker to control Forward Button state
  const isStepValid = (stepNum) => {
    if (stepNum === 1) return Boolean(protectionType);
    if (stepNum === 2) return Boolean(selectedCategoryId);
    if (stepNum === 3) {
      if (protectionType === 'Warranty') {
        return Boolean((customBrand.trim() || brand) && productName.trim());
      }
      if (selectedCategoryId === 'health_insurance') {
        return Boolean(insurer.trim() && planName.trim() && policyNumber.trim());
      }
      if (selectedCategoryId === 'vehicle_insurance') {
        return Boolean(vehicleMfr.trim() && vehicleModel.trim());
      }
      if (selectedCategoryId === 'jewellery_insurance') {
        return Boolean(jewelleryType.trim() && jewellerName.trim());
      }
      return Boolean(insurer.trim());
    }
    if (stepNum === 4) {
      return Boolean(purchaseDate && Number(durationMonths) > 0);
    }
    return true;
  };

  const handleNextStep = () => {
    if (isStepValid(step)) {
      setStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!isStepValid(step)) return;

    const finalBrand = getEffectiveBrand();
    const finalModel = productName.trim() || planName.trim() || vehicleModel.trim() || jewelleryType.trim() || `${activeCategoryObj.name} Item`;
    
    const calculated = calculateWarrantyExpiry(purchaseDate, durationMonths);

    const newProtection = {
      id: `prot-${Date.now()}`,
      brand: finalBrand,
      productName: finalModel,
      model: finalModel,
      modelNumber: modelNumber || regNumber || '',
      category: activeCategoryObj.name,
      protectionType,
      status: calculated.status,
      expiryDate: expiryDate || calculated.expiryDateStr,
      expiryFormatted: calculated.expiryFormatted,
      price: Number(price || insuredValue || sumInsured) || 0,
      currency,
      seller: seller || (protectionType === 'Insurance' ? insurer : `${finalBrand} Dealer`),
      invoiceNumber: invoiceNumber || policyNumber || '',
      serialNumber: serialNumber || (regNumber ? `REG-${regNumber}` : null),
      purchaseDate,
      warrantyDurationMonths: Number(durationMonths),
      warrantyStartDate,
      warrantySource: prefilledData ? 'Invoice (OCR Scanned)' : 'User Entry',
      daysLeft: calculated.daysLeft,
      progressPercentage: calculated.progressPercentage,
      // Insurance specific attributes
      insurer: protectionType === 'Insurance' ? insurer : null,
      policyNumber: policyNumber || null,
      coverageType: coverageType || null,
      regNumber: regNumber || null,
      vehicleMfr: vehicleMfr || null,
      documents: attachedFiles.map((f, i) => ({
        id: `doc-${Date.now()}-${i}`,
        fileName: f.name,
        documentType: protectionType === 'Insurance' ? 'Insurance Policy' : 'Purchase Invoice',
        uploadDate: new Date().toISOString().split('T')[0],
        ocrStatus: 'Success',
        ocrConfidence: 98
      }))
    };

    onAdd(newProtection);
    onClose();
    // Reset wizard
    setStep(1);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header with Wizard Step Progress */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} color="#0066cc" />
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Add Protection Record</h2>
              <span style={{ fontSize: '0.75rem', color: '#6e6e73', fontWeight: 600 }}>
                Step {step} of 6 • {step === 1 ? 'Type' : step === 2 ? 'Category' : step === 3 ? 'Product / Policy' : step === 4 ? 'Coverage & Dates' : step === 5 ? 'Documents' : 'Review & Confirm'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Visual Progress Step Bar */}
        <div style={{ background: '#f8fafc', padding: '0.5rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.35rem' }}>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s <= step ? '#0066cc' : '#cbd5e1',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Wizard Body Content */}
        <div className="modal-body" style={{ minHeight: '380px' }}>
          
          {/* STEP 1: Protection Type Selection Cards */}
          {step === 1 && (
            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '0.35rem', textAlign: 'center' }}>
                Select Protection Type
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#6e6e73', textAlign: 'center', marginBottom: '1.75rem' }}>
                Choose Warranty for physical goods & electronics, or Insurance for health, vehicle & valuables.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {PROTECTION_TYPES.map((pt) => {
                  const isSelected = protectionType === pt.id;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => setProtectionType(pt.id)}
                      style={{
                        border: isSelected ? '2px solid #0066cc' : '1px solid #e5e5ea',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        background: isSelected ? '#f2f7fd' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(0,102,204,0.12)' : 'var(--shadow-sm)',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: 22, height: 22, borderRadius: '50%', background: '#0066cc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <CategoryIcon iconName={pt.iconName} size={32} color={isSelected ? '#0066cc' : '#475569'} />
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: isSelected ? '#0066cc' : '#1d1d1f', marginBottom: '0.3rem' }}>
                        {pt.title}
                      </h4>
                      <p style={{ fontSize: '0.82rem', color: '#6e6e73', lineHeight: 1.45, margin: 0 }}>
                        {pt.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                  onClick={() => { onClose(); onOpenOcr(); }}
                >
                  <FileScan size={15} color="#0066cc" />
                  <span>Or Scan Invoice / Receipt with AI</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category Searchable Card Grid */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d1d1f' }}>
                  Select {protectionType} Category
                </h3>
                <div style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search categories..."
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      style={{
                        border: isSelected ? '2px solid #0066cc' : '1px solid #e5e5ea',
                        borderRadius: '0.85rem',
                        padding: '1rem',
                        background: isSelected ? '#f2f7fd' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                        <CategoryIcon iconName={cat.iconName} size={22} color={isSelected ? '#0066cc' : '#64748b'} />
                        <strong style={{ fontSize: '0.92rem', color: isSelected ? '#0066cc' : '#1d1d1f' }}>
                          {cat.name}
                        </strong>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#6e6e73', margin: 0, lineHeight: 1.3 }}>
                        {cat.examples}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Category-Specific Dynamic Form Fields */}
          {step === 3 && (
            <div>
              {/* Category Header Badge */}
              <div style={{ background: '#f2f7fd', border: '1px solid #d0e2ff', borderRadius: '0.75rem', padding: '0.6rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0066cc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CategoryIcon iconName={activeCategoryObj.iconName} size={18} color="#0066cc" />
                  <span>{activeCategoryObj.name} ({protectionType})</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Category-specific schema fields</span>
              </div>

              {/* HEALTH INSURANCE SPECIFIC FIELDS */}
              {selectedCategoryId === 'health_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Insurance Provider Company"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={HEALTH_INSURER_OPTIONS}
                      placeholder="Select health insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Health Plan Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. Optima Secure / Health Companion" required value={planName} onChange={(e) => setPlanName(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Number *</label>
                      <input type="text" className="form-control" placeholder="e.g. P/180011/01/2026/0091" required value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Policy Holder Name</label>
                      <input type="text" className="form-control" placeholder="e.g. SPV" value={policyHolder} onChange={(e) => setPolicyHolder(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <CustomSelect
                      label="Coverage Type"
                      value={coverageType}
                      onChange={(val) => setCoverageType(val)}
                      options={COVERAGE_TYPE_OPTIONS}
                    />
                    <div className="form-group">
                      <label className="form-label">Sum Insured (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 500000" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* VEHICLE INSURANCE SPECIFIC FIELDS */}
              {selectedCategoryId === 'vehicle_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Vehicle Category"
                      value={vehicleType}
                      onChange={(val) => setVehicleType(val)}
                      options={VEHICLE_TYPE_OPTIONS}
                    />
                    <CustomSelect
                      label="Vehicle Manufacturer"
                      required
                      value={vehicleMfr}
                      onChange={(val) => setVehicleMfr(val)}
                      options={VEHICLE_MFR_OPTIONS}
                      placeholder="Select car / bike brand..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Vehicle Model Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. Swift ZXi / Nexon EV / Creta" required value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Registration Number (Plate #)</label>
                      <input type="text" className="form-control" placeholder="e.g. KA-01-MJ-9920" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <CustomSelect
                      label="Insurance Provider Company"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={HEALTH_INSURER_OPTIONS}
                      placeholder="Select motor insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Insurance Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. MOT-8819201" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* JEWELLERY SPECIFIC FIELDS */}
              {selectedCategoryId === 'jewellery_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Item / Jewellery Type *</label>
                      <input type="text" className="form-control" placeholder="e.g. 22K Gold Necklace / Diamond Ring" required value={jewelleryType} onChange={(e) => setJewelleryType(e.target.value)} />
                    </div>
                    <CustomSelect
                      label="Jeweller / Brand Name"
                      required
                      value={jewellerName}
                      onChange={(val) => setJewellerName(val)}
                      options={[
                        { value: 'Tanishq', label: 'Tanishq', brand: 'Tanishq', subtitle: 'Tata Jewelry Enterprise' },
                        { value: 'Kalyan Jewellers', label: 'Kalyan Jewellers', brand: 'Kalyan', subtitle: 'Gold & Diamond Jewellers' },
                        { value: 'Malabar Gold & Diamonds', label: 'Malabar Gold & Diamonds', brand: 'Malabar', subtitle: 'Certified Gold & Solitaires' },
                        { value: 'CaratLane', label: 'CaratLane', brand: 'CaratLane', subtitle: 'Omnichannel Diamond Jewelry' },
                      ]}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Purchase Value (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 150000" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Insured Value (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 150000" value={insuredValue} onChange={(e) => setInsuredValue(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* OTHER INSURANCE CATEGORIES (Property, Life, Travel, Device, Business, Other) */}
              {protectionType === 'Insurance' && !['health_insurance', 'vehicle_insurance', 'jewellery_insurance'].includes(selectedCategoryId) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Insurance Provider Company"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={HEALTH_INSURER_OPTIONS}
                      placeholder="Select insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Policy / Plan Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. Home Care / Term Life Cover" required value={planName} onChange={(e) => setPlanName(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. POL-99201" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sum Insured (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 500000" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* WARRANTY & ELECTRONICS SPECIFIC FIELDS */}
              {protectionType === 'Warranty' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Select Brand or Manufacturer"
                      required
                      value={brand}
                      onChange={(val) => { setBrand(val); setCustomBrand(''); }}
                      options={ELECTRONICS_BRAND_OPTIONS}
                      placeholder="Select brand with logo..."
                    />

                    <div className="form-group">
                      <label className="form-label">Or Custom Brand Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type unlisted brand..."
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Clean Brand Preview Box */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BrandLogo brand={customBrand.trim() || brand} size={28} />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#1d1d1f' }}>{customBrand.trim() || brand}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Official high-resolution brand logo verified</span>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Product Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. iPhone 16 Pro / Serie 6 Washer" required value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model Number <span style={{ color: '#6e6e73', fontWeight: 400 }}>(Optional)</span></label>
                      <input type="text" className="form-control" placeholder="e.g. A3101 / WW80T" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial / Tag Number <span style={{ color: '#6e6e73', fontWeight: 400 }}>(Optional)</span></label>
                    <input type="text" className="form-control" placeholder="Scan or enter appliance serial label..." value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Purchase & Coverage Dates */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '0.2rem' }}>
                Purchase Price & Coverage Duration
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase / Policy Date *</label>
                  <input type="date" className="form-control" required value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                </div>

                <CustomSelect
                  label="Coverage Duration"
                  required
                  value={Number(durationMonths)}
                  onChange={(val) => setDurationMonths(Number(val))}
                  options={DURATION_OPTIONS}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase / Policy Price ({currency})</label>
                  <input type="number" className="form-control" placeholder="e.g. 42999" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Seller / Retailer / Dealer</label>
                  <input type="text" className="form-control" placeholder="e.g. Amazon / Croma / Official Store" value={seller} onChange={(e) => setSeller(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Calculated Expiry Date</label>
                <div style={{ background: '#e5f9e7', border: '1px solid #bbf7d0', borderRadius: '0.65rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#248a3d' }}>
                    Active Until: {expiryDate}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
                    ✓ Auto-Calculated
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Attach Documents */}
          {step === 5 && (
            <div style={{ padding: '0.5rem 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '0.35rem' }}>
                Attach Invoices & Policy Documents
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6e6e73', marginBottom: '1.25rem' }}>
                Store tax invoices, warranty cards, or policy PDFs securely in your vault.
              </p>

              <label
                style={{
                  border: '2px dashed #0066cc',
                  borderRadius: '1rem',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: '#f2f7fd',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <input type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} />
                <Paperclip size={28} color="#0066cc" style={{ marginBottom: '0.4rem' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0066cc' }}>
                  Click to Upload Invoice / Policy Document
                </span>
                <span style={{ fontSize: '0.75rem', color: '#6e6e73', marginTop: '0.2rem' }}>
                  PDF, JPG, PNG up to 10MB
                </span>
              </label>

              {attachedFiles.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d1d1f' }}>Attached Files ({attachedFiles.length}):</span>
                  {attachedFiles.map((f, idx) => (
                    <div key={idx} style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d1d1f' }}>
                      <FileText size={14} color="#0066cc" />
                      <span>{f.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Review & Save */}
          {step === 6 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '0.85rem' }}>
                Review & Confirm Record Details
              </h3>

              <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '1rem', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderBottom: '1px solid #f2f2f7', paddingBottom: '0.75rem' }}>
                  <BrandLogo brand={getEffectiveBrand()} size={36} />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1d1d1f', margin: 0 }}>
                      {getEffectiveBrand()}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#0066cc', fontWeight: 700 }}>
                      {productName || planName || vehicleModel || jewelleryType || activeCategoryObj.name} • {protectionType}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem', color: '#1d1d1f' }}>
                  <div><strong>Purchase Date:</strong> {purchaseDate}</div>
                  <div><strong>Expiry Date:</strong> {expiryDate}</div>
                  <div><strong>Duration:</strong> {durationMonths} Months</div>
                  <div><strong>Protected Value:</strong> ₹{Number(price || sumInsured || insuredValue || 0).toLocaleString('en-IN')}</div>
                  {serialNumber && <div><strong>Serial Number:</strong> {serialNumber}</div>}
                  {policyNumber && <div><strong>Policy Number:</strong> {policyNumber}</div>}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button type="button" className="btn btn-secondary" onClick={handlePrevStep}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}

          {!isStepValid(step) && step < 6 && (
            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
              * Fill required fields to continue
            </span>
          )}

          {step < 6 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={!isStepValid(step)}
              style={{
                opacity: isStepValid(step) ? 1 : 0.45,
                cursor: isStepValid(step) ? 'pointer' : 'not-allowed',
                pointerEvents: isStepValid(step) ? 'auto' : 'none'
              }}
            >
              <span>Continue to Step {step + 1}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <CheckCircle2 size={16} />
              <span>Confirm & Save Protection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
