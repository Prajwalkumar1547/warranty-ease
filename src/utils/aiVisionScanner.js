// aiVisionScanner.js — Production Client-Side Document Classifier & Parser
// ─────────────────────────────────────────────────────────────────────────────
// Strict zero-hallucination document extraction.
// Never uses fake demo data or hardcoded user names.
// If information is not explicitly found in the document, returns null.
// ─────────────────────────────────────────────────────────────────────────────

export const POPULAR_BRANDS = [
  'Samsung', 'Apple', 'Sony', 'LG', 'Bosch', 'Dyson', 'Logitech', 'Dell', 'HP',
  'Lenovo', 'OnePlus', 'Xiaomi', 'Meta', 'Lenskart', 'Bose', 'JBL', 'Whirlpool',
  'Emma Sleep', 'Emma',
  'Tata AIG', 'Star Health', 'HDFC ERGO', 'Care Health', 'Niva Bupa', 'Bajaj Allianz', 'ICICI Lombard',
  'Maruti Suzuki', 'Tanishq', 'Prestige', 'Philips', 'Panasonic', 'Godrej', 'Haier', 'Voltas',
  'Realme', 'Vivo', 'Oppo', 'Asus', 'Acer', 'Titan', 'Fastrack', 'Boat', 'Noise',
  'Amazon', 'Flipkart', 'Croma', 'Vijay Sales', 'Reliance Digital'
];

/**
 * Classifies document text into:
 * 'warranty' | 'invoice' | 'insurance' | 'service' | 'unrelated' | 'unknown'
 */
export function checkOcrQualityClient(text = '') {
  const raw = (text || '').trim();
  if (!raw) return { isUsable: false, reason: 'Document is completely empty.' };
  if (raw.includes('%PDF-') || raw.includes('\x00') || (raw.match(/\ufffd/g) || []).length > 8) {
    return { isUsable: false, reason: 'Raw binary stream detected in text.' };
  }
  const words = raw.split(/\s+/).filter(w => w.length >= 2 && /[a-zA-Z]/.test(w));
  if (words.length < 4) {
    return { isUsable: false, reason: 'Too few legible words found in document.' };
  }
  return { isUsable: true, reason: '' };
}

/**
 * Classifies document text into one of 10 universal types:
 * 'product_warranty' | 'invoice' | 'insurance_policy' | 'service_document' |
 * 'extended_warranty' | 'order_document' | 'claim_document' | 'other_protection' |
 * 'unrelated' | 'unknown'
 */
export function classifyDocumentText(text = '', fileName = '') {
  const cleaned = (text || '').trim();
  const lower = cleaned.toLowerCase();
  const fnLower = (fileName || '').toLowerCase();

  const quality = checkOcrQualityClient(cleaned);
  if (!quality.isUsable) {
    return {
      documentType: 'unknown',
      isSupported: false,
      isProtectionRelated: false,
      isWarrantyRelated: false,
      isInsuranceRelated: false,
      confidence: 0.1,
      reasons: [quality.reason]
    };
  }

  // 1. UNRELATED DOCUMENT CHECK (Resumes, Academic, Leases, Code, Recipes)
  const resumeKeywords = [
    'curriculum vitae', 'resume', 'work experience', 'education', 'skills',
    'employment history', 'bachelor of', 'master of', 'gpa', 'certifications',
    'objective', 'extracurricular', 'references available', 'declaration:'
  ];
  const resumeMatches = resumeKeywords.filter(k => lower.includes(k));
  if (resumeMatches.length >= 2 || lower.includes('curriculum vitae')) {
    return {
      documentType: 'unrelated',
      isSupported: false,
      isProtectionRelated: false,
      isWarrantyRelated: false,
      isInsuranceRelated: false,
      confidence: 0.98,
      reasons: ['Detected Resume / Curriculum Vitae. Not an invoice, warranty, or insurance document.']
    };
  }

  const academicKeywords = ['question paper', 'maximum marks', 'semester examination', 'syllabus', 'marksheet', 'course code'];
  if (academicKeywords.filter(k => lower.includes(k)).length >= 2) {
    return {
      documentType: 'unrelated',
      isSupported: false,
      isProtectionRelated: false,
      isWarrantyRelated: false,
      isInsuranceRelated: false,
      confidence: 0.95,
      reasons: ['Detected academic examination or coursework material.']
    };
  }

  const unrelatedAgreements = ['tenancy agreement', 'lease agreement', 'rental agreement', 'deed of sale of property', 'power of attorney', 'affidavit of'];
  if (unrelatedAgreements.some(k => lower.includes(k)) && !lower.includes('warranty') && !lower.includes('insurance')) {
    return {
      documentType: 'unrelated',
      isSupported: false,
      isProtectionRelated: false,
      isWarrantyRelated: false,
      isInsuranceRelated: false,
      confidence: 0.94,
      reasons: ['Detected unrelated legal or tenancy agreement without protection clauses.']
    };
  }

  // 2. INSURANCE CHECK
  const insKeywords = [
    'insurance policy', 'policy certificate', 'policy schedule', 'sum insured',
    'health insurance', 'motor insurance', 'vehicle insurance', 'life insurance',
    'mediclaim', 'total premium', 'premium paid', 'insured member', 'irdai', 'policyholder'
  ];
  const insMatches = insKeywords.filter(k => lower.includes(k));
  if (insMatches.length >= 2 || lower.includes('policy schedule') || lower.includes('sum insured')) {
    return {
      documentType: 'insurance_policy',
      isSupported: true,
      isProtectionRelated: true,
      isWarrantyRelated: false,
      isInsuranceRelated: true,
      confidence: 0.96,
      reasons: [`Insurance terms found: ${insMatches.slice(0, 3).join(', ')}`]
    };
  }

  // 3. SERVICE / REPAIR
  const svcKeywords = ['service sheet', 'job sheet', 'repair order', 'service center', 'defect reported', 'repair estimate'];
  const svcMatches = svcKeywords.filter(k => lower.includes(k));
  if (svcMatches.length >= 2 || lower.includes('job sheet')) {
    return {
      documentType: 'service_document',
      isSupported: true,
      isProtectionRelated: true,
      isWarrantyRelated: true,
      isInsuranceRelated: false,
      confidence: 0.92,
      reasons: [`Service terms found: ${svcMatches.slice(0, 2).join(', ')}`]
    };
  }

  // 4. EXTENDED WARRANTY
  if (lower.includes('extended warranty') || lower.includes('annual maintenance contract') || lower.includes('amc')) {
    return {
      documentType: 'extended_warranty',
      isSupported: true,
      isProtectionRelated: true,
      isWarrantyRelated: true,
      isInsuranceRelated: false,
      confidence: 0.94,
      reasons: ['Extended warranty or maintenance contract detected.']
    };
  }

  // 5. WARRANTY DOCUMENTS
  const warKeywords = ['warranty card', 'warranty certificate', 'official warranty', 'manufacturer warranty', 'guarantee card'];
  const warMatches = warKeywords.filter(k => lower.includes(k));
  if (warMatches.length >= 1 && !lower.includes('tax invoice')) {
    return {
      documentType: 'product_warranty',
      isSupported: true,
      isProtectionRelated: true,
      isWarrantyRelated: true,
      isInsuranceRelated: false,
      confidence: 0.95,
      reasons: [`Warranty certificate terms found: ${warMatches.join(', ')}`]
    };
  }

  // 6. INVOICE / RECEIPT
  const invKeywords = ['tax invoice', 'gst invoice', 'retail invoice', 'bill of supply', 'invoice no', 'grand total', 'amount paid', 'billed to', 'sold by'];
  const invMatches = invKeywords.filter(k => lower.includes(k));
  if (invMatches.length >= 2 || lower.includes('tax invoice') || lower.includes('grand total')) {
    return {
      documentType: 'invoice',
      isSupported: true,
      isProtectionRelated: true,
      isWarrantyRelated: true,
      isInsuranceRelated: false,
      confidence: 0.95,
      reasons: [`Invoice terms found: ${invMatches.slice(0, 3).join(', ')}`]
    };
  }

  // Filename hints
  if (fnLower.includes('invoice') || fnLower.includes('bill') || fnLower.includes('receipt')) {
    return { documentType: 'invoice', isSupported: true, isProtectionRelated: true, isWarrantyRelated: true, isInsuranceRelated: false, confidence: 0.70, reasons: ['Filename indicates invoice/receipt.'] };
  }
  if (fnLower.includes('warranty')) {
    return { documentType: 'product_warranty', isSupported: true, isProtectionRelated: true, isWarrantyRelated: true, isInsuranceRelated: false, confidence: 0.70, reasons: ['Filename indicates warranty document.'] };
  }
  if (fnLower.includes('insurance') || fnLower.includes('policy')) {
    return { documentType: 'insurance_policy', isSupported: true, isProtectionRelated: true, isWarrantyRelated: false, isInsuranceRelated: true, confidence: 0.70, reasons: ['Filename indicates insurance policy.'] };
  }

  if (/total|price|amount|paid|inr|rs\.?|₹|\$/i.test(lower)) {
    return { documentType: 'invoice', isSupported: true, isProtectionRelated: true, isWarrantyRelated: true, isInsuranceRelated: false, confidence: 0.60, reasons: ['Contains monetary terms.'] };
  }

  return {
    documentType: 'unknown',
    isSupported: false,
    isProtectionRelated: false,
    isWarrantyRelated: false,
    isInsuranceRelated: false,
    confidence: 0.35,
    reasons: ['Could not determine document type.']
  };
}

/**
 * Strict Document Parser for client-side extraction.
 * Guarantees zero hallucination — all missing fields return null.
 */
export function parseInvoiceTextRobust(rawText, fileName = '') {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  const fieldEvidence = {};

  // 1. Classify
  const classification = classifyDocumentText(text, fileName);
  if (!classification.isSupported) {
    return {
      rawText: text,
      documentType: classification.documentType,
      isSupported: false,
      unsupportedReason: classification.reasons[0] || 'Document not supported',
      brand: null,
      model: null,
      serialNumber: null,
      purchaseDate: null,
      price: null,
      currency: '₹',
      warrantyDurationMonths: null,
      invoiceNumber: null,
      customerName: null,
      seller: null,
      category: 'Other',
      protectionType: 'Warranty',
      documentConfidence: Math.round(classification.confidence * 100),
      fieldEvidence: {}
    };
  }

  // 2. Detect Brand
  let detectedBrand = null;
  let brandConfidence = 0;

  for (const b of POPULAR_BRANDS) {
    const rx = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const match = text.match(rx);
    if (match) {
      detectedBrand = b;
      brandConfidence = 96;
      const start = Math.max(0, match.index - 15);
      const end = Math.min(text.length, match.index + match[0].length + 15);
      fieldEvidence.brand = text.slice(start, end).replace(/\n/g, ' ').trim();
      break;
    }
  }

  if (!detectedBrand) {
    const soldMatch = text.match(/(?:sold\s*by|seller|manufacturer)[:\s]+([A-Za-z0-9\s&]{3,40})/i);
    if (soldMatch) {
      for (const b of POPULAR_BRANDS) {
        if (soldMatch[1].toLowerCase().includes(b.toLowerCase())) {
          detectedBrand = b;
          brandConfidence = 90;
          fieldEvidence.brand = soldMatch[0].trim();
          break;
        }
      }
    }
  }

  // 3. Detect Serial Number / IMEI (Strict: Never fabricate VAULT-SN)
  let detectedSerial = null;
  let serialConfidence = 0;

  const serialRegexes = [
    /(?:product\s+)?serial\s*(?:no\.?|number)?(?:\s*[\/|]\s*imei\s*(?:no\.?)?)?[\s.:#]*([A-Z0-9_-]{6,26})/i,
    /\bimei(?:\s*no\.?)?[\s.:#]*([0-9]{14,18})\b/i,
    /\b(05SU[A-Z0-9]{8,14})\b/,
    /\b(EMAHE[A-Z0-9]{1,8}[\s\r\n]*[A-Z0-9]{2,8})\b/,
    /(?:sku|material\s*code|part\s*no\.?)[\s.:#]*([A-Z0-9_-]{6,24})/i,
    /\bS\/?N[\s.:#]*([A-Z0-9]{7,22})\b/i,
    /(?:serial\s*number)[:\s]+([A-Z0-9_-]{7,24})/i
  ];

  for (const rx of serialRegexes) {
    const m = text.match(rx);
    if (m && m[1]) {
      const cleanVal = m[1].replace(/[\s*#]/g, '').trim();
      if (!/^(not|applicable|invoice|total|gstin|karnataka|telangana|serial|number)$/i.test(cleanVal) && cleanVal.length >= 6) {
        detectedSerial = cleanVal;
        serialConfidence = 95;
        fieldEvidence.serialNumber = m[0].replace(/\n/g, ' ').trim();
        break;
      }
    }
  }

  // 4. Detect Purchase / Invoice Date
  let detectedDate = null;
  let dateConfidence = 0;

  const dateMatch = text.match(/(?:invoice\s*date|po\s*date|date\s*of\s*issue|purchase\s*date|bill\s*date|order\s*date)[\s.:#]*(\d{1,4}[./-]\d{1,2}[./-]\d{1,4})/i);
  if (dateMatch) {
    const parts = dateMatch[1].split(/[./-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        detectedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        detectedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      if (detectedDate) {
        dateConfidence = 96;
        fieldEvidence.purchaseDate = dateMatch[0].trim();
      }
    }
  }

  if (!detectedDate) {
    const rawDate = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);
    if (rawDate) {
      detectedDate = `${rawDate[3]}-${rawDate[2].padStart(2, '0')}-${rawDate[1].padStart(2, '0')}`;
      dateConfidence = 78;
      fieldEvidence.purchaseDate = rawDate[0];
    }
  }

  // 5. Detect Price (Strict: Never fabricate category default prices)
  let detectedPrice = null;
  let priceConfidence = 0;

  const pricePatterns = [
    /(?:grand\s*total|total\s*amount|total\s*payable|amount\s*paid|invoice\s*value|total\s*premium)[^\n\r]{0,35}?(?:inr|₹|rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount\s*paid\s*by\s*(?:the\s*)?customer)[:\s]*(?:inr|₹|rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:total|net\s*amount|amount\s*payable)[:\s]*(?:inr|₹|rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const rx of pricePatterns) {
    const m = text.match(rx);
    if (m && m[1]) {
      const num = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(num) && num > 10) {
        detectedPrice = num;
        priceConfidence = 96;
        fieldEvidence.purchasePrice = m[0].replace(/\n/g, ' ').trim();
        break;
      }
    }
  }

  // 6. Detect Warranty Duration (Strict: Never guess 12 or 24 months)
  let warrantyDurationMonths = null;
  const warPatterns = [
    /(\b(\d+)\s*[-\s]?year[s]?\s*(?:manufacturer\s*)?(?:mattress\s*)?warranty\b)/i,
    /(\b(\d+)\s*[-\s]?month[s]?\s*(?:manufacturer\s*)?warranty\b)/i,
    /(warranty[^\n]{0,30}?(\d+)\s*year[s]?)/i,
    /(warranty[^\n]{0,30}?(\d+)\s*month[s]?)/i,
  ];

  for (const rx of warPatterns) {
    const m = text.match(rx);
    if (m) {
      const isYear = /year/i.test(m[0]);
      const num = parseInt(m[2] || m[1], 10);
      if (!isNaN(num)) {
        warrantyDurationMonths = isYear ? num * 12 : num;
        fieldEvidence.warrantyDuration = m[0].trim();
        break;
      }
    }
  }

  // 7. Detect Invoice Number (Strict: Never fabricate INV-XXXX)
  let invoiceNumber = null;
  const invMatch = text.match(/(?:invoice\s*(?:number|no\.?)|bill\s*no\.?|tax\s*invoice\s*no\.?)[\s.:#*]*([A-Z0-9/_\-]{4,28})/i);
  if (invMatch && invMatch[1]) {
    const cleanInv = invMatch[1].replace(/[*#]/g, '').trim();
    if (!/^(date|total|amount|customer)$/i.test(cleanInv)) {
      invoiceNumber = cleanInv;
      fieldEvidence.invoiceNumber = invMatch[0].trim();
    }
  }

  // 8. Detect Customer Name (Strict: Never inject logged-in user name)
  let customerName = null;
  const nameMatch = text.match(/(?:billed\s*to|bill\s*to|sold\s*to)[\s\r\n]+([A-Z][a-zA-Z \t]{2,30})/i);
  if (nameMatch) {
    const candidate = nameMatch[1].trim();
    if (!/^(inr|ground|floor|road|state|code|tax|portal|gstin)/i.test(candidate) && candidate.length > 2) {
      customerName = candidate;
      fieldEvidence.customerName = nameMatch[0].replace(/\n/g, ' ').trim();
    }
  }
  if (!customerName) {
    const custMatch = text.match(/(?:customer|buyer|purchaser)[:\s]+([A-Z][a-zA-Z \t]{2,30})/i);
    if (custMatch) {
      const candidate = custMatch[1].trim();
      if (!/\d/.test(candidate) && !/^(phone|customer|gstin)/i.test(candidate)) {
        customerName = candidate;
        fieldEvidence.customerName = custMatch[0].trim();
      }
    }
  }

  // 9. Detect Category
  let category = 'Other';
  if (lower.includes('health insurance') || lower.includes('mediclaim') || lower.includes('sum insured')) {
    category = 'Health Insurance';
  } else if (lower.includes('car insurance') || lower.includes('motor insurance')) {
    category = 'Vehicle Insurance';
  } else if (lower.includes('washing machine') || lower.includes('refrigerator') || lower.includes('air conditioner') || lower.includes('vacuum') || lower.includes('microwave')) {
    category = 'Appliances';
  } else if (lower.includes('mattress') || lower.includes('bed') || lower.includes('furniture')) {
    category = 'Furniture';
  } else if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('desktop') || lower.includes('thinkpad')) {
    category = 'Computers';
  } else if (lower.includes('iphone') || lower.includes('smartphone') || lower.includes('galaxy') || lower.includes('oneplus') || lower.includes('redmi')) {
    category = 'Mobiles';
  } else if (lower.includes('headphone') || lower.includes('earbuds') || lower.includes('speaker')) {
    category = 'Audio';
  } else if (lower.includes('television') || lower.includes('tv') || lower.includes('oled') || lower.includes('qled')) {
    category = 'TV';
  } else if (lower.includes('watch') || lower.includes('smartwatch')) {
    category = 'Wearables';
  }

  // 10. Model / Product Name
  let model = null;
  const descMatch = text.match(/(?:description\s*of\s*goods|item\s*description|product\s*name)[:\s]+([^\n\r]{4,70})/i);
  if (descMatch) {
    model = descMatch[1].trim().replace(/[.,;/-]+$/, '');
    fieldEvidence.productName = descMatch[0].trim();
  }

  const isInsurance = classification.documentType === 'insurance' || category.includes('Insurance');

  return {
    rawText: text,
    documentType: classification.documentType,
    isSupported: true,
    brand: detectedBrand,
    model: model,
    serialNumber: detectedSerial,
    purchaseDate: detectedDate,
    price: detectedPrice,
    currency: '₹',
    warrantyDurationMonths: warrantyDurationMonths,
    invoiceNumber: invoiceNumber,
    customerName: customerName,
    seller: null,
    category: category,
    protectionType: isInsurance ? 'Insurance' : 'Warranty',
    documentConfidence: detectedBrand ? 95 : 70,
    brandConfidence: brandConfidence,
    serialConfidence: serialConfidence,
    dateConfidence: dateConfidence,
    priceConfidence: priceConfidence,
    fieldEvidence: fieldEvidence
  };
}

/**
 * Client-side file processor fallback when offline.
 * Extracts any digital text from file.
 * Returns null for missing fields without inventing fake data.
 */
export async function extractInvoiceDataFromFile(file, previewDataUrl) {
  let extractedText = '';

  // If text file
  if (file && (file.type === 'text/plain' || file.name.endsWith('.txt'))) {
    try {
      extractedText = await file.text();
    } catch (e) {}
  }

  return parseInvoiceTextRobust(extractedText, file?.name || '');
}
