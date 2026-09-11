// Comprehensive Brand Logo & Domain Resolver using Google Favicon API
export const BRAND_DOMAINS_MAP = {
  apple: 'apple.com',
  samsung: 'samsung.com',
  sony: 'sony.com',
  oneplus: 'oneplus.com',
  logitech: 'logitech.com',
  dyson: 'dyson.com',
  xiaomi: 'mi.com',
  mi: 'mi.com',
  boat: 'boat-lifestyle.com',
  hp: 'hp.com',
  realme: 'realme.com',
  flipkart: 'flipkart.com',
  vijaysales: 'vijaysales.com',
  croma: 'croma.com',
  reliancedigital: 'reliancedigital.in',
  lg: 'lg.com',
  dell: 'dell.com',
  asus: 'asus.com',
  acer: 'acer.com',
  bose: 'bose.com',
  jbl: 'jbl.com',
  whirlpool: 'whirlpool.com',
  bosch: 'bosch.com',
  noise: 'gonoise.com',
  godrej: 'godrej.com',
  haier: 'haier.com',
  panasonic: 'panasonic.com',
  philips: 'philips.com',
  marshall: 'marshall.com',
  sennheiser: 'sennheiser.com',
  amazon: 'amazon.in',
  unidays: 'myunidays.com',
  studentbeans: 'studentbeans.com',
  github: 'github.com',
  microsoft: 'microsoft.com',
  lenovo: 'lenovo.com',
  discord: 'discord.com',
  spotify: 'spotify.com',
  youtube: 'youtube.com',
  notion: 'notion.so',
  canva: 'canva.com',
  voltas: 'voltas.com',
  bluestar: 'bluestarindia.com',
  ifb: 'ifbappliances.com',
  tatacliq: 'tatacliq.com',
  nykaa: 'nykaa.com',
  ajio: 'ajio.com'
};

export function resolveBrandDomain(brandName, customDomain = '') {
  if (customDomain && customDomain.trim()) {
    let clean = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean.includes('.')) clean += '.com';
    return clean;
  }

  if (!brandName || !brandName.trim()) return 'google.com';

  const b = brandName.toLowerCase().trim();

  // Check static mappings first
  for (const [key, dom] of Object.entries(BRAND_DOMAINS_MAP)) {
    if (b.includes(key)) {
      return dom;
    }
  }

  // If input contains a domain directly (e.g. "brand.in" or "brand.co")
  if (b.includes('.')) {
    return b.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  // Clean brand name and construct fallback domain
  const cleanBrand = b
    .replace(/\b(india|inc|corp|ltd|pvt|official|tech|audio|electronics|store|retail|appliances)\b/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (cleanBrand.length >= 2) {
    return `${cleanBrand}.com`;
  }

  return 'google.com';
}

export function getGoogleBrandLogoUrl(brandName, customDomain = '') {
  const domain = resolveBrandDomain(brandName, customDomain);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
