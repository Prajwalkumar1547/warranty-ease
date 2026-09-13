"""
WarrantyEase Relational Database Engine (SQLite)
Provides persistent storage, ACID transactions, and relational queries for:
- users
- companies & verified brands
- protection_records (Warranties, Extended Warranties, Insurance, AMC, etc.)
- claims (WE-XXXXXX format)
- claim_documents & evidence
- claim_messages (Customer <-> WarrantyEase <-> Company)
- claim_events (Complete timeline audit history)
- notifications & expiry reminders
- service_centres
- audit_logs
"""

import os
import sqlite3
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from claim_taxonomy_data import CATEGORIES_SEED, ISSUES_SEED, QUESTIONS_SEED, EVIDENCE_SEED, NLP_SYMPTOM_MAP

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "warrantyease.db")

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled and foreign keys enforced."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Initializes all database tables and seeds starter platform records if empty."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('customer', 'admin', 'company')),
        company_id TEXT,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        website TEXT,
        support_email TEXT,
        support_phone TEXT,
        claim_method TEXT NOT NULL,
        integration_status TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS service_centres (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS protection_records (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('PRODUCT_WARRANTY', 'EXTENDED_WARRANTY', 'INSURANCE', 'AMC', 'PROTECTION_PLAN', 'OTHER')),
        protection_type TEXT NOT NULL,
        brand TEXT NOT NULL,
        company_id TEXT,
        product_name TEXT NOT NULL,
        model TEXT,
        category TEXT NOT NULL,
        purchase_date TEXT,
        start_date TEXT,
        expiry_date TEXT,
        warranty_duration_months INTEGER,
        invoice_number TEXT,
        policy_number TEXT,
        policy_holder TEXT,
        sum_insured REAL,
        premium REAL,
        serial_number TEXT,
        model_number TEXT,
        seller TEXT,
        price REAL,
        currency TEXT DEFAULT '₹',
        coverage_info TEXT,
        document_url TEXT,
        verification_status TEXT DEFAULT 'Verified',
        status TEXT NOT NULL CHECK(status IN ('Active', 'Expiring Soon', 'Expired')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        protection_id TEXT,
        company_id TEXT,
        brand TEXT NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        protection_type TEXT NOT NULL,
        claim_type TEXT NOT NULL,
        issue_category TEXT NOT NULL,
        incident_date TEXT,
        problem_description TEXT NOT NULL,
        preferred_resolution TEXT NOT NULL,
        claimed_amount REAL DEFAULT 0,
        status TEXT NOT NULL CHECK(status IN (
            'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED',
            'APPROVED', 'REJECTED', 'ASSIGNED_TO_SERVICE_CENTRE',
            'IN_REPAIR', 'REPLACEMENT_PROCESS', 'RESOLVED', 'CLOSED'
        )),
        hospital_or_workshop TEXT,
        bill_reference_no TEXT,
        internal_notes TEXT,
        company_notes TEXT,
        service_centre_id TEXT,
        service_centre_info TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claim_documents (
        id TEXT PRIMARY KEY,
        claim_id TEXT NOT NULL,
        document_type TEXT NOT NULL,
        filename TEXT NOT NULL,
        file_url TEXT,
        uploaded_at TEXT NOT NULL,
        FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claim_messages (
        id TEXT PRIMARY KEY,
        claim_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claim_events (
        id TEXT PRIMARY KEY,
        claim_id TEXT NOT NULL,
        actor_name TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        event_type TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        link TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        object_type TEXT NOT NULL,
        object_id TEXT NOT NULL,
        details TEXT,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        icon TEXT,
        order_num INTEGER DEFAULT 0,
        FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS issue_templates (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        description TEXT,
        severity TEXT DEFAULT 'MEDIUM',
        order_num INTEGER DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS claim_questions (
        id TEXT PRIMARY KEY,
        issue_id TEXT NOT NULL,
        question TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('choice', 'text', 'boolean', 'select', 'date')),
        options TEXT,
        required INTEGER DEFAULT 1,
        condition TEXT,
        order_num INTEGER DEFAULT 0,
        FOREIGN KEY (issue_id) REFERENCES issue_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence_requirements (
        id TEXT PRIMARY KEY,
        issue_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('photo', 'video', 'document', 'serial_photo', 'invoice')),
        is_required INTEGER DEFAULT 1,
        description TEXT,
        order_num INTEGER DEFAULT 0,
        FOREIGN KEY (issue_id) REFERENCES issue_templates(id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Seed initial users, companies, protections, and claims if empty
    seed_initial_data(conn)
    conn.close()


def generate_claim_id(conn: sqlite3.Connection) -> str:
    """Generates sequential WE-000001 style claim identifiers."""
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM claims")
    count = cur.fetchone()[0]
    return f"WE-{(count + 1):06d}"


def seed_initial_data(conn: sqlite3.Connection):
    """Populates realistic initial seed data for immediate demonstration."""
    cur = conn.cursor()

    now = datetime.now().isoformat()
    past_month = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    future_year = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d")
    future_soon = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    # Always refresh taxonomy tables to ensure latest categories, dynamic questions, and non-emoji templates
    cur.execute("DELETE FROM product_categories")
    cur.execute("DELETE FROM issue_templates")
    cur.execute("DELETE FROM claim_questions")
    cur.execute("DELETE FROM evidence_requirements")
    cur.executemany("INSERT INTO product_categories VALUES (?, ?, ?, ?, ?)", CATEGORIES_SEED)
    cur.executemany("INSERT INTO issue_templates VALUES (?, ?, ?, ?, ?, ?, ?)", ISSUES_SEED)
    cur.executemany("INSERT INTO claim_questions VALUES (?, ?, ?, ?, ?, ?, ?, ?)", QUESTIONS_SEED)
    cur.executemany("INSERT INTO evidence_requirements VALUES (?, ?, ?, ?, ?, ?, ?)", EVIDENCE_SEED)
    conn.commit()

    # Seed Samsung Washing Machine protection if not exists
    cur.execute("SELECT count(*) FROM protection_records WHERE id = 'prot-5'")
    if cur.fetchone()[0] == 0:
        cur.execute("""
            INSERT INTO protection_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "prot-5", "usr-cust-1", "PRODUCT_WARRANTY", "Warranty", "Samsung", "comp-samsung",
            "Samsung 8kg Front Load AI Washing Machine", "WW80T504DAX1TL", "Home Appliances",
            past_month, past_month, future_year, 24,
            "INV-SAM-98212", None, None, None, None,
            "WW80-WM-7729104", "WW80T504DAX1TL", "Croma", 38990.0, "₹",
            "2 Year Comprehensive Warranty + 20 Year Digital Inverter Motor Warranty",
            None, "Verified", "Active", now, now
        ))
        conn.commit()

    # Always ensure partner companies are seeded
    companies = [
        ("comp-boat", "boAt", "Audio & Wearables", "https://www.boat-lifestyle.com", "support@boat-lifestyle.com", "022-6918-1920", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-samsung", "Samsung", "Electronics & Appliances", "https://www.samsung.com/in", "support.india@samsung.com", "1800-407-267864", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-apple", "Apple", "Computers & Mobiles", "https://www.apple.com/in", "support@apple.com", "000800-100-9009", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-lg", "LG", "Home Appliances & TVs", "https://www.lg.com/in", "serviceindia@lge.com", "1800-315-9999", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-sony", "Sony", "Audio & Television", "https://www.sony.co.in", "sonyindia.care@sony.com", "1800-103-7799", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-starhealth", "Star Health", "Health Insurance", "https://www.starhealth.in", "support@starhealth.in", "1800-425-2255", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-carehealth", "Care Health", "Health Insurance", "https://www.careinsurance.com", "customerfirst@careinsurance.com", "1800-102-4488", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-icici", "ICICI Lombard", "Motor & General Insurance", "https://www.icicilombard.com", "customersupport@icicilombard.com", "1800-2666", "WarrantyEase Internal Queue", "Internal Queue", 1),
        ("comp-tataaig", "Tata AIG", "Motor & General Insurance", "https://www.tataaig.com", "customersupport@tataaig.com", "1800-266-7780", "WarrantyEase Internal Queue", "Internal Queue", 1),
    ]
    cur.executemany("INSERT OR IGNORE INTO companies VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", companies)
    conn.commit()

    cur.execute("SELECT count(*) FROM users")
    if cur.fetchone()[0] > 0:
        return  # Core users and mock data already seeded
    future_soon = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

    # 1. Seed Users
    users = [
        ("usr-admin", "WarrantyEase Operator", "admin@warrantyease.app", "admin", None, now),
        ("usr-cust-1", "Rahul Sharma", "rahul.sharma@example.com", "customer", None, now),
        ("usr-boat-rep", "boAt Service Lead", "service@boat-lifestyle.com", "company", "comp-boat", now),
        ("usr-samsung-rep", "Samsung Support Ops", "support@samsung.com", "company", "comp-samsung", now),
    ]
    cur.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", users)

    # 3. Seed Service Centres
    centres = [
        ("sc-1", "comp-boat", "boAt Authorized Service Hub - Indiranagar", "Bengaluru", "100ft Road, HAL 2nd Stage, Indiranagar", "+91 80 4123 4567", "indiranagar@boatcare.com"),
        ("sc-2", "comp-samsung", "Samsung Premium Care Centre - MG Road", "Bengaluru", "Brigade Towers, MG Road", "+91 80 2558 8990", "blr.mgroad@samsungservice.com"),
        ("sc-3", "comp-lg", "LG Direct Service Lounge - Andheri East", "Mumbai", "Chakala Industrial Area, Andheri East", "+91 22 2834 1122", "mumbai.andheri@lgservice.in"),
    ]
    cur.executemany("INSERT INTO service_centres VALUES (?, ?, ?, ?, ?, ?, ?)", centres)

    # 4. Seed Protection Records
    protections = [
        (
            "prot-1", "usr-cust-1", "PRODUCT_WARRANTY", "Warranty", "boAt", "comp-boat",
            "boAt Rockerz 550 Over-Ear Headphones", "Rockerz 550", "Audio",
            past_month, past_month, future_year, 12,
            "INV-BOAT-89412", None, None, None, None,
            "BOAT550-981245", "Rockerz 550", "Amazon India", 1999.0, "₹",
            "1 Year Manufacturer Warranty on Manufacturing Defects", None, "Verified", "Active", now, now
        ),
        (
            "prot-2", "usr-cust-1", "PRODUCT_WARRANTY", "Warranty", "Samsung", "comp-samsung",
            "Samsung 55-inch Crystal 4K UHD Smart TV", "Crystal 4K 55", "TV",
            "2025-10-15", "2025-10-15", future_soon, 12,
            "VS-BLR-44129", None, None, None, None,
            "SAM55-TV-489123", "UA55AUE60AKLXL", "Vijay Sales", 44990.0, "₹",
            "1 Year Comprehensive Warranty + 1 Year Additional Panel Warranty", None, "Verified", "Expiring Soon", now, now
        ),
        (
            "prot-3", "usr-cust-1", "INSURANCE", "Insurance", "Star Health", "comp-starhealth",
            "Star Health Comprehensive Family Floater", "Family Floater", "Health Insurance",
            "2026-01-01", "2026-01-01", "2027-01-01", 12,
            None, "SH-POL-2026-991823", "Rahul Sharma", 1000000.0, 18500.0,
            None, None, "Star Health Direct", 18500.0, "₹",
            "Cashless Hospitalization at 14,000+ Network Hospitals across India", None, "Verified", "Active", now, now
        ),
        (
            "prot-4", "usr-cust-1", "INSURANCE", "Insurance", "ICICI Lombard", "comp-icici",
            "ICICI Lombard Comprehensive Car Insurance", "Motor Policy", "Vehicle Insurance",
            "2025-11-20", "2025-11-20", "2026-11-20", 12,
            None, "IL-MOT-8812903", "Rahul Sharma", 650000.0, 12400.0,
            None, None, "PolicyBazaar", 12400.0, "₹",
            "Zero Depreciation + Roadside Assistance + Engine Protection", None, "Verified", "Active", now, now
        )
    ]
    cur.executemany("INSERT INTO protection_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", protections)

    # 5. Seed Claims
    claim_1_id = "WE-000001"
    claims = [
        (
            claim_1_id, "usr-cust-1", "prot-1", "comp-boat", "boAt",
            "boAt Rockerz 550 Over-Ear Headphones", "Audio", "Warranty", "Warranty Claim",
            "Hardware Failure", past_month,
            "Left ear cup has stopped outputting sound completely. Bluetooth connects normally.",
            "Authorized Service Center Repair", 1999.0,
            "UNDER_REVIEW", None, None,
            "Customer provided valid Amazon invoice. Visual inspection required.",
            "Queued for boAt service review. Customer will receive doorstep pickup instructions.",
            "sc-1", "boAt Authorized Service Hub - Indiranagar",
            now, now
        )
    ]
    cur.executemany("INSERT INTO claims VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", claims)

    # 6. Seed Claim Events
    events = [
        (
            "evt-1", claim_1_id, "Rahul Sharma", "customer", "STATUS_CHANGE",
            None, "SUBMITTED", "Claim submitted by customer with proof of purchase invoice.", now
        ),
        (
            "evt-2", claim_1_id, "WarrantyEase Operator", "admin", "STATUS_CHANGE",
            "SUBMITTED", "UNDER_REVIEW", "Claim reviewed by WarrantyEase Operator and routed to boAt queue.", now
        )
    ]
    cur.executemany("INSERT INTO claim_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", events)

    # 7. Seed Claim Messages
    messages = [
        (
            "msg-1", claim_1_id, "usr-cust-1", "Rahul Sharma", "customer",
            "Hi, the left side went completely silent yesterday. The invoice is attached above.", now
        ),
        (
            "msg-2", claim_1_id, "usr-admin", "WarrantyEase Support", "admin",
            "Hello Rahul, we verified your purchase date and routed your request directly to boAt Service. A representative will update shortly.", now
        )
    ]
    cur.executemany("INSERT INTO claim_messages VALUES (?, ?, ?, ?, ?, ?, ?)", messages)

    # 8. Seed Notifications
    notifications = [
        (
            "notif-1", "usr-cust-1", "Claim WE-000001 Under Review",
            "Your claim for boAt Rockerz 550 has been validated and is currently under review by boAt service team.",
            "claim_update", 0, "claims", now
        ),
        (
            "notif-2", "usr-cust-1", "Warranty Expiring Soon",
            "Your Samsung 55-inch Crystal 4K UHD Smart TV warranty expires in 14 days.",
            "expiry_reminder", 0, "protections", now
        )
    ]
    cur.executemany("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", notifications)

    # 9. Seed Audit Logs
    audit_logs = [
        (
            "aud-1", "usr-cust-1", "customer", "CREATE_PROTECTION", "protection_record", "prot-1",
            json.dumps({"brand": "boAt", "product": "boAt Rockerz 550"}), now
        ),
        (
            "aud-2", "usr-cust-1", "customer", "CREATE_CLAIM", "claim", claim_1_id,
            json.dumps({"issue": "Left ear cup has stopped outputting sound"}), now
        )
    ]
    cur.executemany("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", audit_logs)

    conn.commit()


# ─── Query Helper Functions ───────────────────────────────────

def get_all_protections(customer_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    if customer_id:
        cur.execute("SELECT * FROM protection_records WHERE customer_id = ? ORDER BY created_at DESC", (customer_id,))
    else:
        cur.execute("SELECT * FROM protection_records ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def add_protection(record: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    record_id = record.get("id") or f"prot-{int(datetime.now().timestamp()*1000)}"
    
    cur.execute("""
    INSERT INTO protection_records (
        id, customer_id, type, protection_type, brand, company_id,
        product_name, model, category, purchase_date, start_date, expiry_date,
        warranty_duration_months, invoice_number, policy_number, policy_holder,
        sum_insured, premium, serial_number, model_number, seller, price,
        currency, coverage_info, document_url, verification_status, status,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record_id,
        record.get("customer_id", "usr-cust-1"),
        record.get("type", "PRODUCT_WARRANTY"),
        record.get("protection_type", "Warranty"),
        record.get("brand", "Unknown"),
        record.get("company_id"),
        record.get("product_name") or record.get("model") or "Product",
        record.get("model"),
        record.get("category", "General"),
        record.get("purchase_date"),
        record.get("start_date") or record.get("purchase_date"),
        record.get("expiry_date"),
        record.get("warranty_duration_months"),
        record.get("invoice_number"),
        record.get("policy_number"),
        record.get("policy_holder"),
        record.get("sum_insured"),
        record.get("premium"),
        record.get("serial_number"),
        record.get("model_number"),
        record.get("seller"),
        record.get("price", 0.0),
        record.get("currency", "₹"),
        record.get("coverage_info"),
        record.get("document_url"),
        record.get("verification_status", "Verified"),
        record.get("status", "Active"),
        now, now
    ))

    # Audit log
    cur.execute("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
        f"aud-{int(datetime.now().timestamp()*1000)}",
        record.get("customer_id", "usr-cust-1"),
        "customer", "CREATE_PROTECTION", "protection_record", record_id,
        json.dumps({"brand": record.get("brand"), "product": record.get("product_name")}),
        now
    ))

    conn.commit()
    conn.close()
    return get_protection_by_id(record_id)


def get_protection_by_id(prot_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM protection_records WHERE id = ?", (prot_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row else None


def delete_protection(prot_id: str) -> bool:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM protection_records WHERE id = ?", (prot_id,))
    conn.commit()
    conn.close()
    return True


def get_all_claims(customer_id: Optional[str] = None, company_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    if customer_id:
        cur.execute("SELECT * FROM claims WHERE customer_id = ? ORDER BY created_at DESC", (customer_id,))
    elif company_id:
        cur.execute("SELECT * FROM claims WHERE company_id = ? ORDER BY created_at DESC", (company_id,))
    else:
        cur.execute("SELECT * FROM claims ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def get_claim_by_id(claim_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM claims WHERE id = ?", (claim_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None
    claim = dict(row)
    
    # Attach documents, messages, events
    cur.execute("SELECT * FROM claim_documents WHERE claim_id = ? ORDER BY uploaded_at ASC", (claim_id,))
    claim["documents"] = [dict(d) for d in cur.fetchall()]

    cur.execute("SELECT * FROM claim_messages WHERE claim_id = ? ORDER BY created_at ASC", (claim_id,))
    claim["messages"] = [dict(m) for m in cur.fetchall()]

    cur.execute("SELECT * FROM claim_events WHERE claim_id = ? ORDER BY created_at ASC", (claim_id,))
    claim["events"] = [dict(e) for e in cur.fetchall()]

    conn.close()
    return claim


def create_claim(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    claim_id = generate_claim_id(conn)
    now = datetime.now().isoformat()
    customer_id = data.get("customer_id", "usr-cust-1")

    # Match company by brand name if company_id is omitted
    company_id = data.get("company_id")
    if not company_id and data.get("brand"):
        cur.execute("SELECT id FROM companies WHERE name LIKE ? LIMIT 1", (f"%{data['brand']}%",))
        c_row = cur.fetchone()
        if c_row:
            company_id = c_row[0]

    cur.execute("""
    INSERT INTO claims (
        id, customer_id, protection_id, company_id, brand, product_name,
        category, protection_type, claim_type, issue_category, incident_date,
        problem_description, preferred_resolution, claimed_amount, status,
        hospital_or_workshop, bill_reference_no, internal_notes, company_notes,
        service_centre_id, service_centre_info, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        claim_id,
        customer_id,
        data.get("protection_id"),
        company_id,
        data.get("brand", "General"),
        data.get("product_name") or data.get("model") or "Product",
        data.get("category", "Electronics"),
        data.get("protection_type", "Warranty"),
        data.get("claim_type", "Warranty Claim"),
        data.get("issue_category", "Hardware Failure"),
        data.get("incident_date", datetime.now().strftime("%Y-%m-%d")),
        data.get("problem_description", "Issue reported by customer."),
        data.get("preferred_resolution", "Service Center Repair"),
        float(data.get("claimed_amount") or 0.0),
        data.get("status", "SUBMITTED"),
        data.get("hospital_or_workshop"),
        data.get("bill_reference_no"),
        "Submitted through WarrantyEase Customer Portal. Queued for brand review.",
        "",
        data.get("service_centre_id"),
        data.get("service_centre_info"),
        now, now
    ))

    # Add initial event
    cur.execute("INSERT INTO claim_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (
        f"evt-{int(datetime.now().timestamp()*1000)}",
        claim_id,
        data.get("customer_name", "Rahul Sharma"),
        "customer",
        "STATUS_CHANGE",
        None,
        "SUBMITTED",
        f"Claim {claim_id} created by customer with problem description.",
        now
    ))

    # Notification for Customer
    cur.execute("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
        f"notif-{int(datetime.now().timestamp()*1000)}",
        customer_id,
        f"Claim {claim_id} Submitted",
        f"Your claim for {data.get('brand')} {data.get('product_name')} has been successfully submitted and assigned ID {claim_id}.",
        "claim_status",
        0,
        "claims",
        now
    ))

    # Audit log
    cur.execute("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
        f"aud-{int(datetime.now().timestamp()*1000)}",
        customer_id,
        "customer", "CREATE_CLAIM", "claim", claim_id,
        json.dumps({"brand": data.get("brand"), "issue": data.get("issue_category")}),
        now
    ))

    conn.commit()
    conn.close()
    return get_claim_by_id(claim_id)


def update_claim_status(
    claim_id: str,
    new_status: str,
    actor_name: str,
    actor_role: str,
    notes: Optional[str] = None,
    service_centre_id: Optional[str] = None,
    service_centre_info: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT status, customer_id, brand, product_name FROM claims WHERE id = ?", (claim_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None

    old_status = row[0]
    customer_id = row[1]
    brand = row[2]
    product = row[3]
    now = datetime.now().isoformat()

    cur.execute("""
    UPDATE claims SET
        status = ?,
        internal_notes = COALESCE(?, internal_notes),
        service_centre_id = COALESCE(?, service_centre_id),
        service_centre_info = COALESCE(?, service_centre_info),
        updated_at = ?
    WHERE id = ?
    """, (new_status, notes, service_centre_id, service_centre_info, now, claim_id))

    # Record claim event
    cur.execute("INSERT INTO claim_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (
        f"evt-{int(datetime.now().timestamp()*1000)}",
        claim_id,
        actor_name,
        actor_role,
        "STATUS_CHANGE",
        old_status,
        new_status,
        f"Status updated from {old_status} to {new_status}. {notes or ''}".strip(),
        now
    ))

    # Notify customer
    cur.execute("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
        f"notif-{int(datetime.now().timestamp()*1000)}",
        customer_id,
        f"Claim {claim_id} Update: {new_status.replace('_', ' ').title()}",
        f"{brand} {product} claim status changed to {new_status.replace('_', ' ').title()}.",
        "claim_update",
        0,
        "claims",
        now
    ))

    # Audit log
    cur.execute("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (
        f"aud-{int(datetime.now().timestamp()*1000)}",
        actor_name,
        actor_role, "UPDATE_CLAIM_STATUS", "claim", claim_id,
        json.dumps({"old_status": old_status, "new_status": new_status, "notes": notes}),
        now
    ))

    conn.commit()
    conn.close()
    return get_claim_by_id(claim_id)


def add_claim_message(claim_id: str, sender_id: str, sender_name: str, sender_role: str, message: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    now = datetime.now().isoformat()
    msg_id = f"msg-{int(datetime.now().timestamp()*1000)}"

    cur.execute("INSERT INTO claim_messages VALUES (?, ?, ?, ?, ?, ?, ?)", (
        msg_id, claim_id, sender_id, sender_name, sender_role, message, now
    ))
    conn.commit()
    conn.close()
    return {"id": msg_id, "claim_id": claim_id, "sender_name": sender_name, "sender_role": sender_role, "message": message, "created_at": now}


def get_admin_metrics() -> Dict[str, Any]:
    """Calculates aggregated metrics for the WarrantyEase Operator Console."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT count(*) FROM users")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM protection_records")
    total_protections = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM protection_records WHERE protection_type = 'Warranty' AND status = 'Active'")
    active_warranties = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM protection_records WHERE status = 'Expiring Soon'")
    expiring_soon = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM protection_records WHERE protection_type = 'Insurance'")
    total_insurance = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM claims")
    total_claims = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM claims WHERE status IN ('SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED')")
    pending_claims = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM claims WHERE status = 'APPROVED'")
    approved_claims = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM claims WHERE status = 'REJECTED'")
    rejected_claims = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM claims WHERE status IN ('RESOLVED', 'CLOSED')")
    resolved_claims = cur.fetchone()[0]

    cur.execute("SELECT count(*) FROM companies WHERE is_active = 1")
    total_companies = cur.fetchone()[0]

    # Brand distributions
    cur.execute("SELECT brand, count(*) as c FROM protection_records GROUP BY brand ORDER BY c DESC LIMIT 5")
    brand_distribution = [{"brand": r[0], "count": r[1]} for r in cur.fetchall()]

    conn.close()

    return {
        "total_users": total_users,
        "total_protections": total_protections,
        "active_warranties": active_warranties,
        "expiring_soon": expiring_soon,
        "total_insurance": total_insurance,
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "resolved_claims": resolved_claims,
        "total_companies": total_companies,
        "brand_distribution": brand_distribution
    }


def get_companies() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM companies WHERE is_active = 1 ORDER BY name ASC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def get_users() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, company_id, created_at FROM users ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def get_notifications(user_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


# ─── CLAIM ISSUE TAXONOMY & PRODUCT AWARENESS ─────────────────────────────

def get_taxonomy_categories() -> List[Dict[str, Any]]:
    """Returns all product categories with their subcategories."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM product_categories ORDER BY order_num ASC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()

    parents = [r for r in rows if not r.get("parent_id")]
    for p in parents:
        p["subcategories"] = [r for r in rows if r.get("parent_id") == p["id"]]
    return parents


def resolve_product_category(
    category_name: Optional[str] = "",
    product_name: Optional[str] = "",
    model: Optional[str] = "",
    brand: Optional[str] = "",
    protection_type: Optional[str] = ""
) -> str:
    """
    Intelligent resolution fallback:
    1. Detects Insurance vs Hardware Warranty
    2. Identifies specific Insurance category (Health, Motor, Travel, Property, General Insurance)
    3. Identifies specific Product/Appliance category (Washing Machine, Refrigerator, AC, TV, Phone, Laptop, Audio)
    4. Safe Generic fallback ('cat_ins_general' for insurance, 'cat_generic' for hardware)
    """
    text = f" {category_name or ''} {product_name or ''} {model or ''} {brand or ''} {protection_type or ''} ".lower()

    # 1. Insurance Indicators & Brand matching
    is_insurance = (
        bool(re.search(r"\b(insurance|policy|mediclaim|tpa|cashless)\b", text)) or
        bool(re.search(r"\b(star health|care health|niva bupa|max bupa|religare|hdfc ergo|icici lombard|tata aig|bajaj allianz|godigit|iffco tokio|united india|oriental insurance|new india assurance|national insurance|\blic\b|sbi general|kotak general|cholamandalam)\b", text))
    )

    if is_insurance:
        if re.search(r"\b(health|medical|mediclaim|hospital|hospitalization|patient|care health|star health|niva bupa|max bupa|religare|medi assist)\b", text):
            return "cat_ins_health"
        if re.search(r"\b(motor|car|vehicle|auto|bike|two wheeler|scooter|four wheeler|traffic|chassis|engine)\b", text):
            return "cat_ins_motor"
        if re.search(r"\b(travel|flight|trip|baggage|overseas|visa)\b", text):
            return "cat_ins_travel"
        if re.search(r"\b(home|property|building|burglary|structure|fire)\b", text):
            return "cat_ins_property"
        # If brand is exclusively a health insurer (e.g. "Star Health Insurance" with random model "fgdg")
        if any(b in text for b in ["star health", "care health", "niva bupa", "max bupa", "religare"]):
            return "cat_ins_health"
        return "cat_ins_general"

    # 2. Hardware / Appliance Categories
    if re.search(r"\b(washing machine|washer|front load|top load|laundry|dryer)\b", text):
        return "cat_washing_machine"
    if re.search(r"\b(refrigerator|fridge|freezer)\b", text):
        return "cat_refrigerator"
    if re.search(r"\b(air conditioner|split ac|window ac|inverter ac|\bac\b)\b", text):
        return "cat_ac"
    if re.search(r"\b(microwave|oven|otg)\b", text):
        return "cat_microwave"
    if re.search(r"\b(dishwasher)\b", text):
        return "cat_dishwasher"
    if re.search(r"\b(laptop|notebook|macbook|thinkpad|ideapad|chromebook)\b", text) or ("computer" in text and "desktop" not in text):
        return "cat_laptop"
    if re.search(r"\b(phone|mobile|smartphone|iphone|galaxy s|galaxy z|oneplus|redmi|xiaomi|pixel)\b", text):
        return "cat_smartphone"
    if re.search(r"\b(tv|television|oled|qled|smart tv|bravia)\b", text):
        return "cat_tv"
    if re.search(r"\b(tablet|ipad|galaxy tab)\b", text):
        return "cat_tablet"
    if re.search(r"\b(monitor|display panel)\b", text):
        return "cat_monitor"
    if re.search(r"\b(headphone|earbud|earphone|audio|airpod|rockerz|tws|speaker|soundbar)\b", text):
        return "cat_audio"
    if re.search(r"\b(watch|smartwatch|wearable|fitness band)\b", text):
        return "cat_wearables"
    if re.search(r"\b(car|four wheeler|automobile)\b", text):
        return "cat_car"
    if re.search(r"\b(bike|motorcycle|scooter|two wheeler)\b", text):
        return "cat_motorcycle"

    return "cat_generic"


def get_issues_for_category(category_id: str) -> List[Dict[str, Any]]:
    """Returns issue templates for the specified category (falls back to cat_ins_general for insurance or cat_generic for hardware)."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM issue_templates WHERE category_id = ? ORDER BY order_num ASC", (category_id,))
    rows = [dict(r) for r in cur.fetchall()]

    if not rows:
        fallback_cat = "cat_ins_general" if category_id and category_id.startswith("cat_ins_") else "cat_generic"
        cur.execute("SELECT * FROM issue_templates WHERE category_id = ? ORDER BY order_num ASC", (fallback_cat,))
        rows = [dict(r) for r in cur.fetchall()]

    conn.close()
    return rows


def get_questions_for_issue(issue_id: str) -> Dict[str, Any]:
    """Returns dynamic follow-up questions and tailored evidence requirements for an issue."""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM claim_questions WHERE issue_id = ? ORDER BY order_num ASC", (issue_id,))
    question_rows = [dict(r) for r in cur.fetchall()]
    for q in question_rows:
        if q.get("options") and isinstance(q["options"], str):
            try:
                q["options"] = json.loads(q["options"])
            except Exception:
                pass

    cur.execute("SELECT * FROM evidence_requirements WHERE issue_id = ? ORDER BY order_num ASC", (issue_id,))
    evidence_rows = [dict(r) for r in cur.fetchall()]

    if not question_rows:
        question_rows = [
            {
                "id": f"q_std_start_{issue_id}",
                "issue_id": issue_id,
                "question": "When did this issue first occur?",
                "type": "choice",
                "options": ["Today during usage", "In the past 2-3 days", "Over a week ago", "Gradually getting worse over time"],
                "required": 1,
                "order_num": 1
            },
            {
                "id": f"q_std_freq_{issue_id}",
                "issue_id": issue_id,
                "question": "Does the problem happen every time you use the product?",
                "type": "choice",
                "options": ["Yes, happens every single time", "Intermittently / randomly", "Only under heavy usage"],
                "required": 1,
                "order_num": 2
            },
            {
                "id": f"q_std_repair_{issue_id}",
                "issue_id": issue_id,
                "question": "Has this product been repaired previously?",
                "type": "choice",
                "options": ["No, original factory condition", "Yes, under official brand warranty", "Yes, by an independent technician"],
                "required": 1,
                "order_num": 3
            }
        ]

    if not evidence_rows:
        evidence_rows = [
            {
                "id": f"ev_std_symptom_{issue_id}",
                "issue_id": issue_id,
                "title": "Photo of product showing issue or symptom",
                "type": "photo",
                "is_required": 1,
                "description": "Clear photo showing the issue, damage or product state",
                "order_num": 1
            },
            {
                "id": f"ev_std_serial_{issue_id}",
                "issue_id": issue_id,
                "title": "Photo of product serial number / rating plate",
                "type": "serial_photo",
                "is_required": 1,
                "description": "Product label sticker with serial number and model",
                "order_num": 2
            },
            {
                "id": f"ev_std_invoice_{issue_id}",
                "issue_id": issue_id,
                "title": "Original purchase invoice",
                "type": "invoice",
                "is_required": 1,
                "description": "Proof of purchase invoice or digital receipt",
                "order_num": 3
            },
            {
                "id": f"ev_std_video_{issue_id}",
                "issue_id": issue_id,
                "title": "Short video showing the problem (Optional)",
                "type": "video",
                "is_required": 0,
                "description": "10-20 second video demonstrating the malfunction",
                "order_num": 4
            }
        ]

    conn.close()
    return {
        "issue_id": issue_id,
        "questions": question_rows,
        "evidence_requirements": evidence_rows
    }


def classify_issue_nlp(category_id: str, user_description: str) -> Dict[str, Any]:
    """
    Classifies a customer's natural language problem description into the controlled
    issue taxonomy. Never invents arbitrary categories.
    """
    desc_clean = (user_description or "").lower().strip()
    issues = get_issues_for_category(category_id)

    if not desc_clean:
        fallback = issues[0] if issues else {"id": "gen_other", "name": "Other problem"}
        return {
            "matched_issue_id": fallback["id"],
            "issue_name": fallback["name"],
            "confidence": 0.5,
            "suggested_issues": issues[:3],
            "explanation": "No description provided, showing top category issues."
        }

    scored = []
    desc_words = set(re.findall(r"\b\w+\b", desc_clean))

    for issue in issues:
        iid = issue["id"]
        # Skip "I'm not sure" from auto-matching
        if iid.endswith("_not_sure"):
            continue

        raw_keywords = NLP_SYMPTOM_MAP.get(iid, [])
        name_words = [w for w in re.findall(r"\w+", issue["name"].lower()) if len(w) > 3 and w not in {"with", "from", "during", "other", "problem", "issue", "making", "machine", "unit", "area"}]
        all_keywords = list(set(raw_keywords + name_words))

        matched_text_words = set()
        matched_phrases = []
        for kw in all_keywords:
            kw = kw.strip().lower()
            if not kw or len(kw) < 3:
                continue
            if " " in kw:
                if kw in desc_clean:
                    matched_phrases.append(kw)
            else:
                for word in desc_words:
                    if kw == word or word.startswith(kw) or (len(kw) > 3 and kw in word):
                        matched_text_words.add(word)

        total_matches = len(matched_text_words) + len(matched_phrases) * 2
        if total_matches > 0:
            score = min(0.95, round(0.4 + (total_matches * 0.2), 2))
            if issue["name"].lower() in desc_clean:
                score = min(0.98, score + 0.3)
            display_matches = list(matched_phrases) + list(matched_text_words)
            scored.append({
                "id": iid,
                "name": issue["name"],
                "icon": issue.get("icon", ""),
                "score": score,
                "matches": display_matches
            })

    scored.sort(key=lambda x: (x["score"], len(x["matches"])), reverse=True)

    if scored:
        best = scored[0]
        return {
            "matched_issue_id": best["id"],
            "issue_name": best["name"],
            "confidence": best["score"],
            "suggested_issues": scored[:3],
            "explanation": f"Matched symptoms: {', '.join(best['matches'])}"
        }

    other_issue = next((i for i in issues if "other" in i["id"] or "other" in i["name"].lower()), issues[-1] if issues else None)
    return {
        "matched_issue_id": other_issue["id"] if other_issue else "gen_other",
        "issue_name": other_issue["name"] if other_issue else "Other problem",
        "confidence": 0.4,
        "suggested_issues": issues[:3],
        "explanation": "Could not map to specific symptom, routed to general category problem."
    }


def get_full_admin_taxonomy() -> Dict[str, Any]:
    """Returns the complete product and issue taxonomy tree for Admin Operator Console."""
    categories = get_taxonomy_categories()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM issue_templates ORDER BY order_num ASC")
    all_issues = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM claim_questions ORDER BY order_num ASC")
    all_questions = [dict(r) for r in cur.fetchall()]

    cur.execute("SELECT * FROM evidence_requirements ORDER BY order_num ASC")
    all_evidence = [dict(r) for r in cur.fetchall()]

    conn.close()

    issues_by_cat = {}
    for issue in all_issues:
        cid = issue["category_id"]
        iid = issue["id"]
        issue["questions"] = [q for q in all_questions if q["issue_id"] == iid]
        issue["evidence"] = [e for e in all_evidence if e["issue_id"] == iid]
        issues_by_cat.setdefault(cid, []).append(issue)

    return {
        "categories": categories,
        "issues_by_category": issues_by_cat,
        "total_categories": len(categories),
        "total_issues": len(all_issues),
        "total_questions": len(all_questions),
        "total_evidence_rules": len(all_evidence)
    }

