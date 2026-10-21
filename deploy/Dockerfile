# ==============================================================================
# Dockerfile: Production Container for Physics Association Platform
# Shahid Beheshti 2 High School (دبیرستان استعدادهای درخشان شهید بهشتی ۲)
# ==============================================================================

FROM python:3.12-slim-bookworm

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend

WORKDIR /app

# Install minimal OS dependencies for PostgreSQL client, curl healthcheck, and OCR/PDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    postgresql-client \
    ca-certificates \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application source
COPY backend /app/backend

# Copy frontend static application
COPY frontend /app/frontend

# Copy initial textbooks data directory
COPY data /app/data

# Create directory for uploads and logs
RUN mkdir -p /app/data/uploads /app/data/textbooks /app/data/logs

# Create non-root system user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose internal FastAPI port
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/api/health || exit 1

# Production server entrypoint with 4 Uvicorn worker processes
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers", "--forwarded-allow-ips", "*"]
