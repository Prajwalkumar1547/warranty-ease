# Production Dockerfile for WarrantyEase OCR Backend
# Supports Render, Railway, Fly.io, Google Cloud Run, AWS ECS, or any Docker host.

FROM python:3.10-slim

# Prevent Python from buffering stdout/stderr and writing bytecode
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    PADDLE_HOME=/app/.paddleocr \
    OCR_LANG=en \
    AI_PROVIDER=none

# Install required Linux shared libraries (OpenMP, GLib, etc. required by PaddlePaddle & OpenCV)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definition first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source files
COPY . .

# Warm up PaddleOCR models during Docker build
# This bakes the ~200MB model into the image so container startup is instantaneous (<1s)
RUN python -c "from paddleocr import PaddleOCR; PaddleOCR(use_angle_cls=False, lang='en', use_gpu=False)" || true

# Expose default port
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start uvicorn bound to 0.0.0.0 and dynamically respect the host $PORT (Render/Railway convention)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
