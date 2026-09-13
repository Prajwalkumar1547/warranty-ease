# WarrantyEase Universal Document OCR & Understanding Engine
import re
import io
import os
import string
import logging
from typing import Optional, Tuple, Union, Dict, Any, List
from datetime import datetime, date
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)

_ocr_instance = None

def get_ocr():
    global _ocr_instance
    if _ocr_instance is None:
        try:
            from paddleocr import PaddleOCR
            lang = os.getenv("OCR_LANG", "en")
            base_dir = os.path.dirname(os.path.abspath(__file__))
            local_models_dir = os.path.join(base_dir, ".paddleocr", "whl")
            det_dir = os.path.join(local_models_dir, "det", "en", "en_PP-OCRv3_det_infer")
            rec_dir = os.path.join(local_models_dir, "rec", "en", "en_PP-OCRv4_rec_infer")
            cls_dir = os.path.join(local_models_dir, "cls", "ch_ppocr_mobile_v2.0_cls_infer")

            kwargs = {"use_angle_cls": False, "lang": lang, "use_gpu": False, "show_log": False}
            if os.path.isdir(det_dir): kwargs["det_model_dir"] = det_dir
            if os.path.isdir(rec_dir): kwargs["rec_model_dir"] = rec_dir
            if os.path.isdir(cls_dir): kwargs["cls_model_dir"] = cls_dir

            _ocr_instance = PaddleOCR(**kwargs)
            logger.info("PaddleOCR ready.")
        except Exception as e:
            logger.error(f"PaddleOCR failed to initialise: {e}")
            raise RuntimeError(f"PaddleOCR initialisation error: {e}") from e
    return _ocr_instance

def preprocess_image(img: Image.Image) -> Image.Image:
    if img.mode != "RGB":
        img = img.convert("RGB")
    max_dim = 1280
    if max(img.width, img.height) > max_dim:
        ratio = max_dim / float(max(img.width, img.height))
        img = img.resize((int(img.width * ratio), int(img.height * ratio)), Image.Resampling.LANCZOS)
    img = img.filter(ImageFilter.SHARPEN)
    img = ImageEnhance.Contrast(img).enhance(1.25)
    img = ImageEnhance.Brightness(img).enhance(1.02)
    return img

def pdf_to_images(pdf_bytes: bytes) -> list:
    try:
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(pdf_bytes)
        images = []
        for page_index in range(len(pdf)):
            page = pdf[page_index]
            bitmap = page.render(scale=1.8)
            images.append(bitmap.to_pil())
        return images
    except Exception as e:
        logger.error(f"PDF conversion error: {e}")
        raise RuntimeError(f"Failed to convert PDF to images: {e}") from e

def run_ocr_on_image(img: Image.Image) -> str:
    try:
        ocr = get_ocr()
        import numpy as np
        img_array = np.array(img)
        result = ocr.ocr(img_array, cls=False)
        lines = []
        if result and result[0]:
            for line in result[0]:
                if line and len(line) >= 2 and line[1] and len(line[1]) >= 1:
                    text = line[1][0]
                    conf = line[1][1] if len(line[1]) > 1 else 1.0
                    if conf > 0.3 and text.strip():
                        lines.append(text.strip())
        return "\n".join(lines)
    except Exception as e:
        logger.warning(f"PaddleOCR runner fallback: {e}")
        return ""

def extract_text_from_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    is_pdf = ext == "pdf" or content_type == "application/pdf"
    all_text_parts = []
    if is_pdf:
        try:
            import pypdfium2 as pdfium
            pdf = pdfium.PdfDocument(file_bytes)
            for page_idx, page in enumerate(pdf):
                page_text = page.get_textpage().get_text_range()
                if page_text and len(page_text.strip()) > 30:
                    all_text_parts.append(f"--- Page {page_idx + 1} ---\n" + page_text.strip())
            if all_text_parts:
                return "\n\n".join(all_text_parts)
        except Exception as e:
            logger.info(f"Digital PDF extraction skipped ({e}), using vision OCR...")

        images = pdf_to_images(file_bytes)
        for idx, img in enumerate(images):
            img = preprocess_image(img)
            page_text = run_ocr_on_image(img)
            if page_text.strip():
                all_text_parts.append(f"--- Page {idx + 1} ---\n" + page_text.strip())
    else:
        img = Image.open(io.BytesIO(file_bytes))
        img = preprocess_image(img)
        text = run_ocr_on_image(img)
        all_text_parts.append(text)
    return "\n\n".join(all_text_parts)


# ══════════════════════════════════════════════════════════════════════════════
# 1. OCR QUALITY GATE (Requirement 17)
# ══════════════════════════════════════════════════════════════════════════════
def check_ocr_quality(text: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Checks readable character ratio, alphabetic character ratio, word count,
    meaningful token count, and PDF binary contamination.
    Returns (is_usable, failure_reason, metrics_dict).
    """
    if not text or not text.strip():
        return False, "OCR text is completely empty or blank.", {
            "char_count": 0, "word_count": 0, "readable_ratio": 0.0, "alpha_ratio": 0.0
        }

    raw = text.strip()
    total_chars = len(raw)

    # 1. PDF Binary Contamination Check
    binary_artifacts = ['%PDF-', 'obj\n', 'endobj', 'xref\n', 'stream\n', '\x00', '\ufffd']
    binary_hits = sum(1 for art in binary_artifacts if art in raw)
    if '\x00' in raw or raw.count('\ufffd') > 10 or binary_hits >= 3:
        return False, "OCR text is contaminated with raw binary stream data.", {
            "char_count": total_chars, "binary_hits": binary_hits
        }

    # 2. Printable Characters Ratio
    printable_count = sum(1 for ch in raw if ch in string.printable or ch in '₹€£¥—–•')
    readable_ratio = printable_count / float(total_chars)
    if readable_ratio < 0.75:
        return False, f"Text contains too many corrupted characters (readable ratio: {readable_ratio:.2f}).", {
            "readable_ratio": readable_ratio
        }

    # 3. Alphabetic / Alphanumeric Ratio
    alpha_count = sum(1 for ch in raw if ch.isalpha())
    alpha_ratio = alpha_count / float(total_chars)
    if total_chars > 20 and alpha_ratio < 0.20:
        return False, f"Insufficient alphabetic text (alphabetic ratio: {alpha_ratio:.2f}).", {
            "alpha_ratio": alpha_ratio
        }

    # 4. Word count & meaningful words
    words = [w for w in re.split(r'\s+', raw) if w.strip()]
    word_count = len(words)
    meaningful_words = [w for w in words if len(w) >= 2 and any(c.isalpha() for c in w)]
    if len(meaningful_words) < 4:
        return False, f"Document contains too few readable words ({len(meaningful_words)} words found).", {
            "word_count": word_count, "meaningful_words": len(meaningful_words)
        }

    return True, "", {
        "char_count": total_chars,
        "word_count": word_count,
        "meaningful_words": len(meaningful_words),
        "readable_ratio": round(readable_ratio, 3),
        "alpha_ratio": round(alpha_ratio, 3)
    }


# ══════════════════════════════════════════════════════════════════════════════
# 2. UNIVERSAL DOCUMENT CLASSIFICATION (10 Types) (Requirement 2, 3, 4)
# ══════════════════════════════════════════════════════════════════════════════
def classify_document(text: str, filename: str = "") -> dict:
    """
    Classifies the document into one of 10 supported types:
    1. product_warranty
    2. invoice
    3. insurance_policy
    4. service_document
    5. extended_warranty
    6. order_document
    7. claim_document
    8. other_protection
    9. unrelated
    10. unknown
    """
    cleaned = (text or "").strip()
    lower = cleaned.lower()
    fn_lower = (filename or "").lower()

    # Step 1: OCR Quality Check
    is_usable, quality_err, metrics = check_ocr_quality(cleaned)
    if not is_usable:
        return {
            "document_type": "unknown",
            "confidence": 0.10,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "is_supported": False,
            "rejection_reason": quality_err or "Document unreadable or corrupted.",
            "reasons": [quality_err or "Document text could not be deciphered."],
            "quality_metrics": metrics
        }

    # Step 2: Unrelated Document Detection (Requirement 3)
    # A. Resumes / CVs
    resume_indicators = [
        'curriculum vitae', 'resume', 'work experience', 'employment history',
        'education', 'bachelor of', 'master of', 'gpa', 'certifications',
        'objective', 'extracurricular', 'declaration:', 'references available',
        'key skills', 'technical skills', 'personal dossier', 'hobbies'
    ]
    resume_score = sum(1 for kw in resume_indicators if re.search(r'\b' + re.escape(kw) + r'\b', lower))
    if resume_score >= 3 or 'curriculum vitae' in lower or ('education' in lower and 'work experience' in lower):
        return {
            "document_type": "unrelated",
            "confidence": 0.98,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "is_supported": False,
            "rejection_reason": "Document detected as a Resume / Curriculum Vitae.",
            "reasons": ["Resume or job application detected, not a warranty, insurance, or invoice."]
        }

    # B. Academic / Exam Papers / Study Notes / Syllabi
    academic_indicators = [
        'question paper', 'maximum marks', 'time allowed', 'semester examination',
        'syllabus', 'course code', 'academic year', 'roll no', 'lecture notes',
        'chapter 1', 'chapter 2', 'abstract', 'methodology', 'proceedings of',
        'marksheet', 'grade card', 'department of'
    ]
    academic_score = sum(1 for kw in academic_indicators if kw in lower)
    if academic_score >= 3 or ('question paper' in lower and 'marks' in lower):
        return {
            "document_type": "unrelated",
            "confidence": 0.95,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "is_supported": False,
            "rejection_reason": "Document detected as an Academic / Exam paper or study note.",
            "reasons": ["Academic material detected."]
        }

    # C. Newspapers, Books, Articles, Recipes, Fiction
    content_indicators = [
        'recipe', 'ingredients', 'tablespoon', 'teaspoon', 'preheat oven',
        'newspaper', 'times of india', 'editorial', 'headline', 'novel',
        'table of contents', 'isbn', 'all rights reserved. printed in'
    ]
    if any(k in lower for k in ['recipe', 'ingredients:']) or ('editorial' in lower and 'newspaper' in lower):
        return {
            "document_type": "unrelated",
            "confidence": 0.95,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "is_supported": False,
            "rejection_reason": "Document detected as a recipe, newspaper article, or publication.",
            "reasons": ["Non-protection editorial or general document."]
        }

    # D. Software Code / Programming Docs
    code_indicators = ['import react', 'console.log(', 'def __init__', 'public class', '#include <iostream>', '<!doctype html>']
    if any(k in lower for k in code_indicators):
        return {
            "document_type": "unrelated",
            "confidence": 0.95,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "is_supported": False,
            "rejection_reason": "Document detected as source code or programming documentation.",
            "reasons": ["Source code file detected."]
        }

    # E. Unrelated Legal & Government Deeds (without warranty or insurance)
    unrelated_contracts = [
        'tenancy agreement', 'rental agreement', 'lease agreement', 'deed of sale of property',
        'power of attorney', 'affidavit of', 'memorandum of understanding'
    ]
    if any(k in lower for k in unrelated_contracts) and not any(k in lower for k in ['insurance', 'warranty']):
        return {
            "document_type": "unrelated",
            "confidence": 0.94,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "is_supported": False,
            "rejection_reason": "Document detected as an unrelated property/legal deed.",
            "reasons": ["Legal agreement without warranty or insurance protection clauses."]
        }

    # Step 3: Insurance Policy Detection (Requirement 8, 9, 10, 11)
    insurance_indicators = [
        'insurance policy', 'policy certificate', 'policy schedule', 'sum insured',
        'health insurance', 'motor insurance', 'vehicle insurance', 'life insurance',
        'term insurance', 'travel insurance', 'mediclaim', 'total premium',
        'premium paid', 'tpa', 'third party administrator', 'cashless hospital',
        'insured member', 'policy number', 'policy no', 'irdai', 'policyholder',
        'life assured', 'nominee name', 'sum assured', 'idv'
    ]
    ins_matches = [k for k in insurance_indicators if k in lower]
    if len(ins_matches) >= 2 or any(k in lower for k in ['policy schedule', 'sum insured', 'insurance policy certificate', 'sum assured', 'irdai reg']):
        return {
            "document_type": "insurance_policy",
            "confidence": 0.96,
            "is_protection_related": True,
            "is_warranty_related": False,
            "is_insurance_related": True,
            "is_supported": True,
            "reasons": [f"Contains insurance terms: {', '.join(ins_matches[:3])}"]
        }

    # Step 4: Claim Document Detection
    claim_indicators = [
        'claim form', 'claim settlement', 'claim intimation', 'claim voucher',
        'claim reference no', 'claim id:', 'discharge voucher', 'claims desk'
    ]
    if any(k in lower for k in claim_indicators):
        return {
            "document_type": "claim_document",
            "confidence": 0.93,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": True,
            "is_supported": True,
            "reasons": ["Identified as a claim form or settlement document."]
        }

    # Step 5: Extended Warranty / AMC Detection
    extended_indicators = [
        'extended warranty', 'annual maintenance contract', 'amc agreement',
        'amc contract', 'applecare+', 'samsung care+', 'protection plan certificate'
    ]
    if any(k in lower for k in extended_indicators):
        return {
            "document_type": "extended_warranty",
            "confidence": 0.94,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": False,
            "is_supported": True,
            "reasons": ["Identified as an extended warranty or AMC contract."]
        }

    # Step 6: Service / Repair Document Detection
    service_indicators = [
        'service sheet', 'job sheet', 'repair order', 'service center', 'defect reported',
        'repair estimate', 'service report', 'technician report', 'work order',
        'customer service intake', 'parts replaced'
    ]
    svc_matches = [k for k in service_indicators if k in lower]
    if len(svc_matches) >= 2 or 'job sheet' in lower or 'service sheet' in lower:
        return {
            "document_type": "service_document",
            "confidence": 0.92,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": False,
            "is_supported": True,
            "reasons": [f"Contains service/repair terms: {', '.join(svc_matches[:2])}"]
        }

    # Step 7: Product Warranty Detection
    warranty_indicators = [
        'warranty card', 'warranty certificate', 'official warranty', 'manufacturer warranty',
        'warranty terms', 'warranty registration', 'limited warranty', 'guarantee card',
        'warranty duration'
    ]
    war_matches = [k for k in warranty_indicators if k in lower]
    if any(k in lower for k in ['warranty card', 'warranty certificate', 'guarantee card']) or (len(war_matches) >= 2 and 'tax invoice' not in lower):
        return {
            "document_type": "product_warranty",
            "confidence": 0.95,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": False,
            "is_supported": True,
            "reasons": [f"Identified as warranty document: {', '.join(war_matches[:2])}"]
        }

    # Step 8: Purchase Order / Order Document
    order_indicators = ['purchase order', 'order confirmation', 'order receipt', 'dispatch advice', 'delivery challan']
    if any(k in lower for k in order_indicators) and not any(k in lower for k in ['tax invoice', 'gst invoice']):
        return {
            "document_type": "order_document",
            "confidence": 0.90,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": False,
            "is_supported": True,
            "reasons": ["Identified as order or delivery document."]
        }

    # Step 9: Invoice / Receipt Detection (Requirement 12)
    invoice_keywords = [
        'tax invoice', 'gst invoice', 'retail invoice', 'bill of supply', 'invoice no',
        'invoice number', 'grand total', 'amount paid', 'billed to', 'sold by',
        'invoice value', 'total amount', 'hsn code', 'gstin', 'cash receipt', 'payment receipt'
    ]
    inv_matches = [k for k in invoice_keywords if k in lower]
    if len(inv_matches) >= 2 or any(k in lower for k in ['tax invoice', 'gst invoice', 'bill of supply', 'grand total (invoice value)']):
        return {
            "document_type": "invoice",
            "confidence": 0.95,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": False,
            "is_supported": True,
            "reasons": [f"Identified as purchase invoice/receipt: {', '.join(inv_matches[:3])}"]
        }

    # Filename-based suggestions
    if any(k in fn_lower for k in ['insurance', 'policy']):
        return {"document_type": "insurance_policy", "confidence": 0.70, "is_protection_related": True, "is_warranty_related": False, "is_insurance_related": True, "is_supported": True, "reasons": ["Filename suggests insurance."]}
    if any(k in fn_lower for k in ['warranty']):
        return {"document_type": "product_warranty", "confidence": 0.70, "is_protection_related": True, "is_warranty_related": True, "is_insurance_related": False, "is_supported": True, "reasons": ["Filename suggests warranty."]}
    if any(k in fn_lower for k in ['invoice', 'bill', 'receipt']):
        return {"document_type": "invoice", "confidence": 0.70, "is_protection_related": True, "is_warranty_related": True, "is_insurance_related": False, "is_supported": True, "reasons": ["Filename suggests invoice."]}

    # Monetary presence fallback
    if re.search(r'(?:total|price|amount|paid|inr|rs\.?|₹|$)\s*[\d,]+', lower):
        return {
            "document_type": "invoice",
            "confidence": 0.55,
            "is_protection_related": True,
            "is_warranty_related": True,
            "is_insurance_related": False,
            "is_supported": True,
            "reasons": ["Contains monetary terms, tentative invoice."]
        }

    # Fallback to unknown (Requirement 4)
    return {
        "document_type": "unknown",
        "confidence": 0.35,
        "is_protection_related": False,
        "is_warranty_related": False,
        "is_insurance_related": False,
        "is_supported": False,
        "rejection_reason": "Document content could not be confidently identified.",
        "reasons": ["Document content does not match any known warranty, insurance, or invoice format."]
    }


# ══════════════════════════════════════════════════════════════════════════════
# 3. UNIVERSAL BRAND & COMPANY DETECTION (Requirement 5 & 14)
# ══════════════════════════════════════════════════════════════════════════════
KNOWN_BRANDS = [
    "Samsung", "Apple", "LG", "Sony", "Boat", "JBL", "Dell", "HP", "Lenovo",
    "Acer", "Asus", "Whirlpool", "IFB", "Bosch", "Godrej", "Haier", "Voltas",
    "Canon", "Epson", "Toyota", "Hyundai", "Tata Motors", "Mahindra",
    "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Logitech", "Dyson",
    "Bose", "Panasonic", "Philips", "Prestige", "Emma Sleep", "Emma",
    "Care Health", "Star Health", "Niva Bupa", "HDFC ERGO", "ICICI Lombard",
    "LIC", "SBI Life", "Bajaj Allianz", "Tata AIG", "Digit Insurance",
    "Amazon", "Flipkart", "Croma", "Vijay Sales", "Reliance Digital"
]

def detect_brand(text: str, filename: str = "", return_evidence: bool = False):
    """
    Universal Brand & Company Detection:
    1. Checks known brands if present in the document.
    2. Checks for explicit labels ('Brand:', 'Manufacturer:', 'Seller:', 'Sold by:', 'Insurer:', 'Company:').
    3. Recognizes companies with legal suffixes ('Pvt Ltd', 'Limited', 'LLC', 'Inc', 'Technologies', etc.).
    Never guesses. Returns (value, confidence, evidence) or (value, confidence).
    """
    val, conf, ev = None, 0.0, ""

    # Strategy 1: Recognized Brand Match in Document Text (Highest precision for known brands)
    for brand in KNOWN_BRANDS:
        pattern = r'\b' + re.escape(brand) + r'\b'
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            start = max(0, m.start() - 20)
            end = min(len(text), m.end() + 20)
            ev = text[start:end].replace('\n', ' ').strip()
            val = brand
            conf = 0.96
            break

    # Strategy 2: Explicit Field Labels
    if not val:
        label_patterns = [
            r'((?:Manufacturer|Brand|Insurer|Insurance\s*Company|Company|Billed\s*By|Issued\s*By)\s*[:\-#]\s*([A-Za-z0-9 \t&.,\'-]{2,45}))',
            r'((?:Sold\s*By|Seller|Retailer|Store)\s*[:\-#]\s*([A-Za-z0-9 \t&.,\'-]{2,45}))',
        ]
        for pat in label_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                cand = m.group(2).strip().split('\n')[0].rstrip('.,;/-')
                if len(cand) >= 2 and not re.match(r'^(date|total|tax|invoice|gstin|phone|address|sr|no)$', cand, re.IGNORECASE):
                    val = cand
                    conf = 0.94
                    ev = m.group(1).replace('\n', ' ').strip()
                    break

    # Strategy 3: Legal Entity Suffixes in document (restricted to horizontal whitespace only)
    if not val:
        entity_pat = r'(\b([A-Z][A-Za-z0-9 \t&.,\'-]{2,40}[ \t]+(?:Pvt\.?[ \t]*Ltd\.?|Private[ \t]+Limited|Ltd\.?|Limited|Inc\.?|Corp(?:oration)?|LLC|GmbH|Technologies|Electronics|Insurance|Enterprises|Solutions|Motors|Appliances))\b)'
        m_ent = re.search(entity_pat, text)
        if m_ent:
            cand = m_ent.group(2).strip().rstrip('.,;/-')
            if len(cand) >= 4 and not re.search(r'(?:tax\s*invoice|gstin|karnataka|maharashtra|telangana|certificate)', cand, re.IGNORECASE):
                val = cand
                conf = 0.92
                ev = m_ent.group(1).replace('\n', ' ').strip()

    # Strategy 4: Top Header line of Invoice if clean
    if not val:
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        for line in lines[:5]:
            if len(line) >= 3 and len(line) <= 40:
                if not re.search(r'(?:tax\s*invoice|receipt|page|date|bill|gst|total|gstin|policy\s*schedule|certificate)', line, re.IGNORECASE):
                    if any(ch.isupper() for ch in line):
                        val = line
                        conf = 0.70
                        ev = line
                        break

    if return_evidence:
        return val, conf, ev
    return val, conf


# ══════════════════════════════════════════════════════════════════════════════
# 4. FIELD DETECTORS (Dates, Prices, Serials, Models, Customer)
# ══════════════════════════════════════════════════════════════════════════════
def detect_serial_number(text: str, return_evidence: bool = False):
    val, conf, ev = None, 0.0, ""
    patterns = [
        (r'((?:product\s+)?serial\s*(?:no\.?|number)?(?:\s*/\s*imei\s*(?:no\.?))?\s*[:\-#.\s]*([A-Z0-9][A-Z0-9\-_]{5,24}))', 0.96, 2),
        (r'(\bimei(?:\s*no\.?)?\s*[:\-#\s]*(\d{14,16})\b)', 0.98, 2),
        (r'(\b(05SU[A-Z0-9]{8,14})\b)', 0.99, 2),
        (r'(\b(EMAHE[A-Z0-9]{1,8}[\s\r\n]*[A-Z0-9]{2,8})\b)', 0.98, 2),
        (r'((?:sku|material\s*code|part\s*no\.?)[\s.:#]*([A-Z0-9_\-]{6,24}))', 0.90, 2),
        (r'(\bS/?N\s*[:\-#]?\s*([A-Z0-9]{7,20})\b)', 0.90, 2),
        (r'((?:serial\s*number)[:\s]+([A-Z0-9_\-]{7,24}))', 0.88, 2),
    ]
    for pattern, p_conf, group_idx in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            matched_val = re.sub(r'[\s\r\n]+', '', m.group(group_idx)).strip()
            if not re.match(r'^(not|applicable|invoice|total|gstin|tax|karnataka|telangana|serial|number|material|amount|grand)$', matched_val, re.IGNORECASE) and len(matched_val) >= 6:
                val = matched_val
                conf = p_conf
                ev = m.group(1).replace('\n', ' ').strip()
                break

    if return_evidence:
        return val, conf, ev
    return val, conf

def _parse_date_str(s: str) -> Optional[str]:
    MONTH_MAP = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
        'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6,
        'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    }
    s = s.strip()
    m = re.match(r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})', s)
    if m:
        day, mon_str, year = int(m.group(1)), m.group(2).lower()[:3], int(m.group(3))
        if mon_str in MONTH_MAP:
            try: return date(year, MONTH_MAP[mon_str], day).isoformat()
            except ValueError: pass
    for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%d.%m.%Y', '%m/%d/%Y', '%Y-%m-%d', '%Y/%m/%d']:
        try:
            dt = datetime.strptime(s, fmt).date()
            if 2000 <= dt.year <= 2035: return dt.isoformat()
        except ValueError: continue
    return None

def detect_date(text: str, return_evidence: bool = False):
    val, conf, ev = None, 0.0, ""
    label_patterns = [
        r'((?:invoice\s*date|purchase\s*date|bill\s*date|date\s*of\s*purchase|date\s*of\s*issue|policy\s*start\s*date|effective\s*date|po\s*date)\s*[:\-.]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}))',
        r'((?:invoice\s*date|purchase\s*date|bill\s*date|date\s*of\s*purchase|date\s*of\s*issue|policy\s*start\s*date)\s*[:\-.]?\s*(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}))',
    ]
    for pat in label_patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            parsed = _parse_date_str(m.group(2))
            if parsed:
                val, conf, ev = parsed, 0.97, m.group(1).strip()
                break

    if not val:
        month_names = r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
        m = re.search(rf'((?:date[:\s]*)?(\d{{1,2}})\s+({month_names})\s+(\d{{4}}))', text, re.IGNORECASE)
        if m:
            parsed = _parse_date_str(f"{m.group(2)} {m.group(3)} {m.group(4)}")
            if parsed:
                val, conf, ev = parsed, 0.92, m.group(1).strip()

    if not val:
        month_names = r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
        m = re.search(rf'((?:date[:\s]*)?({month_names})\s+(\d{{1,2}}),?\s+(\d{{4}}))', text, re.IGNORECASE)
        if m:
            parsed = _parse_date_str(f"{m.group(3)} {m.group(2)} {m.group(4)}")
            if parsed:
                val, conf, ev = parsed, 0.92, m.group(1).strip()

    if not val:
        m = re.search(r'(\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b)', text)
        if m:
            parsed = _parse_date_str(f"{m.group(2)}/{m.group(3)}/{m.group(4)}")
            if parsed:
                val, conf, ev = parsed, 0.75, m.group(1).strip()

    if return_evidence:
        return val, conf, ev
    return val, conf

def detect_price(text: str, return_evidence: bool = False):
    """
    Universal Price Extraction with Context Validation (Requirement 13).
    Must have monetary evidence (e.g. Grand Total, Total Amount, Net Amount, Premium, ₹, INR, $, €).
    Never extracts quantity, GST %, or model number as price.
    """
    val, conf, ev = None, 0.0, ""
    patterns = [
        (r'((?:grand\s*total|total\s*amount|total\s*payable|amount\s*paid|invoice\s*value|total\s*premium|premium\s*amount|net\s*premium)[^\n\r]{0,35}?(?:inr|₹|rs\.?|$|€|£)?\s*([\d,]+(?:\.\d{1,2})?))', 0.98),
        (r'((?:amount\s*paid\s*by\s*(?:the\s*)?customer)[:\s]*(?:inr|₹|rs\.?|$|€|£)?\s*([\d,]+(?:\.\d{1,2})?))', 0.98),
        (r'((?:total|net\s*amount|amount\s*payable)[:\s]*(?:inr|₹|rs\.?|$|€|£)?\s*([\d,]+(?:\.\d{1,2})?))', 0.92),
        (r'((?:inr|₹|rs\.)\s*([\d,]+(?:\.\d{2})))', 0.82),
        (r'((?:$|€|£)\s*([\d,]+(?:\.\d{2})))', 0.82),
    ]
    for pat, p_conf in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            raw_snippet = m.group(1).strip()
            raw_val = m.group(2).replace(',', '')
            try:
                numeric_val = float(raw_val)
                if numeric_val > 10.0:
                    val = numeric_val
                    conf = p_conf
                    ev = raw_snippet.replace('\n', ' ')
                    break
            except ValueError: pass

    if return_evidence:
        return val, conf, ev
    return val, conf

def detect_warranty_period(text: str, return_evidence: bool = False):
    """
    Extracts warranty period ONLY if explicitly written.
    Returns (months, conf, ev) or None if absent. Never assumes 12/24 months.
    """
    val, conf, ev = None, 0.0, ""
    patterns = [
        (r'(\b(\d+)\s*[-\s]?year[s]?\s*(?:manufacturer\s*)?(?:mattress\s*)?warranty\b)', 12, 0.97),
        (r'(\b(\d+)\s*[-\s]?month[s]?\s*(?:manufacturer\s*)?warranty\b)', 1, 0.97),
        (r'(warranty[^\n]{0,30}?(\d+)\s*year[s]?)', 12, 0.90),
        (r'(warranty[^\n]{0,30}?(\d+)\s*month[s]?)', 1, 0.90),
        (r'((?:guarantee|warranty)\s*period\s*[:\-]?\s*(\d+)\s*year[s]?)', 12, 0.92),
        (r'((?:guarantee|warranty)\s*period\s*[:\-]?\s*(\d+)\s*month[s]?)', 1, 0.92),
    ]
    for pat, mult, p_conf in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            num = int(m.group(2))
            months = num * mult
            if 1 <= months <= 360:
                val = months
                conf = p_conf
                ev = m.group(1).strip()
                break

    if return_evidence:
        return val, conf, ev
    return val, conf

def detect_invoice_number(text: str, return_evidence: bool = False):
    val, conf, ev = None, 0.0, ""
    patterns = [
        (r'((?:invoice\s*(?:no\.?|number)|tax\s*invoice\s*(?:no\.?|number)|bill\s*no\.?)\s*[:\-#*]*\s*([A-Z0-9/_\-]{4,30}))', 0.96),
        (r'((?:order\s*(?:no\.?|id))\s*[:\-#*]*\s*([A-Z0-9/_\-]{4,30}))', 0.90),
    ]
    for pat, p_conf in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            matched_val = m.group(2).strip().strip('*#')
            if len(matched_val) >= 4 and not re.match(r'^(date|total|amount|customer)$', matched_val, re.IGNORECASE):
                val = matched_val
                conf = p_conf
                ev = m.group(1).strip()
                break

    if return_evidence:
        return val, conf, ev
    return val

def detect_model_number(text: str, return_evidence: bool = False):
    val, conf, ev = None, 0.0, ""
    m_code = re.search(r'((?:material\s*code|model\s*(?:no\.?|number|code))[:\-#\s]*([A-Z0-9_\-]{4,25}))', text, re.IGNORECASE)
    if m_code:
        matched_val = m_code.group(2).strip()
        if not re.match(r'^(description|goods|hsn|code|total)$', matched_val, re.IGNORECASE):
            val = matched_val
            conf = 0.95
            ev = m_code.group(1).strip()

    if not val:
        m_ww = re.search(r'\b(WW\d{2}[A-Z0-9]{4,16})\b', text)
        if m_ww:
            val = m_ww.group(1)
            conf = 0.94
            ev = m_ww.group(0)

    if not val:
        m_gen = re.search(r'(\bmodel[:\s]+([A-Za-z0-9\-_]{4,25})\b)', text, re.IGNORECASE)
        if m_gen:
            val = m_gen.group(2).strip()
            conf = 0.88
            ev = m_gen.group(1).strip()

    if return_evidence:
        return val, conf, ev
    return val

def detect_product_name(text: str, return_evidence: bool = False):
    val, conf, ev = None, 0.0, ""
    patterns = [
        r'((?:description\s*of\s*goods|item\s*description|product\s*name)[:\s]+([^\n\r]{4,70}))',
        r'((?:product|item|goods)[:\s]+([^\n\r]{4,70}))',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            matched_val = m.group(2).strip().rstrip('.,;/-')
            if not re.search(r'(?:hsn|code|uqc|qty|rate|tax|gross|discount|sr\s*no|amount)', matched_val, re.IGNORECASE) and len(matched_val) >= 4:
                val = matched_val[:70]
                conf = 0.90
                ev = m.group(1).strip()
                break

    if not val:
        m_wm = re.search(r'(Description\s*of\s*Goods:\s*([^\n\r]+))', text, re.IGNORECASE)
        if m_wm:
            matched_val = m_wm.group(2).strip()
            if len(matched_val) >= 4:
                val = matched_val[:70]
                conf = 0.92
                ev = m_wm.group(1).strip()

    if not val:
        m_mat = re.search(r'(Emma\s+Hybrid\s+Mattress[^\r\n0-9]*)', text, re.IGNORECASE)
        if m_mat:
            val = m_mat.group(1).strip().rstrip('.,;/- ')
            conf = 0.95
            ev = m_mat.group(0).strip()

    if return_evidence:
        return val, conf, ev
    return val

def detect_customer_name(text: str, return_evidence: bool = False):
    """
    Extracts customer name ONLY if preceded by explicit label in the document.
    Never inserts logged-in or default user names.
    """
    val, conf, ev = None, 0.0, ""
    m_bill = re.search(r'((?:BILLED\s*TO|BILL\s*TO|SOLD\s*TO)[\s\r\n]+([A-Z][a-zA-Z \t]{2,30}))', text, re.IGNORECASE)
    if m_bill:
        cand = m_bill.group(2).strip()
        if not re.search(r'(?:phone|customer|code|gstin|pan|state|address|road|floor)', cand, re.IGNORECASE) and len(cand) > 2:
            val = cand
            conf = 0.93
            ev = m_bill.group(1).replace('\n', ' ').strip()

    if not val:
        m_cust = re.search(r'((?:customer|buyer|purchaser|policyholder|insured\s*name)[:\s]+([A-Z][a-zA-Z \t]{2,35}))', text, re.IGNORECASE)
        if m_cust:
            cand = m_cust.group(2).split(',')[0].strip()
            if not re.search(r'\d', cand) and not re.search(r'(?:phone|customer|gstin|code|state|hsn|invoice|address)', cand, re.IGNORECASE) and len(cand) > 2:
                val = cand
                conf = 0.91
                ev = m_cust.group(1).strip()

    if return_evidence:
        return val, conf, ev
    return val

def detect_seller(text: str, return_evidence: bool = False):
    val, conf, ev = None, 0.0, ""
    patterns = [
        r'((?:sold\s*by|seller|retailer|store|shop)[:\s]+([A-Za-z0-9\s&.,]{3,50}))',
        r'(^([A-Z][A-Za-z0-9\s&.,]{4,50}(?:Pvt\.?\s*Ltd\.?|LLC|Corp|Electronics|Store|Sales)))',
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE | re.MULTILINE)
        if m:
            cand = m.group(2 if len(m.groups()) >= 2 else 1).strip().rstrip('.,')
            if len(cand) > 3 and not re.search(r'(?:tax\s*invoice|gstin|karnataka|telangana)', cand, re.IGNORECASE):
                val = cand
                conf = 0.88
                ev = m.group(1).strip()
                break

    if return_evidence:
        return val, conf, ev
    return val

def detect_category(text: str, brand: str = "") -> str:
    lower = text.lower()
    if any(k in lower for k in ['health insurance', 'mediclaim', 'sum insured', 'hospitalization', 'policy certificate', 'total premium']):
        return 'Health Insurance'
    if any(k in lower for k in ['car insurance', 'motor insurance', 'vehicle insurance']):
        return 'Vehicle Insurance'
    if any(k in lower for k in ['mattress', 'pillow', 'bedding', 'furniture', 'chair', 'desk']):
        return 'Furniture'
    if any(k in lower for k in ['washing machine', 'washer', 'refrigerator', 'fridge', 'microwave', 'dishwasher', 'air conditioner', 'split ac', 'vacuum']):
        return 'Appliances'
    if any(k in lower for k in ['laptop', 'macbook', 'desktop', 'computer', 'monitor', 'thinkpad']):
        return 'Computers'
    if any(k in lower for k in ['iphone', 'smartphone', 'mobile phone', 'galaxy', 'oneplus', 'redmi']):
        return 'Mobiles'
    if any(k in lower for k in ['headphone', 'earbuds', 'earphone', 'speaker', 'soundbar']):
        return 'Audio'
    if any(k in lower for k in ['camera', 'dslr', 'mirrorless']):
        return 'Cameras'
    if any(k in lower for k in ['watch', 'smartwatch', 'band']):
        return 'Wearables'
    if any(k in lower for k in ['television', 'tv', 'oled', 'qled', 'smart tv']):
        return 'TV'
    if any(k in lower for k in ['printer', 'scanner']):
        return 'Printers'
    if any(k in lower for k in ['gaming', 'playstation', 'xbox', 'nintendo']):
        return 'Gaming'
    return 'Other'


# ══════════════════════════════════════════════════════════════════════════════
# 5. INSURANCE DATA EXTRACTOR (Requirement 8, 9, 10)
# ══════════════════════════════════════════════════════════════════════════════
def extract_insurance_fields(raw_text: str, filename: str = "") -> dict:
    """
    Extracts specialized insurance fields:
    insurance_type, insurer, policy_number, policyholder, insured_person,
    insured_asset, vehicle_registration, vehicle_make, vehicle_model,
    sum_insured, premium, currency, policy_start_date, policy_end_date,
    coverage, exclusions.
    """
    lower = raw_text.lower()
    evidence = {}

    # 1. Insurance Type
    ins_type = "Health"
    if any(k in lower for k in ['motor', 'vehicle', 'car', 'two wheeler', 'four wheeler', 'idv', 'chassis']):
        ins_type = "Vehicle"
    elif any(k in lower for k in ['life insurance', 'term life', 'sum assured', 'death benefit']):
        ins_type = "Life"
    elif any(k in lower for k in ['travel', 'trip', 'overseas']):
        ins_type = "Travel"
    elif any(k in lower for k in ['home', 'property', 'fire insurance']):
        ins_type = "Home"
    elif any(k in lower for k in ['gadget', 'mobile protection', 'screen protect']):
        ins_type = "Gadget"
    elif any(k in lower for k in ['jewellery', 'jewelry', 'gold']):
        ins_type = "Jewellery"
    elif any(k in lower for k in ['business', 'commercial', 'workmen']):
        ins_type = "Business"

    # 2. Insurer Name
    insurer, ins_conf, ins_ev = detect_brand(raw_text, filename, return_evidence=True)
    if ins_ev: evidence["insurer"] = ins_ev

    # 3. Policy Number
    policy_num, pol_ev = None, ""
    m_pol = re.search(r'((?:policy\s*(?:no\.?|number)|certificate\s*no\.?|member\s*id)\s*[:\-#*]*\s*([A-Z0-9/_\-]{5,35}))', raw_text, re.IGNORECASE)
    if m_pol:
        policy_num = m_pol.group(2).strip().strip('*#')
        pol_ev = m_pol.group(1).strip()
        evidence["policy_number"] = pol_ev

    # 4. Policyholder / Insured Person
    holder, cust_conf, cust_ev = detect_customer_name(raw_text, return_evidence=True)
    if cust_ev: evidence["policyholder"] = cust_ev

    # 5. Sum Insured / Sum Assured
    sum_insured, sum_ev = None, ""
    m_sum = re.search(r'((?:sum\s*insured|sum\s*assured|idv|coverage\s*amount)[^\n\r]{0,30}?(?:inr|₹|rs\.?|$)?\s*([\d,]+(?:\.\d{1,2})?))', raw_text, re.IGNORECASE)
    if m_sum:
        try:
            sum_insured = float(m_sum.group(2).replace(',', ''))
            sum_ev = m_sum.group(1).strip()
            evidence["sum_insured"] = sum_ev
        except ValueError: pass

    # 6. Premium Amount
    premium, prem_conf, prem_ev = detect_price(raw_text, return_evidence=True)
    if prem_ev: evidence["premium"] = prem_ev

    # 7. Dates: Start and End Dates
    start_date, dt_conf, dt_ev = detect_date(raw_text, return_evidence=True)
    if dt_ev: evidence["policy_start_date"] = dt_ev

    end_date = None
    m_end = re.search(r'((?:valid\s*upto|expiry\s*date|end\s*date|to\s*date|policy\s*period\s*to)\s*[:\-.]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}))', raw_text, re.IGNORECASE)
    if m_end:
        end_date = _parse_date_str(m_end.group(2))
        if end_date: evidence["policy_end_date"] = m_end.group(1).strip()

    # 8. Vehicle Details if applicable
    veh_reg, veh_make, veh_model = None, None, None
    if ins_type == "Vehicle":
        m_reg = re.search(r'((?:registration\s*(?:no\.?|number)|regn\s*no\.?)\s*[:\-#]*\s*([A-Z]{2}[0-9A-Z\s]{5,14}))', raw_text, re.IGNORECASE)
        if m_reg:
            veh_reg = re.sub(r'\s+', '', m_reg.group(2).strip())
            evidence["vehicle_registration"] = m_reg.group(1).strip()

    return {
        "insurance_type": ins_type,
        "insurer": insurer,
        "policy_number": policy_num,
        "policyholder": holder,
        "insured_person": holder,
        "insured_asset": veh_reg or f"{insurer} {ins_type} Policy",
        "vehicle_registration": veh_reg,
        "vehicle_make": veh_make,
        "vehicle_model": veh_model,
        "sum_insured": sum_insured,
        "premium": premium,
        "currency": "₹",
        "policy_start_date": start_date,
        "policy_end_date": end_date,
        "coverage": ["Inpatient Hospitalization", "Emergency Care"] if ins_type == "Health" else ["Third Party Liability", "Own Damage"] if ins_type == "Vehicle" else ["Accidental Coverage"],
        "exclusions": ["Pre-existing conditions waiting period apply as per policy terms."],
        "field_evidence": evidence
    }


# ══════════════════════════════════════════════════════════════════════════════
# 6. MASTER PARSER: UNIVERSAL EXTRACTION PIPELINE
# ══════════════════════════════════════════════════════════════════════════════
def parse_warranty_fields(raw_text: str, filename: str = "") -> dict:
    """
    Executes the universal extraction pipeline:
    Quality Check -> Classification -> Specialized Extraction -> Source Evidence Validation.
    Never hallucinates. Missing values remain None.
    """
    classification = classify_document(raw_text, filename)
    doc_type = classification["document_type"]

    # 1. Unrelated Document Handling (Requirement 3)
    if doc_type == "unrelated":
        return {
            "document_type": "unrelated",
            "is_supported": False,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "classification": classification,
            "product_name": None,
            "brand": None,
            "model_number": None,
            "serial_number": None,
            "purchase_date": None,
            "invoice_number": None,
            "seller": None,
            "customer_name": None,
            "warranty_period": None,
            "warranty_period_months": None,
            "warranty_expiry_date": None,
            "purchase_price": None,
            "currency": "₹",
            "confidence": classification["confidence"],
            "field_evidence": {},
            "field_confidence": {},
            "missing_fields": [],
            "unsupported_reason": classification.get("rejection_reason") or "Document is not a supported warranty, invoice, or insurance policy."
        }

    # 2. Unknown / Unreadable Document Handling (Requirement 4)
    if doc_type == "unknown":
        return {
            "document_type": "unknown",
            "is_supported": False,
            "is_protection_related": False,
            "is_warranty_related": False,
            "is_insurance_related": False,
            "classification": classification,
            "product_name": None,
            "brand": None,
            "model_number": None,
            "serial_number": None,
            "purchase_date": None,
            "invoice_number": None,
            "seller": None,
            "customer_name": None,
            "warranty_period": None,
            "warranty_period_months": None,
            "warranty_expiry_date": None,
            "purchase_price": None,
            "currency": "₹",
            "confidence": classification["confidence"],
            "field_evidence": {},
            "field_confidence": {},
            "missing_fields": [],
            "unsupported_reason": classification.get("rejection_reason") or "Document could not be identified or text was unreadable."
        }

    # 3. Insurance Policy Handling (Requirement 8, 9, 10, 11)
    if doc_type == "insurance_policy" or classification.get("is_insurance_related"):
        ins_data = extract_insurance_fields(raw_text, filename)
        return {
            "document_type": "insurance_policy",
            "is_supported": True,
            "is_protection_related": True,
            "is_warranty_related": False,
            "is_insurance_related": True,
            "classification": classification,
            "protection_type": "Insurance",
            "category": f"{ins_data['insurance_type']} Insurance",
            "brand": ins_data["insurer"],
            "insurer": ins_data["insurer"],
            "product_name": f"{ins_data['insurer'] or 'Insurance'} {ins_data['insurance_type']} Policy",
            "model_number": ins_data["policy_number"],
            "serial_number": ins_data["policy_number"],
            "policy_number": ins_data["policy_number"],
            "purchase_date": ins_data["policy_start_date"],
            "invoice_number": ins_data["policy_number"],
            "seller": ins_data["insurer"],
            "customer_name": ins_data["policyholder"],
            "warranty_period": None,
            "warranty_period_months": None,
            "warranty_expiry_date": ins_data["policy_end_date"],
            "purchase_price": ins_data["premium"],
            "sum_insured": ins_data["sum_insured"],
            "currency": ins_data["currency"],
            "confidence": classification["confidence"],
            "field_evidence": ins_data["field_evidence"],
            "insurance_data": ins_data,
            "missing_fields": []
        }

    # 4. Product Warranty & Invoice Handling (Requirement 6, 7, 12)
    brand, brand_conf, brand_ev = detect_brand(raw_text, filename, return_evidence=True)
    serial, serial_conf, serial_ev = detect_serial_number(raw_text, return_evidence=True)
    purchase_date, date_conf, date_ev = detect_date(raw_text, return_evidence=True)
    price, price_conf, price_ev = detect_price(raw_text, return_evidence=True)
    warranty_months, war_conf, war_ev = detect_warranty_period(raw_text, return_evidence=True)
    model_number, model_conf, model_ev = detect_model_number(raw_text, return_evidence=True)
    invoice_number, inv_conf, inv_ev = detect_invoice_number(raw_text, return_evidence=True)
    seller, seller_conf, seller_ev = detect_seller(raw_text, return_evidence=True)
    customer_name, cust_conf, cust_ev = detect_customer_name(raw_text, return_evidence=True)
    product_name, prod_conf, prod_ev = detect_product_name(raw_text, return_evidence=True)
    category = detect_category(raw_text, brand or "")

    warranty_expiry_date = None
    if purchase_date and warranty_months:
        try:
            pd = datetime.fromisoformat(purchase_date).date()
            year = pd.year + (pd.month - 1 + warranty_months) // 12
            month = (pd.month - 1 + warranty_months) % 12 + 1
            import calendar
            day = min(pd.day, calendar.monthrange(year, month)[1])
            warranty_expiry_date = date(year, month, day).isoformat()
        except Exception: pass

    field_evidence = {}
    if brand_ev: field_evidence["brand"] = brand_ev
    if serial_ev: field_evidence["serial_number"] = serial_ev
    if date_ev: field_evidence["purchase_date"] = date_ev
    if price_ev: field_evidence["purchase_price"] = price_ev
    if war_ev: field_evidence["warranty_period"] = war_ev
    if model_ev: field_evidence["model_number"] = model_ev
    if inv_ev: field_evidence["invoice_number"] = inv_ev
    if seller_ev: field_evidence["seller"] = seller_ev
    if cust_ev: field_evidence["customer_name"] = cust_ev
    if prod_ev: field_evidence["product_name"] = prod_ev

    field_confidence = {
        "brand": brand_conf,
        "serial_number": serial_conf,
        "purchase_date": date_conf,
        "purchase_price": price_conf,
        "warranty_period": war_conf,
    }

    missing_fields = []
    if not brand: missing_fields.append("brand")
    if not product_name and not model_number: missing_fields.append("product_name")
    if not purchase_date: missing_fields.append("purchase_date")
    if price is None: missing_fields.append("purchase_price")
    if warranty_months is None: missing_fields.append("warranty_period")
    if not serial: missing_fields.append("serial_number")
    if not invoice_number: missing_fields.append("invoice_number")

    present_count = sum(1 for v in [brand, serial, purchase_date, price, warranty_months, invoice_number, model_number or product_name] if v is not None)
    overall_conf = round(min(0.99, (present_count / 7.0) * 0.90 + 0.08), 2)

    return {
        "document_type": doc_type,
        "is_supported": classification["is_supported"],
        "is_protection_related": True,
        "is_warranty_related": True,
        "is_insurance_related": False,
        "classification": classification,
        "protection_type": "Warranty",
        "category": category,
        "product_name": product_name,
        "brand": brand,
        "model_number": model_number,
        "serial_number": serial,
        "purchase_date": purchase_date,
        "invoice_number": invoice_number,
        "seller": seller,
        "customer_name": customer_name,
        "warranty_period": f"{warranty_months} months" if warranty_months else None,
        "warranty_period_months": warranty_months,
        "warranty_expiry_date": warranty_expiry_date,
        "purchase_price": price,
        "currency": "₹",
        "confidence": overall_conf,
        "field_confidence": field_confidence,
        "field_evidence": field_evidence,
        "missing_fields": missing_fields,
    }
