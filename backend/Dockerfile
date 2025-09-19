FROM python:3.11-slim

# Create non-root user
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

WORKDIR /app

# Install dependencies as root
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app and change ownership
COPY . .
RUN chown -R appuser:appuser /app

# Create data directory with proper permissions
RUN mkdir -p /app/data && chown -R appuser:appuser /app/data

# Switch to non-root user
USER appuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
