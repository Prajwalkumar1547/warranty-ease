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
  { id: 'mobiles', name: 'Mobiles', iconName: 'Smartphone', examples: 'Phones, tablets, cellular devices', popularBrands: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Vivo', 'Realme'] },
  { id: 'computers', name: 'Computers', iconName: 'Laptop', examples: 'Laptops, monitors, desktops, MacBooks', popularBrands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'Microsoft'] },
  { id: 'tv', name: 'TV', iconName: 'Tv', examples: 'Smart TVs, OLED, QLED, projectors', popularBrands: ['Samsung', 'LG', 'Sony', 'Xiaomi', 'TCL', 'OnePlus'] },
  { id: 'audio', name: 'Audio', iconName: 'Headphones', examples: 'Headphones, earbuds, soundbars, Bluetooth speakers', popularBrands: ['Sony', 'Bose', 'JBL', 'Apple', 'Sennheiser', 'boAt', 'Noise'] },
  { id: 'cameras', name: 'Cameras', iconName: 'Camera', examples: 'DSLR, mirrorless, lenses, action cameras, GoPro', popularBrands: ['Sony', 'Canon', 'Nikon', 'GoPro', 'Fujifilm', 'DJI'] },
  { id: 'gaming', name: 'Gaming', iconName: 'Gamepad2', examples: 'PlayStation, Xbox, Nintendo Switch, handhelds, controllers', popularBrands: ['Sony', 'Microsoft', 'Nintendo', 'Razer', 'Logitech', 'Asus ROG'] },
  { id: 'appliances', name: 'Appliances', iconName: 'Refrigerator', examples: 'Washing machine, AC, refrigerator, air purifier, vacuum', popularBrands: ['Samsung', 'LG', 'Bosch', 'Dyson', 'Whirlpool', 'Godrej', 'Haier', 'Voltas'] },
  { id: 'kitchen', name: 'Kitchen', iconName: 'Utensils', examples: 'Microwave, mixer, air fryer, coffee maker, chimney', popularBrands: ['Philips', 'Bosch', 'Panasonic', 'Prestige', 'Morphy Richards', 'Bajaj'] },
  { id: 'printers', name: 'Printers', iconName: 'Printer', examples: 'Inkjet, laser printer, all-in-one scanners', popularBrands: ['HP', 'Canon', 'Epson', 'Brother'] },
  { id: 'wearables', name: 'Wearables', iconName: 'Watch', examples: 'Apple Watch, Galaxy Watch, fitness trackers, smart rings', popularBrands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Noise', 'boAt', 'Fire-Boltt'] },
  { id: 'furniture', name: 'Furniture', iconName: 'Sofa', examples: 'Sofa, ergonomic chairs, motorized desks, beds', popularBrands: ['IKEA', 'Godrej Interio', 'Urban Ladder', 'Pepperfry', 'Sleepwell'] },
  { id: 'tools', name: 'Tools', iconName: 'Wrench', examples: 'Drills, power tools, lawnmowers, pressure washers', popularBrands: ['Bosch', 'DeWalt', 'Makita', 'Stanley', 'Black+Decker'] },
  { id: 'other_warranty', name: 'Other', iconName: 'Package', examples: 'Any physical product or gear not listed above', popularBrands: [] }
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
