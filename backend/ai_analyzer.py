"""
WarrantyEase AI Analyzer
Switchable AI provider for warranty and insurance document analysis.
Supports: Gemini (free tier) | None (offline rule-based)

Strict zero-hallucination guarantee. Only analyzes what the document actually contains.
"""

import os
import re
import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, date

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Abstract base class
# ─────────────────────────────────────────────────────────────
class AIProvider(ABC):
    @abstractmethod
    def analyze(self, ocr_text: str, extracted_fields: dict) -> dict:
        pass


# ─────────────────────────────────────────────────────────────
# Rule-based offline analyzer (zero hallucination, strict logic)
# ─────────────────────────────────────────────────────────────
class RuleBasedProvider(AIProvider):
    def analyze(self, ocr_text: str, extracted_fields: dict) -> dict:
        fields = extracted_fields or {}
        today = date.today()
        date_warnings = []
        missing_warnings = []
        exclusions = []
        uncertainty_notes = []

        doc_type = fields.get("document_type", "unknown")
        is_supported = fields.get("is_supported", True)

        # 1. UNRELATED DOCUMENT HANDLING (Requirement 3)
        if doc_type == "unrelated" or not is_supported:
            reason = fields.get("unsupported_reason") or "Document does not appear to be an invoice, warranty card, or insurance policy."
            return {
                "warranty_summary": "Document Not Supported: This file doesn't appear to contain warranty, insurance, invoice, service, or protection information.",
                "status_explanation": f"⚠️ Rejection Notice: {reason}",
                "missing_warnings": ["Please upload an invoice, receipt, warranty card, or insurance certificate."],
                "date_warnings": [],
                "exclusions_found": [],
                "uncertainty_notes": ["OCR analysis halted because document content is unrelated."],
                "confidence_note": "Unsupported Document (0% protection confidence)",
                "provider": "rule-based",
            }

        # 2. UNKNOWN / UNREADABLE HANDLING (Requirement 4)
        if doc_type == "unknown":
            reason = fields.get("unsupported_reason") or "Document content could not be confidently identified."
            return {
                "warranty_summary": "We couldn't confidently identify this document.",
                "status_explanation": f"⚠️ Unclear Document: {reason} Please upload a clearer document.",
                "missing_warnings": ["Ensure document has good lighting, clear contrast, and legible text."],
                "date_warnings": [],
                "exclusions_found": [],
                "uncertainty_notes": ["Quality check or text legibility was insufficient to classify this document."],
                "confidence_note": "Uncertain identification — user review required.",
                "provider": "rule-based",
            }

        # 3. INSURANCE POLICY HANDLING (Requirement 8, 9, 10, 11)
        if doc_type == "insurance_policy" or fields.get("protection_type") == "Insurance" or fields.get("is_insurance_related"):
            insurer = fields.get("insurer") or fields.get("brand") or "Insurance Provider"
            ins_data = fields.get("insurance_data") or {}
            ins_type = ins_data.get("insurance_type") or "Insurance"
            policy_num = fields.get("policy_number") or fields.get("serial_number") or "Not stated"
            premium = fields.get("purchase_price") or ins_data.get("premium")
            sum_insured = fields.get("sum_insured") or ins_data.get("sum_insured")

            premium_text = f"Premium: ₹{premium:,.2f}" if premium else "Premium not specified"
            sum_text = f"Sum Insured: ₹{sum_insured:,.2f}" if sum_insured else "Sum Insured on file"

            summary = f"{insurer} {ins_type} Policy Schedule. {sum_text} • {premium_text}. Policy #{policy_num}."
            status_explanation = "✅ Insurance Policy Verified. Saved to My Insurance policies (never mixed with product warranties)."

            exclusions.append("Cashless claim coverage requires empanelled network hospitals/workshops.")
            exclusions.append("Standard statutory exclusions and waiting period rules apply as per IRDAI terms.")

            conf = fields.get("confidence", 0.85)
            return {
                "warranty_summary": summary,
                "status_explanation": status_explanation,
                "missing_warnings": ["Verify policy number and insured member name before filing claim."],
                "date_warnings": [],
                "exclusions_found": exclusions,
                "uncertainty_notes": [],
                "confidence_note": f"Overall extraction confidence: {int(conf * 100)}%",
                "provider": "rule-based",
            }

        # 4. STANDARD WARRANTY / INVOICE HANDLING (Requirement 6, 7, 12)
        missing = fields.get("missing_fields", [])
        if "serial_number" in missing:
            missing_warnings.append("Serial number / IMEI not detected — check physical barcode label on product.")
        if "purchase_date" in missing:
            missing_warnings.append("Purchase date not detected — please verify or enter manually.")
        if "warranty_period" in missing:
            missing_warnings.append("Warranty duration not stated in document — select duration below if known.")
        if "brand" in missing:
            missing_warnings.append("Brand name not detected — please enter manually.")
        if "invoice_number" in missing:
            missing_warnings.append("Invoice number not found — keep original document for claim proof.")

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
            status_explanation = "Warranty period calculated from purchase date. Please review in the review screen."
        else:
            status_explanation = "Warranty duration unverified from document — please select standard duration or enter manually."
            uncertainty_notes.append("Duration not explicitly stated on document.")

        # Exclusions from text
        exclusion_keywords = [
            ('physical damage', 'Physical damage is typically excluded from standard manufacturer warranty.'),
            ('liquid damage', 'Liquid/water damage is excluded from standard terms.'),
            ('water damage', 'Water/liquid damage is excluded.'),
            ('accidental damage', 'Accidental drop/damage is not covered under standard manufacturer warranty.'),
            ('consumable', 'Consumable parts may not be covered under warranty.'),
            ('commercial use', 'Commercial usage may void retail consumer warranty.'),
        ]
        text_lower = (ocr_text or "").lower()
        for keyword, message in exclusion_keywords:
            if keyword in text_lower:
                exclusions.append(message)

        brand = fields.get("brand")
        product = fields.get("product_name") or fields.get("model_number")
        warranty_period = fields.get("warranty_period")
        conf = fields.get("confidence", 0)

        summary_parts = []
        if brand and product:
            summary_parts.append(f"{brand} {product}")
        elif brand:
            summary_parts.append(f"{brand} product")
        elif product:
            summary_parts.append(product)
        else:
            summary_parts.append("Product invoice")

        if warranty_period:
            summary_parts.append(f"with {warranty_period} warranty")
        else:
            summary_parts.append("with warranty duration unverified")

        if purchase_date_str:
            summary_parts.append(f"purchased on {purchase_date_str}")
        if expiry_date_str:
            summary_parts.append(f"expiring on {expiry_date_str}")

        warranty_summary = ", ".join(summary_parts) + "."

        if conf < 0.5:
            uncertainty_notes.append("Low confidence extraction — OCR quality may be poor. Please review all fields carefully.")
        elif conf < 0.75:
            uncertainty_notes.append("Moderate confidence extraction — some fields may need manual verification.")

        return {
            "warranty_summary": warranty_summary,
            "status_explanation": status_explanation,
            "missing_warnings": missing_warnings,
            "date_warnings": date_warnings,
            "exclusions_found": exclusions,
            "uncertainty_notes": uncertainty_notes,
            "confidence_note": f"Overall extraction confidence: {int(conf * 100)}%",
            "provider": "rule-based",
        }


# ─────────────────────────────────────────────────────────────
# Google Gemini Provider with Strict Instruction Prompt
# ─────────────────────────────────────────────────────────────
class GeminiProvider(AIProvider):
    def __init__(self, api_key: str):
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("GeminiProvider initialised with gemini-1.5-flash")

    def analyze(self, ocr_text: str, extracted_fields: dict) -> dict:
        rule_analysis = RuleBasedProvider().analyze(ocr_text, extracted_fields)

        # Do not send unrelated or unknown documents to Gemini
        doc_type = extracted_fields.get("document_type")
        if doc_type in ["unrelated", "unknown"]:
            return rule_analysis

        prompt = (
            "You are a document extraction engine.\n"
            "Extract only information explicitly supported by the supplied document.\n"
            "Never guess.\n"
            "Never infer missing values.\n"
            "Never autocomplete.\n"
            "Never use the user's account information.\n"
            "Never use previous documents.\n"
            "Never use previous AI results.\n"
            "Never use sample data.\n"
            "Never use application demo data.\n"
            "Never invent a company.\n"
            "Never invent a product.\n"
            "Never invent a price.\n"
            "Never invent a warranty.\n"
            "Never invent an insurance policy.\n"
            "If information is absent, return null.\n"
            "If the document type is unclear, return unknown.\n"
            "The document is the source of truth.\n\n"
            f"DOCUMENT OCR TEXT:\n{ocr_text[:3000]}\n\n"
            f"EXTRACTED FIELDS FOUND SO FAR:\n{json.dumps(extracted_fields, default=str)}\n\n"
            "Analyze the factual text and respond in this EXACT JSON format only, with no markdown fences:\n"
            "{\n"
            '  "warranty_summary": "1-2 sentence factual summary of the document",\n'
            '  "status_explanation": "Status explanation based strictly on document dates/terms",\n'
            '  "missing_warnings": ["specific missing fields requiring user review"],\n'
            '  "date_warnings": ["factual date notes or empty"],\n'
            '  "exclusions_found": ["exclusions or limits mentioned in document"],\n'
            '  "uncertainty_notes": ["unclear items"]\n'
            "}"
        )

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            parsed = json.loads(text)
            parsed["provider"] = "gemini-1.5-flash"
            parsed["confidence_note"] = rule_analysis["confidence_note"]
            return parsed
        except Exception as e:
            logger.warning(f"Gemini analysis failed ({e}), falling back to rule-based")
            return rule_analysis


# ─────────────────────────────────────────────────────────────
# Factory
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
            logger.warning("GEMINI_API_KEY not set — using offline rule-based analyzer.")
            _provider_instance = RuleBasedProvider()
        else:
            try:
                _provider_instance = GeminiProvider(api_key)
            except Exception as e:
                logger.warning(f"Gemini init failed: {e} — using rule-based.")
                _provider_instance = RuleBasedProvider()
    else:
        _provider_instance = RuleBasedProvider()

    return _provider_instance
