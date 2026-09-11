/**
 * Deterministic Warranty Calculation & Consistency Engine for WarrantyEase.
 * Application logic validates & calculates — AI is NEVER allowed to guess or hallucinate.
 */

export function calculateWarrantyExpiry(startDateInput, durationMonths = 12) {
  let startDate = new Date();
  if (startDateInput) {
    const parsed = new Date(startDateInput);
    if (!isNaN(parsed.getTime())) {
      startDate = parsed;
    }
  }

  const months = Number(durationMonths) || 12;
  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + months);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let status = 'Active';
  if (daysLeft <= 0) {
    status = 'Expired';
  } else if (daysLeft <= 30) {
    status = 'Expiring Soon';
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedExpiry = `Expires ${monthNames[expiryDate.getMonth()]} ${expiryDate.getDate()}, ${expiryDate.getFullYear()}`;

  const totalDaysInPeriod = Math.max(30, Math.ceil((expiryDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const daysPassed = totalDaysInPeriod - daysLeft;
  const progressPercentage = daysLeft <= 0 
    ? 100 
    : Math.min(100, Math.max(5, Math.round((daysPassed / totalDaysInPeriod) * 100)));

  return {
    startDateStr: startDate.toISOString().split('T')[0],
    expiryDateStr: expiryDate.toISOString().split('T')[0],
    expiryFormatted: formattedExpiry,
    daysLeft: daysLeft > 0 ? daysLeft : 0,
    status,
    progressPercentage
  };
}

export function formatINR(price, currencySymbol = '₹') {
  const num = Number(price) || 0;
  if (currencySymbol === '$') {
    return `₹ ${(num * 83.5).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  return `${currencySymbol} ${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function getSerialLabelByCategory(category = 'Electronics') {
  const catLower = (category || '').toLowerCase();
  if (catLower.includes('vehicle') || catLower.includes('car')) {
    return 'VIN / Registration Number *';
  }
  if (catLower.includes('phone') || catLower.includes('mobile') || catLower.includes('screen')) {
    return 'Serial Number / IMEI *';
  }
  if (catLower.includes('computer') || catLower.includes('laptop')) {
    return 'Serial Number / Service Tag *';
  }
  if (catLower.includes('eyewear') || catLower.includes('specs')) {
    return 'Frame Tag / Order ID *';
  }
  if (catLower.includes('jewelry')) {
    return 'HUID / Certificate Serial # *';
  }
  return 'Serial Number / S/N *';
}

/**
 * Brand-Model Consistency Cross-Check Layer
 * Prevents accidental assignment of Samsung Washing Machine (WW80T...) to Apple or other wrong brands.
 */
export function validateBrandModelConsistency(brand, model) {
  if (!model) return { valid: true };
  const b = (brand || '').toLowerCase().trim();
  const m = (model || '').toLowerCase().trim();

  // 1. Samsung Washing Machines & Models
  if (m.includes('ww80') || m.includes('ww90') || m.includes('ecobubble') || m.includes('bespoke washer')) {
    if (b !== 'samsung') {
      return {
        valid: false,
        suggestedBrand: 'Samsung',
        reason: `Model "${model}" belongs to Samsung Washing Machines, not ${brand || 'unknown'}.`
      };
    }
  }

  // 2. Bosch Appliances
  if (m.includes('serie 6') || m.includes('serie 4') || m.includes('serie 8') || m.includes('bosch')) {
    if (b !== 'bosch') {
      return {
        valid: false,
        suggestedBrand: 'Bosch',
        reason: `Model "${model}" belongs to Bosch Home Appliances.`
      };
    }
  }

  // 3. Apple Devices
  if (m.includes('iphone') || m.includes('macbook') || m.includes('ipad') || m.includes('airpods')) {
    if (b !== 'apple') {
      return {
        valid: false,
        suggestedBrand: 'Apple',
        reason: `Model "${model}" belongs to Apple, not ${brand || 'unknown'}.`
      };
    }
  }

  return { valid: true };
}

export function checkForDuplicateProtection(newProduct, existingProtections = []) {
  if (!newProduct || !Array.isArray(existingProtections)) return null;
  const brand = (newProduct.brand || '').toLowerCase().trim();
  const serial = (newProduct.serialNumber || '').toLowerCase().trim();
  const model = (newProduct.model || '').toLowerCase().trim();

  return existingProtections.find((item) => {
    const itemBrand = (item.brand || '').toLowerCase().trim();
    const itemSerial = (item.serialNumber || '').toLowerCase().trim();
    const itemModel = (item.model || '').toLowerCase().trim();

    if (serial && itemSerial && serial === itemSerial && brand === itemBrand) {
      return true;
    }
    if (brand === itemBrand && model === itemModel && item.purchaseDate === newProduct.purchaseDate) {
      return true;
    }
    return false;
  });
}
