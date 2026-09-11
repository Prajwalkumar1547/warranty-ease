"""
WarrantyEase AI Analyzer
Switchable AI provider for warranty document analysis.
Supports: Gemini (free tier) | None (offline rule-based)

Never invents data. Only analyzes what OCR actually extracted.
"""

import os
import logging
from abc import ABC, abstractmethod
from datetime import datetime, date

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Abstract base class — every provider implements this
# ─────────────────────────────────────────────────────────────
class AIProvider(ABC):
    @abstractmethod
    def analyze(self, ocr_text: str, extracted_fields: dict) -> dict:
        """
        Analyze OCR text + extracted fields.
        Returns dict with keys:
          - warranty_summary: str (plain-language explanation)
          - status_explanation: str (active/expired/uncertain)
          - missing_warnings: list[str]
          - date_warnings: list[str]
          - exclusions_found: list[str]
          - uncertainty_notes: list[str]
          - confidence_note: str
        """
        pass


# ─────────────────────────────────────────────────────────────
# Rule-based offline analyzer (no API required)
# ─────────────────────────────────────────────────────────────
class RuleBasedProvider(AIProvider):
    def analyze(self, ocr_text: str, extracted_fields: dict) -> dict:
        fields = extracted_fields
        today = date.today()
        warnings = []
        date_warnings = []
        missing_warnings = []
        exclusions = []
        uncertainty_notes = []

        # Missing field warnings
        missing = fields.get("missing_fields", [])
        if "serial_number" in missing:
            missing_warnings.append("Serial number not found — may be required for warranty claims.")
        if "purchase_date" in missing:
            missing_warnings.append("Purchase date not detected — warranty period cannot be calculated automatically.")
        if "warranty_period" in missing:
            missing_warnings.append("Warranty duration not detected — enter it manually in the review screen.")
        if "brand" in missing:
            missing_warnings.append("Brand name not detected — please enter manually.")
        if "invoice_number" in missing:
            missing_warnings.append("Invoice number not found — keep the original document for claim proof.")

        # Date validation
        purchase_date_str = fields.get("purchase_date")
        expiry_date_str = fields.get("warranty_expiry_date")

        if purchase_date_str:
            try:
                pd = datetime.fromisoformat(purchase_date_str).date()
                if pd > today:
                    date_warnings.append(f"Purchase date ({purchase_date_str}) appears to be in the future — please verify.")
                if pd.year < 2000:
                    date_warnings.append(f"Purchase date ({purchase_date_str}) seems unusually old — please verify.")
            except ValueError:
                date_warnings.append("Purchase date format could not be validated — please check.")

        if expiry_date_str:
            try:
                ed = datetime.fromisoformat(expiry_date_str).date()
                days_left = (ed - today).days
                if days_left < 0:
                    status_explanation = f"⚠️ Warranty EXPIRED {abs(days_left)} days ago (on {expiry_date_str})."
                elif days_left <= 30:
                    status_explanation = f"🔴 WARRANTY EXPIRING SOON — {days_left} days remaining (expires {expiry_date_str}). File claims immediately if needed."
                elif days_left <= 90:
                    status_explanation = f"🟡 Warranty expiring in {days_left} days ({expiry_date_str}). Consider extended warranty options."
                else:
                    status_explanation = f"✅ Warranty is ACTIVE. {days_left} days remaining (expires {expiry_date_str})."
            except ValueError:
                status_explanation = "Warranty expiry date could not be validated — please verify manually."
        elif purchase_date_str and fields.get("warranty_period_months"):
            status_explanation = "Warranty period calculated from purchase date. Please review the expiry date in the review screen."
        else:
            status_explanation = "Warranty status unknown — purchase date and/or warranty period not detected. Please fill in manually."
            uncertainty_notes.append("Could not determine warranty status automatically.")

        # Exclusion detection from text
        exclusion_keywords = [
            ('physical damage', 'Physical damage is typically excluded from manufacturer warranty.'),
            ('liquid damage', 'Liquid damage is excluded.'),
            ('water damage', 'Water/liquid damage is excluded.'),
            ('accidental damage', 'Accidental damage is not covered under standard warranty.'),
            ('consumable', 'Consumable parts may not be covered.'),
            ('cosmetic', 'Cosmetic defects may not be covered.'),
            ('misuse', 'Damage from misuse or unauthorized repair is excluded.'),
            ('commercial use', 'Commercial use may void the warranty.'),
        ]
        text_lower = ocr_text.lower()
        for keyword, message in exclusion_keywords:
            if keyword in text_lower:
                exclusions.append(message)

        # Build summary
        brand = fields.get("brand", "Unknown brand")
        product = fields.get("product_name") or fields.get("model_number") or "product"
        warranty_period = fields.get("warranty_period", "unknown duration")
        conf = fields.get("confidence", 0)

        summary_parts = []
        if brand and brand != "Unknown brand":
            summary_parts.append(f"This is a {brand} {product} with {warranty_period} warranty")
        else:
            summary_parts.append(f"Document shows a product with {warranty_period} warranty")

        if purchase_date_str:
            summary_parts.append(f"purchased on {purchase_date_str}")
        if expiry_date_str:
            summary_parts.append(f"expiring on {expiry_date_str}")

        warranty_summary = ", ".join(summary_parts) + "." if summary_parts else "Warranty information extracted — please review all fields."

        if conf < 0.5:
            uncertainty_notes.append("Low confidence extraction — OCR quality may be poor. Please review all fields carefully.")
        elif conf < 0.75:
            uncertainty_notes.append("Moderate confidence extraction — some fields may need manual correction.")

        return {
            "warranty_summary": warranty_summary,
            "status_explanation": status_explanation if 'status_explanation' in dir() else "Review required.",
            "missing_warnings": missing_warnings,
            "date_warnings": date_warnings,
            "exclusions_found": exclusions,
            "uncertainty_notes": uncertainty_notes,
            "confidence_note": f"Overall extraction confidence: {int(conf * 100)}%",
            "provider": "rule-based",
        }


# ─────────────────────────────────────────────────────────────
# Google Gemini Provider (free tier)
# ─────────────────────────────────────────────────────────────
class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("GeminiProvider initialised with gemini-1.5-flash")

    def analyze(self, ocr_text: str, extracted_fields: dict) -> dict:
        # First get rule-based analysis as a baseline
        rule_analysis = RuleBasedProvider().analyze(ocr_text, extracted_fields)

        prompt = f"""You are a warranty analysis expert. Analyze the following warranty document OCR text and extracted fields.

IMPORTANT RULES:
- ONLY use information present in the OCR text. Do NOT invent facts.
- If something is unclear, say it is unclear.
- Be concise and practical.

OCR TEXT:
\"\"\"
{ocr_text[:3000]}
\"\"\"

EXTRACTED FIELDS:
{extracted_fields}

Please provide:
1. A 1-2 sentence plain-language warranty summary (what product, what coverage, how long)
2. Is the warranty currently active, expired, or unknown? (with reason)
3. List any missing important fields (max 4 items)
4. List any date inconsistencies or concerns (max 3 items)  
5. List any warranty exclusions or conditions found in the text (max 4 items)
6. List any uncertainty or low-confidence concerns (max 3 items)

Respond in this EXACT JSON format only, no markdown:
{{
  "warranty_summary": "...",
  "status_explanation": "...",
  "missing_warnings": ["...", "..."],
  "date_warnings": ["...", "..."],
  "exclusions_found": ["...", "..."],
  "uncertainty_notes": ["...", "..."]
}}"""

        try:
            response = self.model.generate_content(prompt)
            import json
            text = response.text.strip()
            # Strip markdown code fences if present
            text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            parsed = json.loads(text)
            parsed["provider"] = "gemini-1.5-flash"
            parsed["confidence_note"] = rule_analysis["confidence_note"]
            return parsed
        except Exception as e:
            logger.warning(f"Gemini analysis failed ({e}), falling back to rule-based")
            return rule_analysis


# ─────────────────────────────────────────────────────────────
# Factory — reads AI_PROVIDER env var
# ─────────────────────────────────────────────────────────────
_provider_instance: AIProvider = None

def get_ai_provider() -> AIProvider:
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    provider_name = os.getenv("AI_PROVIDER", "none").lower().strip()
    if provider_name == "gemini":
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.warning("GEMINI_API_KEY not set — falling back to rule-based analyzer.")
            _provider_instance = RuleBasedProvider()
        else:
            try:
                _provider_instance = GeminiProvider(api_key)
            except Exception as e:
                logger.warning(f"Gemini init failed: {e} — falling back to rule-based.")
                _provider_instance = RuleBasedProvider()
    else:
        logger.info("AI_PROVIDER=none — using offline rule-based analyzer.")
        _provider_instance = RuleBasedProvider()

    return _provider_instance
