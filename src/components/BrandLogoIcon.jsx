import React, { useState } from 'react';

// Comprehensive domain mapping for 70+ major global & national brands, retailers, and platforms
const BRAND_DOMAINS = {
  unidays: 'myunidays.com',
  github: 'github.com',
  apple: 'apple.com',
  meta: 'meta.com',
  rayban: 'ray-ban.com',
  lenskart: 'lenskart.com',
  studentbeans: 'studentbeans.com',
  microsoft: 'microsoft.com',
  amazon: 'amazon.in',
  spotify: 'spotify.com',
  youtube: 'youtube.com',
  lenovo: 'lenovo.com',
  discord: 'discord.com',
  notion: 'notion.so',
  canva: 'canva.com',
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
  cashify: 'cashify.in',
  reliancedigital: 'reliancedigital.in',
  lg: 'lg.com',
  dell: 'dell.com',
  asus: 'asus.com',
  acer: 'acer.com',
  bose: 'bose.com',
  jbl: 'jbl.com',
  whirlpool: 'whirlpool.com',
  bosch: 'bosch.com',
  titan: 'titan.co.in',
  casio: 'casio.com',
  myntra: 'myntra.com',
  noise: 'gonoise.com',
  godrej: 'godrej.com',
  haier: 'haier.com',
  panasonic: 'panasonic.com',
  philips: 'philips.com',
  marshall: 'marshall.com',
  sennheiser: 'sennheiser.com',
  voltas: 'voltas.com',
  bluestar: 'bluestarindia.com',
  ifb: 'ifbappliances.com',
  lloyd: 'havells.com',
  tatacliq: 'tatacliq.com',
  nykaa: 'nykaa.com',
  ajio: 'ajio.com',
  hdfc: 'hdfcbank.com',
  sbi: 'sbi.co.in',
  icici: 'icicibank.com',
  phonepe: 'phonepe.com',
  paytm: 'paytm.com',
  axis: 'axisbank.com',
  cred: 'cred.club',
  coursera: 'coursera.org',
  udemy: 'udemy.com',
  jetbrains: 'jetbrains.com',
  adobe: 'adobe.com'
};

const SIMPLEICONS_SLUGS = {
  apple: 'apple',
  meta: 'meta',
  samsung: 'samsung',
  sony: 'sony',
  oneplus: 'oneplus',
  google: 'google',
  xiaomi: 'xiaomi',
  dell: 'dell',
  hp: 'hp',
  lenovo: 'lenovo',
  asus: 'asus',
  acer: 'acer',
  microsoft: 'microsoft',
  razer: 'razer',
  logitech: 'logitech',
  github: 'github',
  discord: 'discord',
  notion: 'notion',
  canva: 'canva',
  spotify: 'spotify',
  youtube: 'youtube',
  amazon: 'amazon',
  unidays: 'unidays',
  lg: 'lg',
  bosch: 'bosch',
  philips: 'philips'
};

export default function BrandLogoIcon({ brand, domain, logoUrl, size = 28, style = {} }) {
  const [imgStep, setImgStep] = useState(logoUrl ? -1 : 0); // -1: custom logoUrl, 0: Google Favicon 128px, 1: SimpleIcons, 2: Clearbit, 3: Badge fallback
  const b = (brand || '').toLowerCase().trim();

  // Determine target domain dynamically if not explicitly provided
  let targetDomain = domain;
  if (!targetDomain && b) {
    // 1. Check mapped known brand domains
    for (const [key, dom] of Object.entries(BRAND_DOMAINS)) {
      if (b.includes(key)) {
        targetDomain = dom;
        break;
      }
    }
    // 2. Dynamic Brand Domain Analyzer for ANY new or custom brand in the world
    if (!targetDomain) {
      // Remove common suffix noise like "India", "Inc", "Pvt Ltd", "Audio", "Tech", "Official"
      const cleanBrand = b
        .replace(/\b(india|inc|corp|ltd|pvt|official|tech|audio|electronics|store|retail|appliances)\b/g, '')
        .replace(/[^a-z0-9]/g, '');

      if (cleanBrand.length >= 2) {
        targetDomain = `${cleanBrand}.com`;
      }
    }
  }

  // Determine simpleicons slug
  let slug = null;
  for (const [key, s] of Object.entries(SIMPLEICONS_SLUGS)) {
    if (b.includes(key)) {
      slug = s;
      break;
    }
  }

  const googleFaviconUrl = targetDomain ? `https://www.google.com/s2/favicons?domain=${targetDomain}&sz=128` : null;
  const simpleIconsUrl = slug ? `https://cdn.simpleicons.org/${slug}` : null;
  const clearbitUrl = targetDomain ? `https://logo.clearbit.com/${targetDomain}` : null;

  const handleErr = () => {
    setImgStep(prev => prev + 1);
  };

  // Step -1: Custom logo URL if explicitly provided on protection
  if (imgStep === -1 && logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${brand} logo`}
        onError={handleErr}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          borderRadius: size <= 32 ? '6px' : '10px',
          background: '#ffffff',
          padding: '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          ...style
        }}
      />
    );
  }

  // Step 0: Try Google Favicon 128px High-Res API (Analyzes brand domain & fetches logo dynamically)
  if (imgStep <= 0 && googleFaviconUrl) {
    return (
      <img
        src={googleFaviconUrl}
        alt={`${brand} logo`}
        onError={handleErr}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          borderRadius: size <= 32 ? '6px' : '10px',
          background: '#ffffff',
          padding: '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          ...style
        }}
      />
    );
  }

  // Step 1: SimpleIcons CDN
  if (imgStep <= 1 && simpleIconsUrl) {
    return (
      <img
        src={simpleIconsUrl}
        alt={`${brand} logo`}
        onError={handleErr}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          borderRadius: '4px',
          ...style
        }}
      />
    );
  }

  // Step 2: Clearbit CDN
  if (imgStep <= 2 && clearbitUrl) {
    return (
      <img
        src={clearbitUrl}
        alt={`${brand} logo`}
        onError={handleErr}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          borderRadius: '6px',
          ...style
        }}
      />
    );
  }

  // Step 3: Brand Badge Fallback
  let bgColor = '#2563eb';
  let label = (brand || 'WE').substring(0, 3).toUpperCase();
  if (b.includes('samsung')) { bgColor = '#1428A0'; label = 'SAMSUNG'; }
  else if (b.includes('sony')) { bgColor = '#000000'; label = 'SONY'; }
  else if (b.includes('meta')) { bgColor = '#0668e1'; label = 'META'; }
  else if (b.includes('lenskart')) { bgColor = '#000000'; label = 'LK'; }
  else if (b.includes('amazon')) { bgColor = '#ff9900'; label = 'AMZ'; }
  else if (b.includes('flipkart')) { bgColor = '#2874f0'; label = 'FK'; }
  else if (b.includes('vijaysales')) { bgColor = '#e31837'; label = 'VS'; }
  else if (b.includes('croma')) { bgColor = '#009e49'; label = 'CROMA'; }
  else if (b.includes('lenovo')) { bgColor = '#e1251b'; label = 'LEN'; }
  else if (b.includes('microsoft')) { bgColor = '#0078d4'; label = 'MSFT'; }
  else if (b.includes('spotify')) { bgColor = '#1db954'; label = 'SPOT'; }
  else if (b.includes('youtube')) { bgColor = '#ff0000'; label = 'YT'; }
  else if (b.includes('unidays')) { bgColor = '#2563eb'; label = 'UD'; }
  else if (b.includes('studentbeans')) { bgColor = '#7c3aed'; label = 'SB'; }
  else if (b.includes('lg')) { bgColor = '#a50034'; label = 'LG'; }
  else if (b.includes('bosch')) { bgColor = '#005691'; label = 'BOSCH'; }

  return (
    <div
      style={{
        background: bgColor,
        color: '#ffffff',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: size <= 28 ? '0.6rem' : '0.75rem',
        letterSpacing: '-0.02em',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      {label}
    </div>
  );
}
