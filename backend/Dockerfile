# ===== OPTIMIZATION 1: Multi-stage build with Alpine =====
FROM python:3.11-alpine as builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev linux-headers

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ===== FINAL STAGE =====
FROM python:3.11-alpine

# Install runtime dependencies only
RUN apk add --no-cache libpq

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -s /bin/sh -u 1000 -G appuser appuser

# Copy Python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local

# Set PATH to include user packages
ENV PATH=/home/appuser/.local/bin:$PATH

WORKDIR /app

# Copy app and set ownership
COPY --chown=appuser:appuser . .

# Create data directory
RUN mkdir -p /app/data && chown -R appuser:appuser /app/data

USER appuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]