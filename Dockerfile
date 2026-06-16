# ── Stage: production image ────────────────────────────
FROM python:3.11-slim

# Metadata
LABEL maintainer="gokul"
LABEL description="HomeVal – AI House Price Predictor (Flask)"

# Don't write .pyc files; don't buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000

# ── System deps (minimal) ──────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ──────────────────────────────────
WORKDIR /app

# ── Python dependencies (cached layer) ────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Application code ───────────────────────────────────
COPY app.py .
COPY templates/ templates/
COPY static/ static/
# Copy the trained model (must exist before docker build)
COPY model/ model/

# ── Non-root user for security ─────────────────────────
RUN useradd -m appuser
USER appuser

# ── Expose & run ───────────────────────────────────────
EXPOSE 5000

# Use gunicorn in production; fall back to Flask dev server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "120", "app:app"]
