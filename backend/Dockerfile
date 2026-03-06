FROM python:3.11-slim

WORKDIR /app

# Install system deps for potential Whisper usage
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train ML models if artifacts not present
RUN python -m app.ml.train 2>/dev/null || echo "ML training skipped (will use fallback)"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
