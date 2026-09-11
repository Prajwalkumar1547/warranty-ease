#!/bin/bash
# WarrantyEase OCR Backend Startup Script
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================="
echo "  WarrantyEase OCR Backend"
echo "=================================================="

# Create .env from example if missing
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠  Created .env from .env.example — add your GEMINI_API_KEY if needed."
fi

# Create virtual environment if missing
if [ ! -d "venv" ]; then
  echo "→ Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install / upgrade dependencies
echo "→ Installing/updating Python dependencies..."
pip install -q -r requirements.txt

echo ""
echo "→ Running OCR field extraction tests..."
python tests/test_ocr_engine.py

echo ""
echo "→ Starting FastAPI server on http://localhost:8000"
echo "   Health: http://localhost:8000/health"
echo "   OCR:    POST http://localhost:8000/api/ocr"
echo "   AI:     POST http://localhost:8000/api/analyze"
echo ""
echo "   Note: First OCR request will download ~200MB PaddleOCR model"
echo "=================================================="
uvicorn main:app --reload --port 8000 --host 0.0.0.0
