"""
WarrantyEase Universal OCR Engine Test Suite
Tests pure Python extraction, classification, quality gate, and isolation.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ocr_engine import (
    check_ocr_quality, detect_brand, detect_serial_number, detect_date,
    detect_price, detect_invoice_number, detect_model_number,
    detect_warranty_period, classify_document, parse_warranty_fields,
    extract_insurance_fields
)

SAMSUNG_INVOICE = """TAX INVOICE Samsung India Electronics Pvt. Ltd.
Invoice Number: 29S1I4082713 Invoice Date: 21.09.2024
Description of Goods: Washing Machine Material Code: WW12DB7B24GSTL
Product Serial No./IMEI No: 05SU5PBX900128
Grand Total (Invoice Value) 45,892.00
Amount paid by the Customer: INR 45892.0
Customer: Jane Doe, Phone: 9866130006
Warranty: 2 Year Manufacturer Warranty"""

def test_ocr_quality_gate():
    # Valid text
    ok, err, m = check_ocr_quality("TAX INVOICE Samsung Washing Machine Total: INR 45000 Date: 2024-05-10")
    assert ok is True
    assert err == ""

    # Empty text
    ok_empty, err_empty, _ = check_ocr_quality("")
    assert ok_empty is False

    # Binary / corrupted PDF stream
    corrupted_text = "%PDF-1.4 obj\nendobj\nxref\nstream\n\x00\ufffd\ufffd\ufffd\ufffd"
    ok_bin, err_bin, _ = check_ocr_quality(corrupted_text)
    assert ok_bin is False

    # Short illegible characters
    ok_short, err_short, _ = check_ocr_quality(".. !! ??")
    assert ok_short is False

def test_brand_detection():
    brand, conf = detect_brand(SAMSUNG_INVOICE)
    assert brand == "Samsung", f"Expected Samsung, got {brand}"
    assert conf >= 0.90

def test_serial_detection():
    serial, conf = detect_serial_number(SAMSUNG_INVOICE)
    assert serial == "05SU5PBX900128", f"Expected 05SU5PBX900128, got {serial}"
    assert conf >= 0.90

def test_date_detection():
    dt, conf = detect_date(SAMSUNG_INVOICE)
    assert dt == "2024-09-21", f"Expected 2024-09-21, got {dt}"
    assert conf >= 0.80

def test_price_detection():
    price, conf = detect_price(SAMSUNG_INVOICE)
    assert price == 45892.0, f"Expected 45892.0, got {price}"
    assert conf >= 0.85

def test_invoice_number():
    inv = detect_invoice_number(SAMSUNG_INVOICE)
    assert inv is not None
    assert "29S1I4082713" in inv

def test_model_number():
    model = detect_model_number(SAMSUNG_INVOICE)
    assert model is not None
    assert "WW12DB7B24GSTL" in model

def test_warranty_period():
    months, conf = detect_warranty_period(SAMSUNG_INVOICE)
    assert months == 24, f"Expected 24 months, got {months}"
    assert conf >= 0.85

def test_full_parse():
    result = parse_warranty_fields(SAMSUNG_INVOICE, "samsung_invoice.jpg")
    assert result["document_type"] == "invoice"
    assert result["is_supported"] is True
    assert result["brand"] == "Samsung"
    assert result["serial_number"] == "05SU5PBX900128"
    assert result["purchase_date"] == "2024-09-21"
    assert result["purchase_price"] == 45892.0
    assert result["warranty_period_months"] == 24
    assert result["confidence"] > 0.5
    assert result["warranty_expiry_date"] == "2026-09-21"
    assert "brand" in result["field_evidence"]
    assert "purchase_price" in result["field_evidence"]

def test_universal_unknown_company_detection():
    # Company that is NOT in any database list
    unfamiliar_text = """TAX INVOICE
Seller: Apex Audio Technologies Pvt. Ltd.
Invoice Number: APX-2025-9912 Date: 14.02.2025
Item Description: Studio Reference Monitor 8-Inch
Serial Number: APX800918291
Grand Total: INR 34,500.00
1 Year Manufacturer Warranty Included"""
    brand, conf, ev = detect_brand(unfamiliar_text, return_evidence=True)
    assert brand is not None
    assert "Apex Audio Technologies" in brand
    assert "Seller:" in ev or "Apex Audio Technologies" in ev

    result = parse_warranty_fields(unfamiliar_text, "apex_audio.pdf")
    assert "Apex Audio Technologies" in (result["brand"] or "")
    assert result["purchase_price"] == 34500.0
    assert result["warranty_period_months"] == 12

def test_insurance_policy_extraction():
    health_policy_text = """POLICY SCHEDULE & CERTIFICATE OF INSURANCE
Care Health Insurance Limited
Policy Number: 18002910291 Date of Issue: 2025-04-10
Policy Period: 2025-04-10 to 2026-04-09
Policyholder: Priya Sharma
Sum Insured: INR 10,00,000.00
Total Premium: INR 18,450.00
Cashless Network Hospital & Hospitalization Cover"""
    result = parse_warranty_fields(health_policy_text, "care_health.pdf")
    assert result["document_type"] == "insurance_policy"
    assert result["is_insurance_related"] is True
    assert result["is_warranty_related"] is False
    assert result["protection_type"] == "Insurance"
    assert result["brand"] == "Care Health"
    assert result["policy_number"] == "18002910291"
    assert result["customer_name"] == "Priya Sharma"
    assert result["sum_insured"] == 1000000.0
    assert result["purchase_price"] == 18450.0
    # Crucial requirement: Insurance must NOT create a product warranty
    assert result["warranty_period_months"] is None
    assert result["warranty_period"] is None

def test_vehicle_insurance_extraction():
    vehicle_policy_text = """MOTOR VEHICLE INSURANCE POLICY SCHEDULE
ICICI Lombard General Insurance Co. Ltd.
Policy Number: MOT-CAR-9910283
Registration No: MH02AB1234
Insured Person: Vikram Singh
IDV (Sum Insured): INR 6,50,000.00
Total Premium: INR 14,200.00
Valid from 2025-01-01 to 2026-01-01"""
    result = parse_warranty_fields(vehicle_policy_text, "car_insurance.pdf")
    assert result["document_type"] == "insurance_policy"
    assert result["protection_type"] == "Insurance"
    assert result["category"] == "Vehicle Insurance"
    assert result["brand"] == "ICICI Lombard"
    assert result["policy_number"] == "MOT-CAR-9910283"
    assert result["warranty_period_months"] is None

def test_unrelated_document_rejection():
    resume_text = """CURRICULUM VITAE
Jane Candidate
Education: Bachelor of Science in Information Technology
Work Experience: 5 years in marketing at Global Agency
Technical Skills: Python, Machine Learning, Leadership
Objective: Seeking senior developer role."""
    result = parse_warranty_fields(resume_text, "resume.pdf")
    assert result["document_type"] == "unrelated"
    assert result["is_supported"] is False
    assert result["brand"] is None
    assert result["product_name"] is None
    assert result["purchase_price"] is None
    assert result["warranty_period_months"] is None

def test_invoice_without_warranty_duration_returns_none():
    invoice_no_warranty = """TAX INVOICE Apple India Private Limited
Invoice Number: APL-992182 Date: 2025-11-04
Product: iPhone 16 Pro Max 256GB
Serial Number: F2LPD9910291
Grand Total: ₹ 1,19,900.00"""
    result = parse_warranty_fields(invoice_no_warranty, "apple_bill.pdf")
    assert result["brand"] == "Apple"
    assert result["purchase_price"] == 119900.0
    assert result["serial_number"] == "F2LPD9910291"
    assert result["warranty_period_months"] is None
    assert "warranty_period" in result["missing_fields"]

def test_no_logged_in_user_name_inserted():
    invoice_no_user = """TAX INVOICE Sony India Pvt. Ltd.
Invoice Number: SONY-9921 Date: 2025-05-12
Product: WH-1000XM5 Headphones
Grand Total: ₹ 22,990.00"""
    result = parse_warranty_fields(invoice_no_user, "sony_bill.pdf")
    assert result["customer_name"] is None
    assert result["customer_name"] != "Srishailam Potti"

def test_sequential_document_independence():
    # Doc A: Samsung Warranty
    resA = parse_warranty_fields(SAMSUNG_INVOICE, "docA.pdf")
    assert resA["brand"] == "Samsung"
    assert resA["purchase_price"] == 45892.0

    # Doc B: Insurance Policy
    resB = parse_warranty_fields("""POLICY SCHEDULE
Care Health Insurance Limited
Policy Number: CH-9901
Policyholder: Ananya Gupta
Total Premium: INR 12,000.00""", "docB.pdf")
    assert resB["document_type"] == "insurance_policy"
    assert resB["brand"] == "Care Health"
    assert resB["purchase_price"] == 12000.0
    # Verify no leak from Doc A
    assert resB["customer_name"] != "Jane Doe"
    assert resB["brand"] != "Samsung"
    assert resB["serial_number"] != "05SU5PBX900128"

    # Doc C: Unrelated Resume
    resC = parse_warranty_fields("""CURRICULUM VITAE
Kiran Rao
Education: B.Tech Computer Science
Skills: Python, React
Work Experience: 3 years at Startup""", "docC.pdf")
    assert resC["document_type"] == "unrelated"
    assert resC["is_supported"] is False
    assert resC["brand"] is None
    assert resC["purchase_price"] is None

    # Doc D: Another company's invoice (Apple)
    resD = parse_warranty_fields("""TAX INVOICE
Seller: Apple India Pvt. Ltd.
Invoice Number: INV-99001
Grand Total: INR 89,900.00""", "docD.pdf")
    assert resD["brand"] == "Apple"
    assert resD["purchase_price"] == 89900.0
    assert resD["customer_name"] is None

if __name__ == "__main__":
    tests = [
        test_ocr_quality_gate,
        test_brand_detection,
        test_serial_detection,
        test_date_detection,
        test_price_detection,
        test_invoice_number,
        test_model_number,
        test_warranty_period,
        test_full_parse,
        test_universal_unknown_company_detection,
        test_insurance_policy_extraction,
        test_vehicle_insurance_extraction,
        test_unrelated_document_rejection,
        test_invoice_without_warranty_duration_returns_none,
        test_no_logged_in_user_name_inserted,
        test_sequential_document_independence
    ]
    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  ✓ {t.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"  ✗ {t.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ {t.__name__}: EXCEPTION {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed out of {len(tests)} tests.")
    if failed > 0:
        sys.exit(1)
