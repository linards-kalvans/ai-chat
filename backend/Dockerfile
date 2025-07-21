FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy project files
COPY pyproject.toml ./

# Copy uv.lock if it exists (optional)
COPY uv.lock* ./

# Install dependencies using uv (will generate lock file if needed)
RUN uv sync

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Create data directory
RUN mkdir -p /app/data

# Set permissions
RUN chown -R appuser:appuser /app/data
# RUN chmod -R 777 /app/data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Create a startup script
RUN echo '#!/bin/bash\nPORT=${PORT:-8000}\nuv run uvicorn app.main:app --host 0.0.0.0 --port $PORT' > /app/start.sh && \
    chmod +x /app/start.sh

# Run the application using the startup script
CMD ["/app/start.sh"] 