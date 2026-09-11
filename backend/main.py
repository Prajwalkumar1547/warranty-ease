"""
WarrantyEase OCR Backend API
FastAPI service providing real PaddleOCR + AI warranty analysis.

Endpoints:
  GET  /health       - Health check
  POST /api/ocr      - Upload file, get extracted text + structured fields
  POST /api/analyze  - Analyze extracted fields with AI

Run: uvicorn main:app --reload --port 8000
"""

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
    description="Real PaddleOCR + AI warranty document analyzer"
)

# ─── CORS ────────────────────────────────────────────────────
origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Constants ───────────────────────────────────────────────
MAX_FILE_SIZE_MB = float(os.getenv("OCR_MAX_FILE_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = int(MAX_FILE_SIZE_MB * 1024 * 1024)
ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/jpg", "image/png", "image/webp",
    "application/pdf",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}


# ─── Request / Response Models ────────────────────────────────
class AnalyzeRequest(BaseModel):
    ocr_text: str
    extracted_fields: dict


# ─── Helpers ─────────────────────────────────────────────────
def validate_file(file: UploadFile, content: bytes):
    """Validate file type and size."""
    ext = ""
    if file.filename and "." in file.filename:
        ext = "." + file.filename.rsplit(".", 1)[-1].lower()

    if ext not in ALLOWED_EXTENSIONS and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{ext or file.content_type}'. "
                   f"Accepted: JPG, JPEG, PNG, PDF."
        )

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(content) // (1024*1024)} MB). "
                   f"Maximum allowed: {MAX_FILE_SIZE_MB} MB."
        )

    if len(content) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty or corrupted.")


# ─── Routes ──────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Simple health check — confirms service is running."""
    return {
        "status": "ok",
        "service": "WarrantyEase OCR API",
        "version": "1.0.0",
        "ai_provider": os.getenv("AI_PROVIDER", "none"),
    }


@app.post("/api/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    """
    Upload a document (JPG, PNG, PDF).
    Returns: raw OCR text + structured warranty fields + field confidence scores.
    """
    content = await file.read()

    # Validate
    validate_file(file, content)

    filename = file.filename or "document"
    content_type = file.content_type or "application/octet-stream"

    logger.info(f"OCR request: file={filename}, size={len(content)} bytes, type={content_type}")

    try:
        from ocr_engine import extract_text_from_file, parse_warranty_fields

        # 1. Run OCR to get raw text
        raw_text = extract_text_from_file(content, filename, content_type)

        if not raw_text or len(raw_text.strip()) < 10:
            return JSONResponse(
                status_code=200,
                content={
                    "success": False,
                    "error": "OCR could not extract readable text from this document. "
                             "Try a clearer, higher-resolution image.",
                    "raw_text": "",
                    "extracted_fields": {},
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


# ─── Error handlers ───────────────────────────────────────────

@app.exception_handler(413)
async def request_too_large(request: Request, exc):
    return JSONResponse(
        status_code=413,
        content={"error": f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB."}
    )
