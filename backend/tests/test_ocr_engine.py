"""
Tests for OCR engine field extraction logic.
Runs on pure Python without PaddleOCR (tests the regex parsers only).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ocr_engine import (
    detect_brand, detect_serial_number, detect_date, detect_price,
    detect_invoice_number, detect_model_number, detect_warranty_period,
    parse_warranty_fields
)

SAMSUNG_INVOICE = """TAX INVOICE Samsung India Electronics Pvt. Ltd.
Invoice Number: 29S1I4082713 Invoice Date: 21.09.2024
Description of Goods: Washing Machine Material Code: WW12DB7B24GSTL
Product Serial No./IMEI No: 05SU5PBX900128
Grand Total (Invoice Value) 45,892.00
Amount paid by the Customer: INR 45892.0
Customer: Srishailam Potti, Phone: 9866130006
Warranty: 2 Year Manufacturer Warranty"""

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
    assert result["brand"] == "Samsung"
    assert result["serial_number"] == "05SU5PBX900128"
    assert result["purchase_date"] == "2024-09-21"
    assert result["purchase_price"] == 45892.0
    assert result["warranty_period_months"] == 24
    assert result["confidence"] > 0.5
    # Expiry should be 24 months after 2024-09-21 = 2026-09-21
    assert result["warranty_expiry_date"] == "2026-09-21"

def test_missing_fields_flagged():
    sparse_text = "Purchase made. Product received in good condition."
    result = parse_warranty_fields(sparse_text, "receipt.jpg")
    assert len(result["missing_fields"]) >= 3  # Most fields missing
    assert result["confidence"] < 0.5

def test_invalid_date_not_fabricated():
    text = "No date information here whatsoever."
    dt, conf = detect_date(text)
    assert dt is None  # Must not fabricate a date

def test_price_not_fabricated():
    text = "Invoice number 12345 for a product."
    price, conf = detect_price(text)
    assert price is None  # Must not fabricate a price

def test_emma_mattress_parse():
    emma_text = """TAX INVOICE
SELLER: EMMA SLEEP INDIA PVT. LTD. (BLRFC12)
Invoice Number: *CKA1-2526-13872*
Invoice Date : 2025-10-10
BILLED TO
P Srishailam
Description Of Goods / Services: Emma Hybrid Mattress - King / 6 in / 78" x 72" in
SKU: EMAHE183200AAF
Invoice Value: 16366.01
Official 10-Year Manufacturer Mattress Warranty Included"""
    result = parse_warranty_fields(emma_text, "emma_invoice.pdf")
    assert result["brand"] == "Emma Sleep", f"Expected Emma Sleep, got {result['brand']}"
    assert result["serial_number"] == "EMAHE183200AAF", f"Expected EMAHE183200AAF, got {result['serial_number']}"
    assert result["purchase_date"] == "2025-10-10", f"Expected 2025-10-10, got {result['purchase_date']}"
    assert result["purchase_price"] == 16366.01, f"Expected 16366.01, got {result['purchase_price']}"
    assert result["warranty_period_months"] == 120, f"Expected 120 months, got {result['warranty_period_months']}"

if __name__ == "__main__":
    tests = [
        test_brand_detection, test_serial_detection, test_date_detection,
        test_price_detection, test_invoice_number, test_model_number,
        test_warranty_period, test_full_parse, test_emma_mattress_parse,
        test_missing_fields_flagged, test_invalid_date_not_fabricated,
        test_price_not_fabricated,
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

