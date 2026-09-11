// Canonical Brand Asset & Domain Registry with 4-tier fallback support
export const BRAND_REGISTRY = {
  apple: { name: 'Apple', domain: 'apple.com', category: 'Electronics', color: '#1d1d1f' },
  samsung: { name: 'Samsung', domain: 'samsung.com', category: 'Electronics', color: '#1428a0' },
  sony: { name: 'Sony', domain: 'sony.com', category: 'Electronics', color: '#000000' },
  meta: { name: 'Meta', domain: 'meta.com', category: 'Wearables', color: '#0668e1' },
  rayban: { name: 'Ray-Ban Meta', domain: 'ray-ban.com', category: 'Wearables', color: '#000000' },
  lenskart: { name: 'Lenskart', domain: 'lenskart.com', category: 'Wearables', color: '#000000' },
  oneplus: { name: 'OnePlus', domain: 'oneplus.com', category: 'Electronics', color: '#eb0029' },
  google: { name: 'Google', domain: 'google.com', category: 'Electronics', color: '#4285f4' },
  xiaomi: { name: 'Xiaomi', domain: 'mi.com', category: 'Electronics', color: '#ff6900' },
  mi: { name: 'Xiaomi', domain: 'mi.com', category: 'Electronics', color: '#ff6900' },
  dell: { name: 'Dell', domain: 'dell.com', category: 'Computers', color: '#0076ce' },
  hp: { name: 'HP', domain: 'hp.com', category: 'Computers', color: '#0096d6' },
  lenovo: { name: 'Lenovo', domain: 'lenovo.com', category: 'Computers', color: '#e1251b' },
  asus: { name: 'Asus', domain: 'asus.com', category: 'Computers', color: '#00539b' },
  acer: { name: 'Acer', domain: 'acer.com', category: 'Computers', color: '#83b817' },
  microsoft: { name: 'Microsoft', domain: 'microsoft.com', category: 'Computers', color: '#0078d4' },
  logitech: { name: 'Logitech', domain: 'logitech.com', category: 'Computers', color: '#005bac' },
  dyson: { name: 'Dyson', domain: 'dyson.com', category: 'Home Appliances', color: '#b5006e' },
  emma: { name: 'Emma Sleep', domain: 'emma-sleep.in', category: 'Furniture', color: '#1e3a8a' },
  'emma sleep': { name: 'Emma Sleep', domain: 'emma-sleep.in', category: 'Furniture', color: '#1e3a8a' },
  lg: { name: 'LG', domain: 'lg.com', category: 'Home Appliances', color: '#a50034' },
  bosch: { name: 'Bosch', domain: 'bosch.com', category: 'Home Appliances', color: '#005691' },
  whirlpool: { name: 'Whirlpool', domain: 'whirlpool.com', category: 'Home Appliances', color: '#ffb800' },
  bose: { name: 'Bose', domain: 'bose.com', category: 'Audio', color: '#000000' },
  jbl: { name: 'JBL', domain: 'jbl.com', category: 'Audio', color: '#ff6600' },
  sennheiser: { name: 'Sennheiser', domain: 'sennheiser.com', category: 'Audio', color: '#000000' },
  marshall: { name: 'Marshall', domain: 'marshall.com', category: 'Audio', color: '#000000' },
  boat: { name: 'boAt', domain: 'boat-lifestyle.com', category: 'Audio', color: '#e31837' },
  noise: { name: 'Noise', domain: 'gonoise.com', category: 'Wearables', color: '#000000' },
  realme: { name: 'Realme', domain: 'realme.com', category: 'Electronics', color: '#f7a825' },
  philips: { name: 'Philips', domain: 'philips.com', category: 'Home Appliances', color: '#0b5ed7' },
  panasonic: { name: 'Panasonic', domain: 'panasonic.com', category: 'Home Appliances', color: '#004098' },
  godrej: { name: 'Godrej', domain: 'godrej.com', category: 'Home Appliances', color: '#0066cc' },
  haier: { name: 'Haier', domain: 'haier.com', category: 'Home Appliances', color: '#003366' },
  // Insurers & Financial Services
  star: { name: 'Star Health Insurance', domain: 'starhealth.in', category: 'Insurance', color: '#105caa' },
  care: { name: 'Care Health Insurance', domain: 'careinsurance.com', category: 'Insurance', color: '#009088' },
  niva: { name: 'Niva Bupa Health Insurance', domain: 'nivabupa.com', category: 'Insurance', color: '#e21b23' },
  bupa: { name: 'Niva Bupa Health Insurance', domain: 'nivabupa.com', category: 'Insurance', color: '#e21b23' },
  icici: { name: 'ICICI Lombard', domain: 'icicilombard.com', category: 'Insurance', color: '#f37021' },
  hdfc: { name: 'HDFC ERGO', domain: 'hdfcergo.com', category: 'Insurance', color: '#003087' },
  bajaj: { name: 'Bajaj Allianz', domain: 'bajajallianz.com', category: 'Insurance', color: '#00539b' },
  tata: { name: 'Tata AIG', domain: 'tataaig.com', category: 'Insurance', color: '#004b87' },
  sbi: { name: 'SBI General Insurance', domain: 'sbigeneral.in', category: 'Insurance', color: '#22286b' },
  aditya: { name: 'Aditya Birla Health', domain: 'adityabirlacapital.com', category: 'Insurance', color: '#c4161c' },
  digit: { name: 'Digit Insurance', domain: 'godigit.com', category: 'Insurance', color: '#ffc72c' },
  lic: { name: 'LIC', domain: 'licindia.in', category: 'Insurance', color: '#004080' },
  // Vehicle Manufacturers
  maruti: { name: 'Maruti Suzuki', domain: 'marutisuzuki.com', category: 'Vehicle', color: '#003a70' },
  hyundai: { name: 'Hyundai', domain: 'hyundai.com', category: 'Vehicle', color: '#002c6c' },
  honda: { name: 'Honda', domain: 'hondacarindia.com', category: 'Vehicle', color: '#cc0000' },
  toyota: { name: 'Toyota', domain: 'toyota.com', category: 'Vehicle', color: '#eb0a1e' },
  mahindra: { name: 'Mahindra', domain: 'mahindra.com', category: 'Vehicle', color: '#d8232a' },
  kia: { name: 'Kia', domain: 'kia.com', category: 'Vehicle', color: '#05141f' },
  bmw: { name: 'BMW', domain: 'bmw.in', category: 'Vehicle', color: '#0066b1' },
  mercedes: { name: 'Mercedes-Benz', domain: 'mercedes-benz.co.in', category: 'Vehicle', color: '#000000' },
  volkswagen: { name: 'Volkswagen', domain: 'volkswagen.co.in', category: 'Vehicle', color: '#001e50' },
  // Jewellers
  tanishq: { name: 'Tanishq', domain: 'tanishq.co.in', category: 'Jewellery', color: '#800020' },
  kalyan: { name: 'Kalyan Jewellers', domain: 'kalyanjewellers.net', category: 'Jewellery', color: '#d4af37' },
  malabar: { name: 'Malabar Gold & Diamonds', domain: 'malabargoldanddiamonds.com', category: 'Jewellery', color: '#8b0000' },
  caratlane: { name: 'CaratLane', domain: 'caratlane.com', category: 'Jewellery', color: '#7a288a' },
  // E-commerce
  amazon: { name: 'Amazon', domain: 'amazon.in', category: 'Shopping', color: '#ff9900' },
  flipkart: { name: 'Flipkart', domain: 'flipkart.com', category: 'Shopping', color: '#2874f0' },
  vijaysales: { name: 'Vijay Sales', domain: 'vijaysales.com', category: 'Shopping', color: '#e31837' },
  croma: { name: 'Croma', domain: 'croma.com', category: 'Shopping', color: '#009e49' }
};

export function getBrandMetadata(brandName, customDomain = '') {
  if (!brandName || !brandName.trim()) {
    return { name: 'Unknown Brand', domain: 'google.com', logoUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=128', monogram: 'UB', color: '#64748b' };
  }

  const b = brandName.toLowerCase().trim();

  // Check registry match
  for (const [key, meta] of Object.entries(BRAND_REGISTRY)) {
    if (b.includes(key)) {
      return {
        ...meta,
        logoUrl: `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=128`,
        monogram: meta.name.substring(0, 2).toUpperCase()
      };
    }
  }

  // Derive domain for unlisted brand
  let resolvedDomain = customDomain && customDomain.trim() ? customDomain.trim().toLowerCase() : '';
  if (!resolvedDomain) {
    if (b.includes('.')) {
      resolvedDomain = b.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    } else {
      const cleanBrand = b.replace(/\b(india|inc|corp|ltd|pvt|official|tech|audio|electronics|store|retail|insurance|health|general|life|jewellers|motors)\b/g, '').replace(/[^a-z0-9]/g, '');
      resolvedDomain = cleanBrand.length >= 2 ? `${cleanBrand}.com` : 'google.com';
    }
  }

  const monogram = brandName.trim().substring(0, 2).toUpperCase();

  return {
    name: brandName,
    domain: resolvedDomain,
    logoUrl: `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128`,
    monogram,
    color: '#0066cc'
  };
}
