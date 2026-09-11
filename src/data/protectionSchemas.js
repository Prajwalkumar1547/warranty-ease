// Comprehensive Protection Schemas for Schema-Driven Add Protection Wizard

export const PROTECTION_TYPES = [
  {
    id: 'Warranty',
    title: 'Warranty Protection',
    description: 'For electronics, computers, appliances, furniture, tools & equipment.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'Insurance',
    title: 'Insurance Policy',
    description: 'For health, vehicle, life, property/home, jewellery, travel & business.',
    iconName: 'FileText'
  }
];

export const WARRANTY_CATEGORIES = [
  { id: 'electronics', name: 'Electronics & Gadgets', iconName: 'Smartphone', examples: 'Phones, tablets, cameras', popularBrands: ['Apple', 'Samsung', 'Sony', 'OnePlus', 'Google', 'Xiaomi', 'Vivo', 'Realme'] },
  { id: 'computers', name: 'Computers & Laptops', iconName: 'Laptop', examples: 'Laptops, monitors, desktops', popularBrands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft'] },
  { id: 'audio', name: 'Audio & Wearables', iconName: 'Headphones', examples: 'Smart glasses, headphones, smartwatches, speakers', popularBrands: ['Meta', 'Lenskart', 'Apple', 'Sony', 'Bose', 'JBL', 'Sennheiser', 'boAt', 'Noise'] },
  { id: 'appliances', name: 'Home Appliances', iconName: 'Tv', examples: 'Washing machine, AC, refrigerator', popularBrands: ['Samsung', 'LG', 'Bosch', 'Dyson', 'Whirlpool', 'Godrej', 'Haier', 'Voltas'] },
  { id: 'kitchen', name: 'Kitchen Appliances', iconName: 'Utensils', examples: 'Microwave, mixer, coffee machine', popularBrands: ['Philips', 'Bosch', 'Panasonic', 'Prestige', 'Morphy Richards'] },
  { id: 'furniture', name: 'Furniture', iconName: 'Sofa', examples: 'Sofa, table, office chair', popularBrands: ['IKEA', 'Godrej Interio', 'Urban Ladder', 'Pepperfry'] },
  { id: 'tools', name: 'Tools & Equipment', iconName: 'Wrench', examples: 'Drill, machinery, power tools', popularBrands: ['Bosch', 'DeWalt', 'Makita', 'Stanley'] },
  { id: 'other_warranty', name: 'Other Product', iconName: 'Package', examples: 'Any product not listed above', popularBrands: [] }
];

export const INSURANCE_CATEGORIES = [
  { id: 'health_insurance', name: 'Health Insurance', iconName: 'HeartPulse', examples: 'Individual, family floater, critical illness', insurers: ['Star Health Insurance', 'HDFC ERGO', 'Niva Bupa Health Insurance', 'Care Health Insurance', 'ICICI Lombard', 'SBI General Insurance'] },
  { id: 'vehicle_insurance', name: 'Vehicle Insurance', iconName: 'Car', examples: 'Car, motorcycle, EV, commercial', vehicleMfrs: ['Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Honda', 'Toyota', 'Mahindra', 'Kia', 'Hero', 'TVS'], insurers: ['ICICI Lombard', 'Bajaj Allianz', 'HDFC ERGO', 'Tata AIG', 'Acko', 'Digit Insurance'] },
  { id: 'jewellery_insurance', name: 'Jewellery & Valuables', iconName: 'Gem', examples: 'Ring, necklace, watch, gold', jewellers: ['Tanishq', 'Kalyan Jewellers', 'Malabar Gold & Diamonds', 'CaratLane', 'Titan', 'Casio'], insurers: ['HDFC ERGO', 'ICICI Lombard', 'National Insurance'] },
  { id: 'property_insurance', name: 'Property / Home', iconName: 'Home', examples: 'Home structure, contents, rental, fire', insurers: ['HDFC ERGO', 'ICICI Lombard', 'Bajaj Allianz', 'SBI General Insurance'] },
  { id: 'life_insurance', name: 'Life Insurance', iconName: 'User', examples: 'Term life, whole life, endowment, ULIP', insurers: ['LIC', 'HDFC Life', 'SBI Life', 'ICICI Prudential', 'Max Life'] },
  { id: 'travel_insurance', name: 'Travel Insurance', iconName: 'Plane', examples: 'International, domestic, student travel', insurers: ['Tata AIG', 'HDFC ERGO', 'Reliance General', 'Bajaj Allianz'] },
  { id: 'device_insurance', name: 'Device Insurance', iconName: 'Smartphone', examples: 'Accidental damage, liquid protection', insurers: ['OneAssist', 'Servify', 'AppleCare+', 'Samsung Care+'] },
  { id: 'business_insurance', name: 'Business Insurance', iconName: 'Building', examples: 'Commercial asset, liability, cyber', insurers: ['HDFC ERGO', 'ICICI Lombard', 'Tata AIG'] },
  { id: 'other_insurance', name: 'Other Policy', iconName: 'FileCheck', examples: 'Any policy not listed above', insurers: [] }
];
