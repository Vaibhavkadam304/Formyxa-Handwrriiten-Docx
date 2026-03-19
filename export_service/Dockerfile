# ── Build stage ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runtime stage ─────────────────────────────────────────────
FROM python:3.11-slim

# System libs required by OpenCV + PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy app files
COPY app.py .
COPY requirements.txt .

# Copy optional assets (base.docx template + public graphics)
# These are BAKED into the image — no external storage needed for them
COPY base.docx* ./
COPY public/ ./public/

# Cloud Run injects PORT automatically
ENV PORT=8000
EXPOSE 8000

CMD ["python", "app.py"]