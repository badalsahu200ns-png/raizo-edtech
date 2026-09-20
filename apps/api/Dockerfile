FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY apps/api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code and database files
COPY apps/api /app/apps/api
COPY agents /app/agents
COPY database /app/database
COPY raizo_learning.db /app/raizo_learning.db

# Ensure Python path includes /app
ENV PYTHONPATH="/app"
ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn apps.api.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
