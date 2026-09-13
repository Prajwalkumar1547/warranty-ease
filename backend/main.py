"""
WarrantyEase OCR Backend API
FastAPI service providing real PaddleOCR + AI warranty analysis.

Endpoints:
  GET  /health       - Health check
  POST /api/ocr      - Upload file, get extracted text + structured fields
  POST /api/analyze  - Analyze extracted fields with AI

Run: uvicorn main:app --reload --port 8000
"""

import re
import os
import io
import logging
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from same directory as this file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="WarrantyEase OCR API",
    version="1.0.0",
    description="Production PaddleOCR + AI warranty document analyzer"
)

# ─── CORS (Production Ready) ──────────────────────────────────
# Default permits localhost + any GitHub Pages or custom domain
origins_raw = os.getenv("ALLOWED_ORIGINS", "")
if origins_raw.strip():
    allowed_origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

# Support regex for any GitHub Pages deploy (e.g. https://*.github.io) and allow_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https://.*\.github\.io$|^https://.*\.pages\.dev$|^https://.*\.vercel\.app$|^https://.*\.netlify\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Constants & Safety Limits ───────────────────────────────
MAX_FILE_SIZE_MB = float(os.getenv("OCR_MAX_FILE_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = int(MAX_FILE_SIZE_MB * 1024 * 1024)
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf", "application/octet-stream"
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}


# ─── Request / Response Models ────────────────────────────────
class AnalyzeRequest(BaseModel):
    ocr_text: str
    extracted_fields: dict


# ─── Safe File Handling Helpers ───────────────────────────────
def sanitize_filename(filename: Optional[str]) -> str:
    """Sanitize uploaded filename to prevent path traversal or special char injection."""
    if not filename:
        return "document"
    # Keep only the basename, strip directory traversal
    clean = os.path.basename(filename)
    # Remove null bytes and control characters
    clean = re.sub(r'[\x00-\x1f\x7f]', '', clean)
    # Replace non-safe chars with underscore
    clean = re.sub(r'[^a-zA-Z0-9._-]', '_', clean)
    return clean[:100] or "document"


async def read_limited_file(file: UploadFile, max_bytes: int) -> bytes:
    """Safely stream upload file up to max_bytes without unbounded memory consumption."""
    chunks = []
    total = 0
    chunk_size = 1024 * 1024  # 1MB chunk
    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size ({max_bytes // (1024*1024)} MB)."
            )
        chunks.append(chunk)
    return b"".join(chunks)


def validate_file(filename: str, content_type: str, content_length: int):
    """Validate file extension, type, and non-empty status."""
    ext = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext or content_type}'. "
                   f"Accepted: JPG, JPEG, PNG, PDF."
        )

    if content_length < 20:
        raise HTTPException(status_code=400, detail="Uploaded file appears empty or corrupted.")


# ─── Routes ──────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check confirms API is responsive and ready."""
    return {
        "status": "ok",
        "service": "WarrantyEase OCR API",
        "version": "1.0.0",
        "ai_provider": os.getenv("AI_PROVIDER", "none"),
        "ocr_engine": "PaddleOCR + PyPdfium2",
        "ready": True
    }


@app.post("/api/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    """
    Upload a document (JPG, PNG, PDF).
    Returns: raw OCR text + structured warranty fields + field confidence scores.
    """
    # 1. Sanitize file name and stream bytes safely
    filename = sanitize_filename(file.filename)
    content_type = file.content_type or "application/octet-stream"

    content = await read_limited_file(file, MAX_FILE_SIZE_BYTES)
    validate_file(filename, content_type, len(content))

    logger.info(f"OCR request: file={filename}, size={len(content)} bytes, type={content_type}")

    try:
        from ocr_engine import extract_text_from_file, parse_warranty_fields

        # 2. Run OCR to extract text
        raw_text = extract_text_from_file(content, filename, content_type)

        if not raw_text or len(raw_text.strip()) < 10:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "error": "OCR could not extract readable text from this document. "
                             "Try a clearer, higher-resolution image.",
                    "raw_text": "",
                    "extracted_fields": {
                        "document_type": "unknown",
                        "confidence": 0.0,
                        "is_supported": False,
                        "is_protection_related": False,
                        "is_warranty_related": False,
                        "is_insurance_related": False,
                        "rejection_reason": "Could not extract legible text from this document.",
                        "unsupported_reason": "Could not extract legible text from this document."
                    },
                    "char_count": 0,
                }
            )

        # 2. Parse structured fields from the real OCR text
        fields = parse_warranty_fields(raw_text, filename)

        logger.info(f"OCR complete: {len(raw_text)} chars, confidence={fields.get('confidence', 0):.2f}")

        return {
            "success": True,
            "raw_text": raw_text,
            "char_count": len(raw_text),
            "extracted_fields": fields,
            "filename": filename,
        }

    except RuntimeError as e:
        # PaddleOCR not installed or model download failed
        logger.error(f"OCR engine error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"OCR processing error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}"
        )


@app.post("/api/analyze")
async def analyze_endpoint(request: AnalyzeRequest):
    """
    Analyze OCR text + extracted fields with AI.
    Returns warranty analysis, warnings, exclusions, status explanation.
    """
    if not request.ocr_text and not request.extracted_fields:
        raise HTTPException(status_code=400, detail="No OCR text or fields provided.")

    try:
        from ai_analyzer import get_ai_provider
        provider = get_ai_provider()
        analysis = provider.analyze(request.ocr_text, request.extracted_fields)
        return {"success": True, "analysis": analysis}

    except Exception as e:
        logger.error(f"AI analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ─── Platform Database & Relational Endpoints ─────────────────
import database

@app.on_event("startup")
def on_startup():
    database.init_db()
    logger.info("WarrantyEase relational database initialized successfully.")

# Mock active session role for demo
CURRENT_SESSION = {
    "id": "usr-cust-1",
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.com",
    "role": "customer",
    "company_id": None
}

@app.get("/api/auth/me")
async def get_current_user():
    return CURRENT_SESSION

@app.post("/api/auth/switch-role")
async def switch_role(data: dict):
    role = data.get("role", "customer")
    CURRENT_SESSION["role"] = role
    if role == "admin":
        CURRENT_SESSION["name"] = "WarrantyEase Operator"
        CURRENT_SESSION["email"] = "admin@warrantyease.app"
        CURRENT_SESSION["company_id"] = None
    elif role == "company":
        company_id = data.get("company_id", "comp-boat")
        company_name = data.get("company_name", "boAt")
        CURRENT_SESSION["name"] = f"{company_name} Service Lead"
        CURRENT_SESSION["email"] = f"support@{company_name.lower().replace(' ', '')}.com"
        CURRENT_SESSION["company_id"] = company_id
    else:
        CURRENT_SESSION["name"] = "Rahul Sharma"
        CURRENT_SESSION["email"] = "rahul.sharma@example.com"
        CURRENT_SESSION["company_id"] = None
    return CURRENT_SESSION

@app.get("/api/protections")
async def get_protections(customer_id: Optional[str] = None):
    return database.get_all_protections(customer_id)

@app.post("/api/protections")
async def create_protection(record: dict):
    return database.add_protection(record)

@app.delete("/api/protections/{id}")
async def delete_protection(id: str):
    database.delete_protection(id)
    return {"success": True, "id": id}

@app.get("/api/claims")
async def get_claims(customer_id: Optional[str] = None, company_id: Optional[str] = None):
    return database.get_all_claims(customer_id, company_id)

@app.get("/api/claims/{id}")
async def get_claim(id: str):
    claim = database.get_claim_by_id(id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@app.post("/api/claims")
async def create_claim_endpoint(claim_data: dict):
    return database.create_claim(claim_data)

@app.post("/api/claims/{id}/status")
async def update_claim_status_endpoint(id: str, data: dict):
    updated = database.update_claim_status(
        claim_id=id,
        new_status=data.get("status"),
        actor_name=data.get("actor_name", CURRENT_SESSION["name"]),
        actor_role=data.get("actor_role", CURRENT_SESSION["role"]),
        notes=data.get("notes"),
        service_centre_id=data.get("service_centre_id"),
        service_centre_info=data.get("service_centre_info")
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Claim not found")
    return updated

@app.post("/api/claims/{id}/messages")
async def post_claim_message(id: str, data: dict):
    return database.add_claim_message(
        claim_id=id,
        sender_id=data.get("sender_id", CURRENT_SESSION["id"]),
        sender_name=data.get("sender_name", CURRENT_SESSION["name"]),
        sender_role=data.get("sender_role", CURRENT_SESSION["role"]),
        message=data.get("message", "")
    )

@app.get("/api/admin/stats")
async def admin_stats():
    return database.get_admin_metrics()

@app.get("/api/admin/users")
async def admin_users():
    return database.get_users()

@app.get("/api/admin/audit-logs")
async def admin_audit_logs(limit: int = 50):
    return database.get_audit_logs(limit)

@app.get("/api/companies")
async def companies_list():
    return database.get_companies()

@app.get("/api/notifications")
async def notifications_endpoint(user_id: Optional[str] = None):
    uid = user_id or CURRENT_SESSION["id"]
    return database.get_notifications(uid)


# ─── Claim Issue Taxonomy & Product-Aware Dynamic Questionnaire ───

@app.get("/api/taxonomy/categories")
async def taxonomy_categories():
    """Returns hierarchical product categories and subcategories."""
    return database.get_taxonomy_categories()


@app.get("/api/taxonomy/issues")
async def taxonomy_issues(
    category: Optional[str] = None,
    product_name: Optional[str] = None,
    model: Optional[str] = None,
    brand: Optional[str] = None,
    protection_type: Optional[str] = None
):
    """
    Dynamically returns category-specific issues using intelligent fallback:
    Level 1: Detects Insurance vs Hardware Warranty
    Level 2: Category match (Health Insurance, Motor Insurance, Washing Machine, Smartphone, etc.)
    Level 3: Safe Generic fallback ('cat_ins_general' for insurance, 'cat_generic' for hardware)
    """
    resolved_category_id = database.resolve_product_category(category, product_name, model, brand, protection_type)
    issues = database.get_issues_for_category(resolved_category_id)
    return {
        "resolved_category_id": resolved_category_id,
        "issues": issues
    }


@app.get("/api/taxonomy/issues/{id}/questions")
async def taxonomy_issue_questions(id: str):
    """Returns dynamic diagnostic follow-up questions and tailored evidence requirements for an issue."""
    return database.get_questions_for_issue(id)


@app.post("/api/claims/classify-issue")
async def classify_claim_issue(data: dict):
    """
    Classifies a customer's natural language issue description into the controlled
    taxonomy without inventing arbitrary categories.
    """
    category_id = data.get("category_id", "cat_generic")
    user_description = data.get("description", "")
    return database.classify_issue_nlp(category_id, user_description)


@app.get("/api/admin/taxonomy")
async def admin_taxonomy():
    """Returns complete product and issue taxonomy tree for Admin Operator Console."""
    return database.get_full_admin_taxonomy()



# ─── Error handlers ───────────────────────────────────────────

@app.exception_handler(413)
async def request_too_large(request: Request, exc):
    return JSONResponse(
        status_code=413,
        content={"error": f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB."}
    )
