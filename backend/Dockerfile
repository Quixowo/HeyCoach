FROM python:3.13-slim

WORKDIR /app

# Install build deps for native wheels (e.g. argon2-cffi, asyncpg)
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY app/ app/
RUN pip install --no-cache-dir .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
