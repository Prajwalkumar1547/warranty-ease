import React, { useState } from 'react';
import {
  Wrench, Building2, MapPin, ExternalLink, Star, Phone, MessageCircle,
  Search, Smartphone, Laptop, Car, Tv, Navigation, ShieldCheck, CheckCircle2,
  Clock, Award, Menu, ChevronDown, Filter
} from 'lucide-react';
import BrandLogoIcon from '../components/BrandLogoIcon';

// ─── AUTHORIZED BRAND SERVICE CENTERS ───
const AUTHORIZED_SERVICE_CENTERS = [
  // Mobile & Smartphones
  {
    id: 'auth-app-sec',
    name: 'Apple Authorized Service Center (F1 Info Solutions)',
    brand: 'Apple',
    category: 'mobile',
    categoryLabel: 'Mobile',
    address: 'Shop #12, Ground Floor, Park Lane Commercial Complex, Park Lane, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-108-1084',
    whatsapp: '+919866130006',
    rating: 4.9,
    reviews: '3.4K',
    claimApprovalRate: '99%',
    turnaround: '24-48 Hours',
    lat: 17.4435,
    lng: 78.4982,
    mapQuery: 'Apple Authorized Service Center Park Lane Secunderabad',
    services: ['Screen Replacement', 'Battery Service', 'Logic Board Diagnostic', 'Official AppleCare Processing']
  },
  {
    id: 'auth-sam-sec',
    name: 'Samsung Authorized Service Plaza',
    brand: 'Samsung',
    category: 'mobile',
    categoryLabel: 'Mobile',
    address: 'H.No 1-8-303, Paradise Circle, M.G. Road, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-40-7267864',
    whatsapp: '+91180057267864',
    rating: 4.8,
    reviews: '5.1K',
    claimApprovalRate: '98%',
    turnaround: 'Same Day (2-4 Hrs)',
    lat: 17.4412,
    lng: 78.4871,
    mapQuery: 'Samsung Service Plaza Paradise Circle Secunderabad',
    services: ['Display Replacement', 'Motherboard Fix', 'Water Damage Repair', 'Warranty Claims']
  },
  {
    id: 'auth-1plus-sec',
    name: 'OnePlus Authorized Service Center',
    brand: 'OnePlus',
    category: 'mobile',
    categoryLabel: 'Mobile',
    address: '2nd Floor, Chenoy Trade Centre (CTC), Park Lane, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-102-8411',
    whatsapp: '+919223011111',
    rating: 4.7,
    reviews: '2.8K',
    claimApprovalRate: '97%',
    turnaround: '1-3 Hours',
    lat: 17.4441,
    lng: 78.4990,
    mapQuery: 'OnePlus Service Center CTC Secunderabad',
    services: ['Free Battery Replacement', 'Screen Repair', 'Nord Series Care', 'Red Cable Club Claims']
  },
  {
    id: 'auth-mi-sec',
    name: 'Xiaomi Exclusive Service Center',
    brand: 'Xiaomi',
    category: 'mobile',
    categoryLabel: 'Mobile',
    address: 'Patny Plaza, Near Patny Center, S.D. Road, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-103-6286',
    whatsapp: '+918800247247',
    rating: 4.6,
    reviews: '4.2K',
    claimApprovalRate: '96%',
    turnaround: 'Same Day',
    lat: 17.4420,
    lng: 78.4940,
    mapQuery: 'Xiaomi Service Center Patny Secunderabad',
    services: ['Redmi & Mi Screen Fix', 'Camera Module Swap', 'Charging Port Repair', 'Mi Protect Claims']
  },
  {
    id: 'auth-vivo-sec',
    name: 'Vivo Authorized Care Center',
    brand: 'Vivo',
    category: 'mobile',
    categoryLabel: 'Mobile',
    address: 'RP Road, Opposite Railway Reservation Office, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-102-3333',
    whatsapp: '+918595833333',
    rating: 4.7,
    reviews: '1.9K',
    claimApprovalRate: '97%',
    turnaround: '2-4 Hours',
    lat: 17.4385,
    lng: 78.5012,
    mapQuery: 'Vivo Service Center RP Road Secunderabad',
    services: ['V-Shield Replacement', 'Free Screen Guard', 'Software Flash', 'Warranty Support']
  },

  // Laptop & Computers
  {
    id: 'auth-dell-sec',
    name: 'Dell Exclusive Service Plaza',
    brand: 'Dell',
    category: 'laptop',
    categoryLabel: 'Laptop',
    address: '1st Floor, Chenoy Trade Centre (CTC), Park Lane, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-425-4026',
    whatsapp: '+919167824305',
    rating: 4.8,
    reviews: '3.9K',
    claimApprovalRate: '98%',
    turnaround: '24-72 Hours',
    lat: 17.4445,
    lng: 78.4992,
    mapQuery: 'Dell Authorized Service Center CTC Secunderabad',
    services: ['XPS & Inspiron Motherboard Fix', 'Keyboard Replacement', 'Battery & Adapter Care', 'Onsite Warranty Claims']
  },
  {
    id: 'auth-hp-sec',
    name: 'HP Authorized Care Center',
    brand: 'HP',
    category: 'laptop',
    categoryLabel: 'Laptop',
    address: 'Shop #45, CTC Complex, S.D. Road, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-258-7170',
    whatsapp: '+912261014588',
    rating: 4.7,
    reviews: '3.1K',
    claimApprovalRate: '97%',
    turnaround: '24 Hours',
    lat: 17.4439,
    lng: 78.4988,
    mapQuery: 'HP Service Center CTC Secunderabad',
    services: ['Pavilion & Omen Screen Repair', 'SSD Upgrade', 'Fan & Thermal Paste', 'HP Care Pack Support']
  },
  {
    id: 'auth-lenovo-sec',
    name: 'Lenovo Service Plaza',
    brand: 'Lenovo',
    category: 'laptop',
    categoryLabel: 'Laptop',
    address: 'Ground Floor, Swapnalok Complex, S.D. Road, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-419-7555',
    whatsapp: '+918067916666',
    rating: 4.8,
    reviews: '2.5K',
    claimApprovalRate: '98%',
    turnaround: '24-48 Hours',
    lat: 17.4428,
    lng: 78.4960,
    mapQuery: 'Lenovo Service Plaza Swapnalok Secunderabad',
    services: ['ThinkPad & IdeaPad Board Repair', 'Display Replacement', 'Accidental Damage Protection (ADP) Claims']
  },
  {
    id: 'auth-asus-sec',
    name: 'Asus ROG & ZenBook Service Hub',
    brand: 'Asus',
    category: 'laptop',
    categoryLabel: 'Laptop',
    address: 'Office #108, CTC Trade Center, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-419-0277',
    whatsapp: '+919820010277',
    rating: 4.6,
    reviews: '1.8K',
    claimApprovalRate: '95%',
    turnaround: '48 Hours',
    lat: 17.4442,
    lng: 78.4994,
    mapQuery: 'Asus Service Center CTC Secunderabad',
    services: ['ROG Gaming Laptop GPU Repair', 'Liquid Damage Service', 'ZenBook OLED Screen Repair']
  },

  // Cars & Automobiles
  {
    id: 'auth-maruti-sec',
    name: 'Maruti Suzuki Authorized Service Arena (Varun Motors)',
    brand: 'Maruti Suzuki',
    category: 'car',
    categoryLabel: 'Cars',
    address: 'Plot #4, Ranigunj Industrial Area, Minister Road, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-102-1800',
    whatsapp: '+919289333444',
    rating: 4.9,
    reviews: '8.4K',
    claimApprovalRate: '99%',
    turnaround: 'Same Day Express',
    lat: 17.4320,
    lng: 78.4820,
    mapQuery: 'Maruti Suzuki Varun Motors Ranigunj Secunderabad',
    services: ['Periodic Maintenance', 'Cashless Insurance Claims', 'Engine Overhaul', 'Wheel Alignment & Balancer']
  },
  {
    id: 'auth-hyundai-sec',
    name: 'Hyundai Authorized Service Workshop (Kun Hyundai)',
    brand: 'Hyundai',
    category: 'car',
    categoryLabel: 'Cars',
    address: 'Near Bowenpally Checkpost, NH 44, Secunderabad, Telangana 500011',
    city: 'Secunderabad',
    phone: '1800-11-4645',
    whatsapp: '+919871494645',
    rating: 4.8,
    reviews: '6.2K',
    claimApprovalRate: '98%',
    turnaround: 'Same Day',
    lat: 17.4650,
    lng: 78.4790,
    mapQuery: 'Kun Hyundai Service Center Bowenpally Secunderabad',
    services: ['Creta & Venue AC Repairs', 'Body Shop & Painting', 'Zero-Dep Insurance Claims', 'Brake Service']
  },
  {
    id: 'auth-tata-sec',
    name: 'Tata Motors Passenger Vehicle Workshop (Venumotors)',
    brand: 'Tata Motors',
    category: 'car',
    categoryLabel: 'Cars',
    address: 'Karkhana Road, Near Vikrampuri Colony, Secunderabad, Telangana 500009',
    city: 'Secunderabad',
    phone: '1800-209-8282',
    whatsapp: '+917045460000',
    rating: 4.7,
    reviews: '4.9K',
    claimApprovalRate: '97%',
    turnaround: '24 Hours',
    lat: 17.4580,
    lng: 78.5020,
    mapQuery: 'Tata Motors Workshop Karkhana Secunderabad',
    services: ['Nexon EV High-Voltage Check', 'Extended Warranty Service', 'Accident Repairs', 'Engine Tuning']
  },
  {
    id: 'auth-toyota-sec',
    name: 'Toyota Authorized Service Plaza (Harsha Toyota)',
    brand: 'Toyota',
    category: 'car',
    categoryLabel: 'Cars',
    address: 'M.G. Road, Near Ranigunj Signal, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-309-0001',
    whatsapp: '+918595500001',
    rating: 4.9,
    reviews: '7.1K',
    claimApprovalRate: '99%',
    turnaround: '60-Min Express Care',
    lat: 17.4350,
    lng: 78.4850,
    mapQuery: 'Toyota Service Center Secunderabad',
    services: ['Innova & Fortuner Hybrid Diagnostics', '60-Minute EM60 Express Service', 'Cashless Claims']
  },

  // Home Appliances
  {
    id: 'auth-lg-sec',
    name: 'LG Electronics Authorized Brand Shop & Service Hub',
    brand: 'LG',
    category: 'appliance',
    categoryLabel: 'Home Appliances',
    address: 'Sardar Patel Road, Opposite Gymkhana Grounds, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-315-9999',
    whatsapp: '+919711709999',
    rating: 4.8,
    reviews: '5.8K',
    claimApprovalRate: '98%',
    turnaround: 'Home Visit (24h)',
    lat: 17.4410,
    lng: 78.4920,
    mapQuery: 'LG Authorized Service Center SP Road Secunderabad',
    services: ['OLED TV Board Swap', 'Smart Refrigerator Gas Refill', 'Washing Machine Motor Warranty Fix']
  },
  {
    id: 'auth-sony-sec',
    name: 'Sony Authorized Center (Bravia & Audio Service)',
    brand: 'Sony',
    category: 'appliance',
    categoryLabel: 'Home Appliances',
    address: 'Paradise Circle, M.G. Road, Secunderabad, Telangana 500003',
    city: 'Secunderabad',
    phone: '1800-103-7799',
    whatsapp: '+918595790396',
    rating: 4.8,
    reviews: '3.7K',
    claimApprovalRate: '98%',
    turnaround: 'Same Day',
    lat: 17.4415,
    lng: 78.4875,
    mapQuery: 'Sony Authorized Service Center Paradise Secunderabad',
    services: ['Bravia 4K Panel Repair', 'Home Theatre Amp Fix', 'PlayStation 5 Console Service']
  }
];

// ─── TOP 3RD PARTY REPAIR SHOPS ───
const THIRD_PARTY_REPAIR_SHOPS = [
  // Mobile Repair
  {
    id: 'tp-mob-1',
    name: 'Secunderabad Mobile Care & Display Experts',
    category: 'mobile',
    categoryLabel: 'Mobile',
    specialty: '30-Min Screen & Battery Replacement (iPhone & Android)',
    address: 'Shop #8, Park Lane Commercial Complex, Park Lane, Secunderabad 500003',
    area: 'Park Lane, Secunderabad',
    phone: '+91 98661 30006',
    whatsapp: '+919866130006',
    rating: 4.9,
    reviews: '1,240',
    turnaround: '30 Minutes',
    warrantyGiven: '90 Days Shop Warranty',
    lat: 17.4432,
    lng: 78.4980,
    mapQuery: 'Mobile Repair Shop Park Lane Secunderabad',
    badge: 'Top Rated Mobile Shop',
    services: ['Original Glass & Display Swap', 'Water Damage Recovery', 'IC Level Motherboard Fix', 'Battery Health Swap']
  },
  {
    id: 'tp-mob-2',
    name: 'Sangeetha Mobile Repair Hub & Glass Clinic',
    category: 'mobile',
    categoryLabel: 'Mobile',
    specialty: 'Laser Back-Glass Removal & Curved OLED Display Fix',
    address: 'Near Paradise Hotel Circle, M.G. Road, Secunderabad 500003',
    area: 'Paradise Circle, Secunderabad',
    phone: '+91 98490 12345',
    whatsapp: '+919849012345',
    rating: 4.8,
    reviews: '980',
    turnaround: '45 Minutes',
    warrantyGiven: '6 Months Display Warranty',
    lat: 17.4410,
    lng: 78.4870,
    mapQuery: 'Sangeetha Mobile Repair Paradise Secunderabad',
    badge: 'Fast 45-Min Express Care',
    services: ['iPhone 12-15 Series Back Glass Laser', 'Samsung Galaxy S-Series Display', 'OnePlus Green Line Fix', 'Charging Port']
  },
  {
    id: 'tp-mob-3',
    name: 'CTO Mobile Repair Plaza & Chip-Level Lab',
    category: 'mobile',
    categoryLabel: 'Mobile',
    specialty: 'CPU Reballing & Dead Phone Recovery Specialist',
    address: 'Patny Center, S.D. Road, Secunderabad 500003',
    area: 'Patny Center, Secunderabad',
    phone: '+91 91770 99887',
    whatsapp: '+919177099887',
    rating: 4.7,
    reviews: '850',
    turnaround: '2-4 Hours',
    warrantyGiven: '3 Months Repair Warranty',
    lat: 17.4418,
    lng: 78.4938,
    mapQuery: 'Mobile Repair Plaza Patny Center Secunderabad',
    badge: 'Chip-Level Hardware Lab',
    services: ['Dead Phone Micro-Soldering', 'FaceID Repair', 'Storage Memory Upgrade', 'Network Signal IC Fix']
  },

  // Laptop & Computer Repair
  {
    id: 'tp-lap-1',
    name: 'CTC Laptop Doctors & BGA Chip-Level Lab',
    category: 'laptop',
    categoryLabel: 'Laptop',
    specialty: 'No-Power Laptop Fix, BGA GPU Rework & SSD Upgrades',
    address: 'Shop #24, 1st Floor, Chenoy Trade Centre (CTC), Park Lane, Secunderabad 500003',
    area: 'Chenoy Trade Centre (CTC), Secunderabad',
    phone: '+91 98480 88219',
    whatsapp: '+919848088219',
    rating: 4.9,
    reviews: '2,150',
    turnaround: 'Same Day (2-3 Hours)',
    warrantyGiven: '6 Months Board Warranty',
    lat: 17.4444,
    lng: 78.4991,
    mapQuery: 'CTC Laptop Repair Chenoy Trade Centre Secunderabad',
    badge: 'CTC Top Rated Specialist',
    services: ['MacBook & Windows Board Repair', 'Broken Hinge Reconstruction', 'Full Screen Replacement', 'RAM & NVMe Upgrades']
  },
  {
    id: 'tp-lap-2',
    name: 'Chenoy PC & Gaming Laptop World',
    category: 'laptop',
    categoryLabel: 'Laptop',
    specialty: 'Gaming Rig Repairs, Liquid Damage & Thermal Re-pasting',
    address: 'Shop #102, Ground Floor, CTC Complex, Secunderabad 500003',
    area: 'CTC Complex, Secunderabad',
    phone: '+91 99890 77123',
    whatsapp: '+919989077123',
    rating: 4.8,
    reviews: '1,420',
    turnaround: '1-2 Days',
    warrantyGiven: '90 Days Warranty',
    lat: 17.4440,
    lng: 78.4986,
    mapQuery: 'Gaming Laptop Repair CTC Secunderabad',
    badge: 'ROG / Gaming Laptop Specialist',
    services: ['GPU Artifact & Overheating Fix', 'Short Circuit Tracing', 'Keyboard Replacement', 'Custom PC Tuning']
  },
  {
    id: 'tp-lap-3',
    name: 'RP Road Laptop Clinic & Emergency Repair',
    category: 'laptop',
    categoryLabel: 'Laptop',
    specialty: 'Instant Screen, Battery & Keyboard Replacement',
    address: 'H.No 3-4-12, Main Road, RP Road, Secunderabad 500003',
    area: 'RP Road, Secunderabad',
    phone: '+91 93910 44556',
    whatsapp: '+919391044556',
    rating: 4.7,
    reviews: '760',
    turnaround: '1 Hour Express',
    warrantyGiven: '6 Months Replacement Warranty',
    lat: 17.4380,
    lng: 78.5010,
    mapQuery: 'RP Road Laptop Clinic Secunderabad',
    badge: '1-Hour Express Fix',
    services: ['Original Screen Replacement', 'Genuine Battery Pack', 'Data Recovery from Crashed Drive', 'OS & Virus Clean']
  },

  // Cars & Automobile Repair
  {
    id: 'tp-car-1',
    name: 'Ranigunj Multi-Brand Car Care & Auto Garage',
    category: 'car',
    categoryLabel: 'Cars',
    specialty: 'Engine Diagnostics, AC Servicing & Dent-Paint Workshop',
    address: 'Plot #18, Ranigunj Industrial Estate, Minister Road, Secunderabad 500003',
    area: 'Ranigunj Industrial Area, Secunderabad',
    phone: '+91 98491 55667',
    whatsapp: '+919849155667',
    rating: 4.9,
    reviews: '1,890',
    turnaround: 'Same Day Service',
    warrantyGiven: '6 Months Service Guarantee',
    lat: 17.4315,
    lng: 78.4815,
    mapQuery: 'Ranigunj Car Care Minister Road Secunderabad',
    badge: 'Multi-Brand Auto Garage',
    services: ['Synthetic Engine Oil Service', '3D Wheel Alignment', 'Car AC Gas Top-up & Leak Fix', 'Booth Paint & Denting']
  },
  {
    id: 'tp-car-2',
    name: 'Secunderabad Auto Electricals & ECU Diagnostic Clinic',
    category: 'car',
    categoryLabel: 'Cars',
    specialty: 'ECU Scanning, Battery, Alternator & Electrical Troubleshooting',
    address: 'Near Clock Tower, M.G. Road, Secunderabad 500003',
    area: 'Clock Tower, Secunderabad',
    phone: '+91 98660 11223',
    whatsapp: '+919866011223',
    rating: 4.8,
    reviews: '940',
    turnaround: '2-4 Hours',
    warrantyGiven: '1 Year Battery/Part Warranty',
    lat: 17.4425,
    lng: 78.4970,
    mapQuery: 'Auto Electricals Clock Tower Secunderabad',
    badge: 'ECU & Electrical Specialist',
    services: ['OBD2 Computer Scanner', 'Alternator & Starter Motor Repair', 'Battery Replacement', 'Wiring Harness Fix']
  },
  {
    id: 'tp-car-3',
    name: 'Mahankali Car Works & Suspension Specialist',
    category: 'car',
    categoryLabel: 'Cars',
    specialty: 'Suspension Overhaul, Clutch Replacement & Brake Service',
    address: 'Mahankali Street, Near General Bazaar, Secunderabad 500003',
    area: 'General Bazaar, Secunderabad',
    phone: '+91 93930 22334',
    whatsapp: '+919393022334',
    rating: 4.7,
    reviews: '820',
    turnaround: 'Same Day',
    warrantyGiven: '6 Months Warranty',
    lat: 17.4390,
    lng: 78.4910,
    mapQuery: 'Mahankali Car Works General Bazaar Secunderabad',
    badge: 'Brake & Suspension Specialist',
    services: ['Shock Absorber Replacement', 'Clutch Plate & Flywheel', 'Brake Pad & Rotor Resurfacing', 'Underbody Anti-Rust']
  }
];

export default function RepairsPage() {
  const [mainTab, setMainTab] = useState('authorized'); // 'authorized' | 'thirdparty'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'mobile' | 'laptop' | 'car' | 'appliance'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapShop, setSelectedMapShop] = useState(null);

  const categories = [
    { id: 'all', label: 'All Repair Categories' },
    { id: 'mobile', label: 'Mobile & Smartphones' },
    { id: 'laptop', label: 'Laptops & Computers' },
    { id: 'car', label: 'Automobiles & Cars' },
    { id: 'appliance', label: 'Home Appliances' },
  ];

  const currentList = mainTab === 'authorized' ? AUTHORIZED_SERVICE_CENTERS : THIRD_PARTY_REPAIR_SHOPS;

  const filteredShops = currentList.filter(shop => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shop.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shop.specialty || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || shop.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleOpenGoogleMaps = (shop) => {
    const query = encodeURIComponent(`${shop.name} ${shop.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div>
      {/* Compact Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem' }}>
            <Wrench size={22} color="#2563eb" /> Services & Repairs
          </h1>
          <p className="page-description">Authorized brand service centers and top-rated 3rd party repair specialists in Secunderabad & Hyderabad.</p>
        </div>
      </div>

      {/* Main 2-Tab Toggle: Authorized vs 3rd Party */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '0.85rem' }}>
        <button
          onClick={() => setMainTab('authorized')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.25rem',
            borderRadius: '0.65rem',
            border: 'none',
            cursor: 'pointer',
            background: mainTab === 'authorized' ? '#ffffff' : 'transparent',
            color: mainTab === 'authorized' ? '#1d4ed8' : '#64748b',
            fontWeight: mainTab === 'authorized' ? 800 : 600,
            fontSize: '0.92rem',
            boxShadow: mainTab === 'authorized' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Building2 size={18} color={mainTab === 'authorized' ? '#1d4ed8' : '#64748b'} />
          <span>Authorized ({AUTHORIZED_SERVICE_CENTERS.length})</span>
        </button>

        <button
          onClick={() => setMainTab('thirdparty')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.25rem',
            borderRadius: '0.65rem',
            border: 'none',
            cursor: 'pointer',
            background: mainTab === 'thirdparty' ? '#ffffff' : 'transparent',
            color: mainTab === 'thirdparty' ? '#1d4ed8' : '#64748b',
            fontWeight: mainTab === 'thirdparty' ? 800 : 600,
            fontSize: '0.92rem',
            boxShadow: mainTab === 'thirdparty' ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Wrench size={18} color={mainTab === 'thirdparty' ? '#1d4ed8' : '#64748b'} />
          <span>3rd Party ({THIRD_PARTY_REPAIR_SHOPS.length})</span>
        </button>
      </div>

      {/* Unified Search + Category Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        marginBottom: '1.25rem',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        padding: '0.55rem 1rem',
        borderRadius: '0.85rem',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap'
      }}>
        {/* ☰ Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ background: '#eff6ff', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={18} color="#2563eb" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              background: '#f8fafc',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#0f172a',
              cursor: 'pointer',
              padding: '0.35rem 0.65rem',
              outline: 'none'
            }}
          >
            {categories.map((cat) => {
              const count = cat.id === 'all'
                ? currentList.length
                : currentList.filter(s => s.category === cat.id).length;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: '#e2e8f0', flexShrink: 0 }} />

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '160px' }}>
          <Search size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by brand, shop, area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.88rem',
              color: '#0f172a',
              width: '100%'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ border: 'none', background: '#f1f5f9', borderRadius: '20px', padding: '0.15rem 0.55rem', fontSize: '0.72rem', color: '#64748b', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Interactive Map Visual Section */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '1.15rem',
        padding: '1.15rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="#2563eb" />
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Secunderabad & Hyderabad Map View
            </h2>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Click any pin to view details or navigate in Google Maps
          </span>
        </div>

        {/* Stylized Map View Box */}
        <div style={{
          height: '220px',
          borderRadius: '0.85rem',
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #dbeafe 100%)',
          border: '1.5px solid #93c5fd',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justify: 'center'
        }}>
          {/* Map Grid Pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'radial-gradient(#0284c7 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

          {/* Interactive Pins */}
          {filteredShops.slice(0, 5).map((shop, idx) => {
            const positions = [
              { top: '25%', left: '22%' },
              { top: '55%', left: '48%' },
              { top: '30%', left: '72%' },
              { top: '68%', left: '28%' },
              { top: '70%', left: '78%' }
            ];
            const pos = positions[idx % positions.length];
            const isSelected = selectedMapShop?.id === shop.id;

            return (
              <div
                key={shop.id}
                onClick={() => setSelectedMapShop(shop)}
                style={{
                  position: 'absolute',
                  ...pos,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: isSelected ? 10 : 2,
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{
                  background: isSelected ? '#16a34a' : '#2563eb',
                  color: '#fff',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap'
                }}>
                  <MapPin size={11} />
                  <span>{shop.name.split(' ')[0]}</span>
                </div>
                <div style={{ width: 7, height: 7, background: isSelected ? '#16a34a' : '#2563eb', borderRadius: '50%', marginTop: '2px' }} />
              </div>
            );
          })}

          {/* Map info bar */}
          <div style={{ position: 'absolute', bottom: '10px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', border: '1px solid #bfdbfe' }}>
            Showing {filteredShops.length} Service & Repair Centers near Secunderabad
          </div>
        </div>

        {/* Selected Shop Quick Card from Map */}
        {selectedMapShop && (
          <div style={{ marginTop: '0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e40af' }}>{selectedMapShop.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>{selectedMapShop.address}</div>
            </div>
            <button
              onClick={() => handleOpenGoogleMaps(selectedMapShop)}
              className="btn btn-primary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              <Navigation size={12} /> Open in Google Maps
            </button>
          </div>
        )}
      </div>

      {/* Shops Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.15rem' }}>
        {filteredShops.map((shop) => {
          const cleanWa = shop.whatsapp ? shop.whatsapp.replace(/[^0-9]/g, '') : null;
          return (
            <div
              key={shop.id}
              style={{
                background: '#ffffff',
                borderRadius: '1.15rem',
                border: '1px solid #e2e8f0',
                padding: '1.15rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div>
                {/* Header with Official Company Brand Logo */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.65rem', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '4px' }}>
                      {shop.brand ? (
                        <BrandLogoIcon brand={shop.brand} size={30} />
                      ) : (
                        <Wrench size={22} color="#2563eb" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {shop.categoryLabel || shop.category}
                      </div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0.1rem 0 0 0', lineHeight: 1.3 }}>
                        {shop.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {shop.badge && (
                  <div style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '0.4rem', marginBottom: '0.65rem', display: 'inline-block' }}>
                    {shop.badge}
                  </div>
                )}

                {/* Rating & Turnaround */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: '#475569', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ea580c', fontWeight: 800 }}>
                    <Star size={13} fill="#ea580c" />
                    <span>{shop.rating}</span>
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>({shop.reviews})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontWeight: 700 }}>
                    <Clock size={13} />
                    <span>{shop.turnaround}</span>
                  </div>
                </div>

                {/* Specialty / Services */}
                {shop.specialty && (
                  <div style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 700, marginBottom: '0.65rem', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                    {shop.specialty}
                  </div>
                )}

                {/* Address */}
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  <MapPin size={13} color="#0066cc" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>{shop.address}</span>
                </div>

                {/* Service pills */}
                {shop.services && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {shop.services.slice(0, 3).map((s) => (
                      <span key={s} style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.68rem', fontWeight: 600, padding: '0.12rem 0.4rem', borderRadius: '0.35rem' }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                <a
                  href={`tel:${shop.phone}`}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.35rem 0.45rem', fontSize: '0.75rem', textDecoration: 'none', justifyContent: 'center' }}
                >
                  <Phone size={12} color="#0066cc" /> Call
                </a>

                {cleanWa && (
                  <a
                    href={`https://wa.me/${cleanWa}?text=Hello%20${encodeURIComponent(shop.name)},%20I%20need%20repair%20service.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.35rem 0.45rem', fontSize: '0.75rem', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', textDecoration: 'none', justifyContent: 'center' }}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}

                <button
                  onClick={() => handleOpenGoogleMaps(shop)}
                  className="btn btn-primary"
                  style={{ flex: 1.2, padding: '0.35rem 0.45rem', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  <Navigation size={12} /> Maps
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
