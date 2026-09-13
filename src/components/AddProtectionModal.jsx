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
  Camera,
  Gamepad2,
  Refrigerator,
  Utensils,
  Printer,
  Watch,
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
  Building2,
  FileCheck,
  Plus
} from 'lucide-react';
import { PROTECTION_TYPES, WARRANTY_CATEGORIES, INSURANCE_CATEGORIES } from '../data/protectionSchemas';
import BrandLogo from './BrandLogo';
import CustomSelect from './CustomSelect';
import { calculateWarrantyExpiry } from '../utils/warrantyCalculator';

// Map icon names to clean Lucide icon components
const ICON_MAP = {
  ShieldCheck,
  FileText,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Camera,
  Gamepad2,
  Refrigerator,
  Utensils,
  Printer,
  Watch,
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
  Building2,
  FileCheck
};

const CategoryIcon = ({ iconName, size = 20, color = '#0066cc' }) => {
  const IconComp = ICON_MAP[iconName] || Package;
  return <IconComp size={size} color={color} />;
};

// Insurance and Warranty Subtypes matching the user's requested layout
const INSURANCE_SUBTYPES = [
  { id: 'health', label: 'Health', icon: HeartPulse, color: '#dc2626', bg: '#fef2f2', categoryId: 'health_insurance', defaultInsurer: 'Care Health Insurance' },
  { id: 'life', label: 'Life', icon: User, color: '#7c3aed', bg: '#f5f3ff', categoryId: 'life_insurance', defaultInsurer: 'LIC of India' },
  { id: 'vehicle', label: 'Vehicle', icon: Car, color: '#d97706', bg: '#fffbeb', categoryId: 'vehicle_insurance', defaultInsurer: 'Digit Insurance' },
  { id: 'travel', label: 'Travel', icon: Plane, color: '#0891b2', bg: '#ecfeff', categoryId: 'travel_insurance', defaultInsurer: 'Tata AIG Travel' },
  { id: 'device', label: 'Device', icon: Smartphone, color: '#2563eb', bg: '#eff6ff', categoryId: 'device_insurance', defaultInsurer: 'AppleCare+' },
  { id: 'property', label: 'Property', icon: Home, color: '#16a34a', bg: '#f0fdf4', categoryId: 'property_insurance', defaultInsurer: 'HDFC ERGO' },
  { id: 'business', label: 'Business', icon: Building2, color: '#475569', bg: '#f8fafc', categoryId: 'business_insurance', defaultInsurer: 'HDFC ERGO' },
  { id: 'jewellery', label: 'Jewellery', icon: Gem, color: '#b45309', bg: '#fffbeb', categoryId: 'jewellery_insurance', defaultInsurer: 'Tanishq' },
  { id: 'term', label: 'Term Life', icon: ShieldCheck, color: '#0f172a', bg: '#f8fafc', categoryId: 'life_insurance', defaultInsurer: 'LIC of India' },
];

const WARRANTY_SUBTYPES = [
  { id: 'mobiles', label: 'Mobiles', icon: Smartphone, color: '#0066cc', bg: '#eff6ff', categoryId: 'mobiles' },
  { id: 'computers', label: 'Computers', icon: Laptop, color: '#0066cc', bg: '#eff6ff', categoryId: 'computers' },
  { id: 'tv', label: 'TV', icon: Tv, color: '#0066cc', bg: '#eff6ff', categoryId: 'tv' },
  { id: 'audio', label: 'Audio', icon: Headphones, color: '#0066cc', bg: '#eff6ff', categoryId: 'audio' },
  { id: 'cameras', label: 'Cameras', icon: Camera, color: '#0066cc', bg: '#eff6ff', categoryId: 'cameras' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: '#0066cc', bg: '#eff6ff', categoryId: 'gaming' },
  { id: 'appliances', label: 'Appliances', icon: Refrigerator, color: '#0066cc', bg: '#eff6ff', categoryId: 'appliances' },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils, color: '#0066cc', bg: '#eff6ff', categoryId: 'kitchen' },
  { id: 'printers', label: 'Printers', icon: Printer, color: '#0066cc', bg: '#eff6ff', categoryId: 'printers' },
  { id: 'wearables', label: 'Wearables', icon: Watch, color: '#0066cc', bg: '#eff6ff', categoryId: 'wearables' },
  { id: 'furniture', label: 'Furniture', icon: Sofa, color: '#0066cc', bg: '#eff6ff', categoryId: 'furniture' },
  { id: 'tools', label: 'Tools', icon: Wrench, color: '#0066cc', bg: '#eff6ff', categoryId: 'tools' },
  { id: 'other_warranty', label: 'Other', icon: Package, color: '#0066cc', bg: '#eff6ff', categoryId: 'other_warranty' }
];

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
  { value: 'Care Health Insurance', label: 'Care Health Insurance', brand: 'Care Health', subtitle: 'Comprehensive Family & Critical Cover' },
  { value: 'Star Health Insurance', label: 'Star Health Insurance', brand: 'Star Health', subtitle: 'Health Insurance Specialist' },
  { value: 'Niva Bupa Health Insurance', label: 'Niva Bupa Health Insurance', brand: 'Niva Bupa', subtitle: 'Reassurance & Max Health Cover' },
  { value: 'ICICI Lombard', label: 'ICICI Lombard Health', brand: 'ICICI Lombard', subtitle: 'Complete Health Cover' },
  { value: 'HDFC ERGO', label: 'HDFC ERGO Health', brand: 'HDFC ERGO', subtitle: 'Optima Secure & Health Suraksha' },
  { value: 'Bajaj Allianz', label: 'Bajaj Allianz General Insurance', brand: 'Bajaj Allianz', subtitle: 'Health & Personal Accident' },
  { value: 'Tata AIG', label: 'Tata AIG Health Insurance', brand: 'Tata AIG', subtitle: 'Medicare & Critical Care' },
  { value: 'Aditya Birla Health', label: 'Aditya Birla Health Insurance', brand: 'Aditya Birla', subtitle: 'Activ Health & Wellness' },
  { value: 'Digit Insurance', label: 'Digit Insurance', brand: 'Digit', subtitle: 'Zero Hassle Health Cover' },
  { value: 'ManipalCigna Health', label: 'ManipalCigna Health Insurance', brand: 'ManipalCigna', subtitle: 'ProHealth & Critical Illness' },
  { value: 'SBI General Insurance', label: 'SBI General Insurance', brand: 'SBI', subtitle: 'Arogya Sanjeevani & Health' },
  { value: 'Acko Insurance', label: 'Acko General Insurance', brand: 'Acko', subtitle: 'Digital 100% Cashless Health Cover' }
];

const LIFE_INSURER_OPTIONS = [
  { value: 'LIC of India', label: 'LIC of India', brand: 'LIC', subtitle: 'Life Insurance Corporation of India' },
  { value: 'HDFC Life Insurance', label: 'HDFC Life Insurance', brand: 'HDFC Life', subtitle: 'Click 2 Protect & Sanchay' },
  { value: 'SBI Life Insurance', label: 'SBI Life Insurance', brand: 'SBI Life', subtitle: 'eShield & Smart Wealth' },
  { value: 'ICICI Prudential Life', label: 'ICICI Prudential Life', brand: 'ICICI Prudential', subtitle: 'iProtect Smart Term & Savings' },
  { value: 'Max Life Insurance', label: 'Max Life Insurance', brand: 'Max Life', subtitle: 'Smart Term & Critical Care' },
  { value: 'Tata AIA Life Insurance', label: 'Tata AIA Life Insurance', brand: 'Tata AIA', subtitle: 'Sampoorna Raksha & Fortune' },
  { value: 'Bajaj Allianz Life', label: 'Bajaj Allianz Life', brand: 'Bajaj Allianz', subtitle: 'eTouch & Smart Protect' },
  { value: 'Kotak Mahindra Life', label: 'Kotak Mahindra Life', brand: 'Kotak Life', subtitle: 'e-Term & Premier Income' }
];

const MOTOR_INSURER_OPTIONS = [
  { value: 'Digit Insurance', label: 'Digit Motor Insurance', brand: 'Digit', subtitle: 'Car & Two Wheeler Zero Dep Cover' },
  { value: 'Acko Insurance', label: 'Acko Motor Insurance', brand: 'Acko', subtitle: 'Direct-to-Consumer Instant Claim' },
  { value: 'ICICI Lombard', label: 'ICICI Lombard Motor', brand: 'ICICI Lombard', subtitle: 'Comprehensive & Roadside Assist' },
  { value: 'HDFC ERGO', label: 'HDFC ERGO Motor', brand: 'HDFC ERGO', subtitle: 'Unlimited Cashless Garages' },
  { value: 'Tata AIG', label: 'Tata AIG Auto Secure', brand: 'Tata AIG', subtitle: 'Engine Protect & Return to Invoice' },
  { value: 'Bajaj Allianz', label: 'Bajaj Allianz DriveSmart', brand: 'Bajaj Allianz', subtitle: 'Motor Shield & Telematics' },
  { value: 'Reliance General', label: 'Reliance Motor Insurance', brand: 'Reliance General', subtitle: 'Instant Digital Policy & Renewal' },
  { value: 'SBI General', label: 'SBI Motor Insurance', brand: 'SBI', subtitle: 'Commercial & Private Vehicle Cover' },
  { value: 'New India Assurance', label: 'New India Assurance Motor', brand: 'New India', subtitle: 'Government PSU Motor Protection' }
];

const DEVICE_PROTECTION_OPTIONS = [
  { value: 'AppleCare+', label: 'AppleCare+ Protection Plan', brand: 'Apple', subtitle: 'Official Apple Unlimited Accidental Damage' },
  { value: 'Samsung Care+', label: 'Samsung Care+ Protection', brand: 'Samsung', subtitle: 'Official Samsung Screen & Liquid Cover' },
  { value: 'OneAssist', label: 'OneAssist Device Protection', brand: 'OneAssist', subtitle: 'Mobile, Laptop & Appliance Theft/Damage' },
  { value: 'Servify', label: 'Servify Extended Protection', brand: 'Servify', subtitle: 'Brand-Authorized Device Shield' },
  { value: 'Cashify Protect', label: 'Cashify Screen Protection', brand: 'Cashify', subtitle: 'Instant Screen Replacement Warranty' },
  { value: 'Reliance ResQ', label: 'Reliance ResQ Extended Warranty', brand: 'Reliance Digital', subtitle: 'Home Appliance & Device Care Plan' }
];

const TRAVEL_INSURER_OPTIONS = [
  { value: 'Tata AIG Travel', label: 'Tata AIG Travel Insurance', brand: 'Tata AIG', subtitle: 'International & Schengen Travel Guard' },
  { value: 'HDFC ERGO Travel', label: 'HDFC ERGO Travel Insurance', brand: 'HDFC ERGO', subtitle: 'Single Trip & Multi-Trip Global Cover' },
  { value: 'Reliance General Travel', label: 'Reliance Travel Insurance', brand: 'Reliance General', subtitle: 'Worldwide Medical & Baggage Cover' },
  { value: 'Bajaj Allianz Travel', label: 'Bajaj Allianz Travel Elite', brand: 'Bajaj Allianz', subtitle: 'Overseas & Domestic Travel Cover' },
  { value: 'Digit Travel', label: 'Digit International Travel', brand: 'Digit', subtitle: 'Zero Hassle Flight & Baggage Delay' },
  { value: 'ICICI Lombard Travel', label: 'ICICI Lombard Travel Care', brand: 'ICICI Lombard', subtitle: 'Global Healthcare & Trip Cancellation' }
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

export default function AddProtectionModal({ isOpen, onClose, onAdd, onOpenOcr, prefilledData, initialProtectionType }) {
  const [step, setStep] = useState(1); // 1: Type, 2: Category, 3: Details, 4: Coverage, 5: Documents, 6: Review
  
  // Step 1 All-in-One Selector State
  const [selectedTypeId, setSelectedTypeId] = useState(initialProtectionType === 'Insurance' ? 'insurance' : 'warranty');
  const [step1Filter, setStep1Filter] = useState(initialProtectionType === 'Insurance' ? 'insurance' : 'all');
  const [protectionType, setProtectionType] = useState(initialProtectionType === 'Insurance' ? 'Insurance' : 'Warranty');
  const [insuranceType, setInsuranceType] = useState('health');

  // Step 2 State
  const [selectedCategoryId, setSelectedCategoryId] = useState('mobiles');
  const [categorySearch, setCategorySearch] = useState('');

  // Step 3 & 4 State (Category Specific Dynamic Fields)
  const [brand, setBrand] = useState('Apple');
  const [customBrand, setCustomBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  
  // Health & General Insurance Fields
  const [planName, setPlanName] = useState('');
  const [insurer, setInsurer] = useState('Care Health Insurance');
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyHolder, setPolicyHolder] = useState('SPV');
  const [coverageType, setCoverageType] = useState('Individual');
  const [sumInsured, setSumInsured] = useState('500000');

  // Life / Term Insurance Fields
  const [nomineeName, setNomineeName] = useState('Family Nominee');

  // Vehicle Insurance Fields
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleMfr, setVehicleMfr] = useState('Maruti Suzuki');
  const [vehicleModel, setVehicleModel] = useState('');
  const [regNumber, setRegNumber] = useState('');

  // Travel Insurance Fields
  const [destination, setDestination] = useState('International / Schengen');

  // Device Protection Fields
  const [devicePlan, setDevicePlan] = useState('AppleCare+');

  // Business Insurance Fields
  const [businessName, setBusinessName] = useState('');
  const [businessPolicyType, setBusinessPolicyType] = useState('Shopkeeper Package Policy');

  // Property Insurance Fields
  const [propertyAddress, setPropertyAddress] = useState('');

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

  // Multi-add toast status
  const [justSavedMessage, setJustSavedMessage] = useState('');

  // Step 5 State - Documents
  const [attachedFiles, setAttachedFiles] = useState([]);

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
      const isIns = prefilledData.protectionType === 'Insurance' || (prefilledData.category || '').toLowerCase().includes('insurance');
      if (isIns) {
        setProtectionType('Insurance');
        if (prefilledData.brand || prefilledData.insurer) setInsurer(prefilledData.brand || prefilledData.insurer);
        if (prefilledData.policyNumber || prefilledData.serialNumber) setPolicyNumber(prefilledData.policyNumber || prefilledData.serialNumber);
        if (prefilledData.customerName || prefilledData.policyholder) setPolicyHolder(prefilledData.customerName || prefilledData.policyholder);
        if (prefilledData.sumInsured) setSumInsured(prefilledData.sumInsured);
        if (prefilledData.purchaseDate) setPurchaseDate(prefilledData.purchaseDate);
        if (prefilledData.price) setPrice(prefilledData.price);
        if (prefilledData.planName || prefilledData.productName) setPlanName(prefilledData.planName || prefilledData.productName);
      } else {
        setProtectionType('Warranty');
        if (prefilledData.brand) setBrand(prefilledData.brand);
        if (prefilledData.model || prefilledData.productName) setProductName(prefilledData.model || prefilledData.productName);
        if (prefilledData.serialNumber) setSerialNumber(prefilledData.serialNumber);
        if (prefilledData.price) setPrice(prefilledData.price);
        if (prefilledData.purchaseDate) setPurchaseDate(prefilledData.purchaseDate);
        if (prefilledData.warrantyDurationMonths) setDurationMonths(prefilledData.warrantyDurationMonths);
      }
    }
  }, [prefilledData]);

  useEffect(() => {
    if (isOpen && !prefilledData) {
      if (initialProtectionType === 'Insurance') {
        setSelectedTypeId('insurance');
        setStep1Filter('insurance');
        setProtectionType('Insurance');
      } else if (initialProtectionType === 'Warranty') {
        setSelectedTypeId('warranty');
        setStep1Filter('warranty');
        setProtectionType('Warranty');
      }
    }
  }, [isOpen, initialProtectionType, prefilledData]);

  if (!isOpen) return null;

  const handleSelectType = (typeItem) => {
    setSelectedTypeId(typeItem.id);
    setProtectionType(typeItem.protectionType);
    if (typeItem.insuranceType) {
      setInsuranceType(typeItem.insuranceType);
    }
    setSelectedCategoryId(typeItem.categoryId);
    // Set sensible insurer default based on category
    if (typeItem.id === 'term' || typeItem.id === 'life') {
      setInsurer('LIC of India');
    } else if (typeItem.id === 'vehicle') {
      setInsurer('Digit Insurance');
    } else if (typeItem.id === 'travel') {
      setInsurer('Tata AIG Travel');
    } else if (typeItem.id === 'device') {
      setInsurer('AppleCare+');
    } else if (typeItem.id === 'health') {
      setInsurer('Care Health Insurance');
    }
  };

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
      if (selectedCategoryId === 'device_insurance') return devicePlan || brand || 'Apple';
      if (selectedCategoryId === 'business_insurance') return businessName || insurer || 'HDFC ERGO';
      return insurer || 'Care Health Insurance';
    }
    return customBrand.trim() || brand || 'Apple';
  };

  // Step validation checker to control Forward Button state
  const isStepValid = (stepNum) => {
    if (stepNum === 1) return Boolean(protectionType && selectedCategoryId);
    if (stepNum === 2) return Boolean(selectedCategoryId);
    if (stepNum === 3) {
      if (protectionType === 'Warranty') {
        return Boolean((customBrand.trim() || brand) && productName.trim());
      }
      if (selectedCategoryId === 'health_insurance') {
        return Boolean(insurer.trim() && planName.trim());
      }
      if (selectedCategoryId === 'life_insurance') {
        return Boolean(insurer.trim() && planName.trim());
      }
      if (selectedCategoryId === 'vehicle_insurance') {
        return Boolean(vehicleMfr.trim() && vehicleModel.trim());
      }
      if (selectedCategoryId === 'jewellery_insurance') {
        return Boolean(jewelleryType.trim() && jewellerName.trim());
      }
      if (selectedCategoryId === 'device_insurance') {
        return Boolean(productName.trim());
      }
      return Boolean(insurer.trim() || planName.trim());
    }
    if (stepNum === 4) {
      return Boolean(purchaseDate && Number(durationMonths) > 0);
    }
    return true;
  };

  const handleNextStep = () => {
    if (isStepValid(step)) {
      if (step === 1) {
        setStep(3); // Directly advance to tailored details schema
      } else {
        setStep(prev => Math.min(prev + 1, 6));
      }
    }
  };

  const handlePrevStep = () => {
    if (step === 3) {
      setStep(1); // Return directly to Type & Category selection
    } else {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const resetFormForNext = () => {
    setProductName('');
    setPlanName('');
    setModelNumber('');
    setSerialNumber('');
    setPolicyNumber('');
    setPrice('');
    setInsuredValue('');
    setSumInsured('500000');
    setRegNumber('');
    setVehicleModel('');
    setBusinessName('');
    setAttachedFiles([]);
    setStep(1);
  };

  const handleSave = (e, addAnother = false) => {
    if (e) e.preventDefault();
    if (!isStepValid(step)) return;

    const finalBrand = getEffectiveBrand();
    const finalModel = productName.trim() || planName.trim() || vehicleModel.trim() || jewelleryType.trim() || businessName.trim() || `${activeCategoryObj.name} Policy`;
    
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
      nomineeName: nomineeName || null,
      destination: destination || null,
      devicePlan: devicePlan || null,
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

    if (addAnother) {
      setJustSavedMessage(`✓ "${finalModel}" saved successfully! You can now add your next warranty or insurance policy.`);
      resetFormForNext();
    } else {
      onClose();
      resetFormForNext();
    }
  };

  const currentLogicalStep = step === 1 ? 1 : step === 2 ? 1 : step - 1;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header with Wizard Step Progress */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={24} color="#0066cc" />
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Add Protection Record</h2>
              <span style={{ fontSize: '0.75rem', color: '#6e6e73', fontWeight: 600 }}>
                {step === 1 && 'Step 1 of 5 • Choose Protection & Category'}
                {step === 2 && 'Step 1 of 5 • Browse All Categories'}
                {step === 3 && 'Step 2 of 5 • Details & Policy Info'}
                {step === 4 && 'Step 3 of 5 • Coverage & Dates'}
                {step === 5 && 'Step 4 of 5 • Document Upload'}
                {step === 6 && 'Step 5 of 5 • Review & Confirm'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Visual Progress Step Bar (5 logical steps) */}
        <div style={{ background: '#f8fafc', padding: '0.5rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0.35rem' }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s <= currentLogicalStep ? '#0066cc' : '#cbd5e1',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Multi-add success notification banner */}
        {justSavedMessage && (
          <div style={{
            background: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            color: '#15803d',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            <span>{justSavedMessage}</span>
            <button
              onClick={() => setJustSavedMessage('')}
              style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 900 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Wizard Body Content */}
        <div className="modal-body" style={{ minHeight: '400px' }}>
          
          {/* STEP 1: Two Primary Cards + Subcategory Grid matching uploaded design */}
          {step === 1 && (
            <div style={{ padding: '0.2rem 0' }}>
              
              {/* 1. TOP 2 PRIMARY CARDS: Warranty Protection vs Insurance Policy */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {/* Card 1: Warranty Protection */}
                <div
                  onClick={() => {
                    setProtectionType('Warranty');
                    if (selectedCategoryId.includes('_insurance')) {
                      setSelectedCategoryId('mobiles');
                    }
                  }}
                  style={{
                    border: protectionType === 'Warranty' ? '2.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1.1rem 1.25rem',
                    background: protectionType === 'Warranty' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: protectionType === 'Warranty' ? '0 4px 16px rgba(37, 99, 235, 0.12)' : 'var(--shadow-sm)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: protectionType === 'Warranty' ? '#2563eb' : '#f1f5f9',
                    color: protectionType === 'Warranty' ? '#ffffff' : '#0066cc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={26} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: protectionType === 'Warranty' ? '#1d4ed8' : '#0f172a', margin: 0 }}>
                        Warranty Protection
                      </h4>
                      {protectionType === 'Warranty' && (
                        <span style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#2563eb',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                      Appliances, phones, computers, audio & products
                    </p>
                  </div>
                </div>

                {/* Card 2: Insurance Policy */}
                <div
                  onClick={() => {
                    setProtectionType('Insurance');
                    if (!selectedCategoryId.includes('_insurance')) {
                      setSelectedCategoryId('health_insurance');
                      setInsuranceType('health');
                      setInsurer('Care Health Insurance');
                    }
                  }}
                  style={{
                    border: protectionType === 'Insurance' ? '2.5px solid #2563eb' : '1.5px solid #e2e8f0',
                    borderRadius: '1rem',
                    padding: '1.1rem 1.25rem',
                    background: protectionType === 'Insurance' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: protectionType === 'Insurance' ? '0 4px 16px rgba(37, 99, 235, 0.12)' : 'var(--shadow-sm)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: protectionType === 'Insurance' ? '#2563eb' : '#f1f5f9',
                    color: protectionType === 'Insurance' ? '#ffffff' : '#0066cc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileText size={26} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: protectionType === 'Insurance' ? '#1d4ed8' : '#0f172a', margin: 0 }}>
                        Insurance Policy
                      </h4>
                      {protectionType === 'Insurance' && (
                        <span style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#2563eb',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                      Health, life, vehicle, travel, property, jewellery & business
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. SUBCATEGORY SELECTOR MATCHING USER SCREENSHOT */}
              {protectionType === 'Insurance' ? (
                <div style={{ marginBottom: '1.35rem' }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#64748b',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '0.85rem'
                  }}>
                    SELECT INSURANCE TYPE
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                    gap: '0.65rem'
                  }}>
                    {INSURANCE_SUBTYPES.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSelected = insuranceType === sub.id || (sub.id === 'health' && selectedCategoryId === 'health_insurance' && (!insuranceType || insuranceType === 'health'));
                      const activeBorder = sub.color || '#ef4444';
                      const activeBg = sub.bg || '#fef2f2';

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setInsuranceType(sub.id);
                            setSelectedCategoryId(sub.categoryId);
                            if (sub.defaultInsurer) {
                              setInsurer(sub.defaultInsurer);
                            }
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '86px',
                            padding: '0.85rem 0.35rem',
                            borderRadius: '0.85rem',
                            border: isSelected ? `2px solid ${activeBorder}` : '1.5px solid #e2e8f0',
                            background: isSelected ? activeBg : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            boxShadow: isSelected ? `0 4px 12px ${activeBorder}22` : 'none',
                            outline: 'none'
                          }}
                        >
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: isSelected ? sub.color : '#eef2f6',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.45rem',
                            transition: 'all 0.18s ease'
                          }}>
                            <SubIcon size={19} strokeWidth={isSelected ? 2.5 : 2} />
                          </div>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? sub.color : '#334155',
                            lineHeight: 1.1,
                            textAlign: 'center'
                          }}>
                            {sub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.35rem' }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#64748b',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '0.85rem'
                  }}>
                    SELECT WARRANTY CATEGORY
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                    gap: '0.65rem'
                  }}>
                    {WARRANTY_SUBTYPES.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSelected = selectedCategoryId === sub.categoryId;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(sub.categoryId);
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '86px',
                            padding: '0.85rem 0.35rem',
                            borderRadius: '0.85rem',
                            border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.16)' : 'none',
                            outline: 'none'
                          }}
                        >
                          <div style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: isSelected ? '#2563eb' : '#eef2f6',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.45rem',
                            transition: 'all 0.18s ease'
                          }}>
                            <SubIcon size={19} strokeWidth={isSelected ? 2.5 : 2} />
                          </div>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? '#1d4ed8' : '#334155',
                            lineHeight: 1.1,
                            textAlign: 'center'
                          }}>
                            {sub.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scan Receipt / Policy with AI – Minimal, Clean & Polished */}
              <div
                onClick={() => { onClose(); onOpenOcr(); }}
                style={{
                  marginTop: '1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.85rem',
                  padding: '0.85rem 1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '0.65rem',
                    background: '#eff6ff',
                    border: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0066cc',
                    flexShrink: 0
                  }}>
                    <FileScan size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.15rem' }}>
                      Scan Receipt / Policy with AI
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                      Upload invoice photo, store receipt or policy PDF to extract details automatically
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '0.55rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <FileScan size={14} color="#0066cc" />
                  <span>Scan with AI</span>
                </div>
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
                <span style={{ fontSize: '0.75rem', color: '#6e6e73' }}>Tailored Policy Schema</span>
              </div>

              {/* 1. HEALTH INSURANCE SPECIFIC FIELDS */}
              {selectedCategoryId === 'health_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Health Insurance Provider"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={HEALTH_INSURER_OPTIONS}
                      placeholder="Select health insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Health Plan Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. Care Supreme / Optima Secure / Star Comprehensive" required value={planName} onChange={(e) => setPlanName(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Number *</label>
                      <input type="text" className="form-control" placeholder="e.g. 180011/01/2026/0091" required value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Primary Policyholder Name</label>
                      <input type="text" className="form-control" placeholder="e.g. John Doe" value={policyHolder} onChange={(e) => setPolicyHolder(e.target.value)} />
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

              {/* 2. LIFE & TERM INSURANCE SPECIFIC FIELDS */}
              {selectedCategoryId === 'life_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Life / Term Insurer"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={LIFE_INSURER_OPTIONS}
                      placeholder="Select life insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Plan / Policy Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. Tech Term / Click 2 Protect / eShield" required value={planName} onChange={(e) => setPlanName(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Number *</label>
                      <input type="text" className="form-control" placeholder="e.g. POL-LIFE-8819201" required value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sum Assured / Death Benefit (₹) *</label>
                      <input type="number" className="form-control" placeholder="e.g. 10000000 (1 Crore)" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Life Assured Name</label>
                      <input type="text" className="form-control" placeholder="e.g. John Doe" value={policyHolder} onChange={(e) => setPolicyHolder(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nominee Name</label>
                      <input type="text" className="form-control" placeholder="e.g. Spouse / Parent Nominee" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. VEHICLE INSURANCE SPECIFIC FIELDS */}
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
                      <input type="text" className="form-control" placeholder="e.g. TS-08-AB-1234" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <CustomSelect
                      label="Motor Insurance Company"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={MOTOR_INSURER_OPTIONS}
                      placeholder="Select motor insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Insurance Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. MOT-8819201" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. TRAVEL INSURANCE SPECIFIC FIELDS */}
              {selectedCategoryId === 'travel_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Travel Insurer"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={TRAVEL_INSURER_OPTIONS}
                      placeholder="Select travel insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Travel Destination / Zone *</label>
                      <input type="text" className="form-control" placeholder="e.g. Schengen Europe / USA & Canada / Southeast Asia" required value={destination} onChange={(e) => setDestination(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. TRV-99201" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Emergency Medical Cover (₹ / $)</label>
                      <input type="number" className="form-control" placeholder="e.g. 500000" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. DEVICE PROTECTION SPECIFIC FIELDS */}
              {selectedCategoryId === 'device_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Protection Provider Plan"
                      required
                      value={devicePlan}
                      onChange={(val) => { setDevicePlan(val); setInsurer(val); }}
                      options={DEVICE_PROTECTION_OPTIONS}
                    />
                    <div className="form-group">
                      <label className="form-label">Device Name & Model *</label>
                      <input type="text" className="form-control" placeholder="e.g. iPhone 16 Pro / MacBook Air M3" required value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Serial Number / IMEI</label>
                      <input type="text" className="form-control" placeholder="e.g. 354892019284719 / DX3L9..." value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Plan Agreement / Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. AC-992019" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. BUSINESS INSURANCE SPECIFIC FIELDS */}
              {selectedCategoryId === 'business_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Enterprise / Business Name *</label>
                      <input type="text" className="form-control" placeholder="e.g. Sri Balaji Enterprises / Tech Hub" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                    </div>
                    <CustomSelect
                      label="Commercial Insurer"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={HEALTH_INSURER_OPTIONS}
                      placeholder="Select commercial insurer..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Package Type</label>
                      <input type="text" className="form-control" placeholder="e.g. Shopkeeper Package / Fire & Asset / Liability" value={businessPolicyType} onChange={(e) => setBusinessPolicyType(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. BIZ-POL-99201" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Asset Value Covered (₹)</label>
                    <input type="number" className="form-control" placeholder="e.g. 2500000" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                  </div>
                </div>
              )}

              {/* 7. JEWELLERY SPECIFIC FIELDS */}
              {selectedCategoryId === 'jewellery_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Item / Jewellery Type *</label>
                      <input type="text" className="form-control" placeholder="e.g. 22K Gold Necklace / Diamond Solitaire Ring" required value={jewelleryType} onChange={(e) => setJewelleryType(e.target.value)} />
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

              {/* 8. HOME / PROPERTY SPECIFIC FIELDS */}
              {selectedCategoryId === 'property_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-row">
                    <CustomSelect
                      label="Property Insurer"
                      required
                      value={insurer}
                      onChange={(val) => setInsurer(val)}
                      options={HEALTH_INSURER_OPTIONS}
                      placeholder="Select property insurer..."
                    />
                    <div className="form-group">
                      <label className="form-label">Property Address / City *</label>
                      <input type="text" className="form-control" placeholder="e.g. Flat 402, Secunderabad, Telangana" required value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Policy Number</label>
                      <input type="text" className="form-control" placeholder="e.g. HOME-POL-99201" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Structure & Contents Cover (₹)</label>
                      <input type="number" className="form-control" placeholder="e.g. 5000000" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* 9. WARRANTY & ELECTRONICS SPECIFIC FIELDS */}
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
                      <input type="text" className="form-control" placeholder="e.g. iPhone 16 Pro / Serie 6 Washer / ThinkPad X1" required value={productName} onChange={(e) => setProductName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model Number <span style={{ color: '#6e6e73', fontWeight: 400 }}>(Optional)</span></label>
                      <input type="text" className="form-control" placeholder="e.g. A3101 / WW80T" value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Serial Number (S/N) <span style={{ color: '#6e6e73', fontWeight: 400 }}>(Optional)</span></label>
                    <input type="text" className="form-control" placeholder="e.g. F2LZ992019" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STEP 4: Financial, Dates & Duration */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d1d1f', marginBottom: '0.25rem' }}>
                Coverage Dates & Financials
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{protectionType === 'Insurance' ? 'Policy Start / Purchase Date *' : 'Purchase Date *'}</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                  />
                </div>

                <CustomSelect
                  label={protectionType === 'Insurance' ? 'Policy Duration' : 'Warranty Duration'}
                  required
                  value={durationMonths}
                  onChange={(val) => setDurationMonths(val)}
                  options={DURATION_OPTIONS}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase Price / Premium Paid</label>
                  <div style={{ display: 'flex' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 0.85rem', background: '#f8fafc', border: '1px solid #e5e5ea', borderRight: 'none', borderRadius: '0.5rem 0 0 0.5rem', fontWeight: 700, color: '#6e6e73' }}>₹</span>
                    <input
                      type="number"
                      className="form-control"
                      style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                      placeholder="e.g. 79999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{protectionType === 'Insurance' ? 'Agent / Seller / Portal' : 'Retailer / Store Name'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Amazon / Croma / PolicyBazaar"
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                  />
                </div>
              </div>

              {/* Real-time Expiry Preview Banner */}
              <div style={{ background: '#f2f7fd', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem' }}>
                <CheckCircle2 size={24} color="#0066cc" />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0066cc', display: 'block' }}>
                    Calculated Expiry Date: {expiryDate || 'Calculating...'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                    Automatic expiration calculation based on {durationMonths} months duration.
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
                      {productName || planName || vehicleModel || jewelleryType || businessName || activeCategoryObj.name} • {protectionType}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem', color: '#1d1d1f' }}>
                  <div><strong>Category:</strong> {activeCategoryObj.name}</div>
                  <div><strong>Start Date:</strong> {purchaseDate}</div>
                  <div><strong>Expiry Date:</strong> {expiryDate}</div>
                  <div><strong>Duration:</strong> {durationMonths} Months</div>
                  <div><strong>Protected Value:</strong> ₹{Number(price || sumInsured || insuredValue || 0).toLocaleString('en-IN')}</div>
                  {serialNumber && <div><strong>Serial Number:</strong> {serialNumber}</div>}
                  {policyNumber && <div><strong>Policy Number:</strong> {policyNumber}</div>}
                  {regNumber && <div><strong>Registration Plate:</strong> {regNumber}</div>}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation Actions */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
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
              <span>
                {step === 1 ? 'Continue to Details' : step === 2 ? 'Continue to Details' : step === 3 ? 'Continue to Coverage' : step === 4 ? 'Continue to Documents' : 'Review & Confirm'}
              </span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={(e) => handleSave(e, true)}
                style={{ fontWeight: 700, borderColor: '#bfdbfe', color: '#1d4ed8', background: '#eff6ff' }}
                title="Save this record and immediately add another warranty or insurance"
              >
                <Plus size={16} />
                <span>Save & Add Another</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={(e) => handleSave(e, false)}>
                <CheckCircle2 size={16} />
                <span>Confirm & Save</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
