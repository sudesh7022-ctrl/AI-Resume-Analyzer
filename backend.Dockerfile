# 1. Base Image
FROM python:3.11-slim

# 2. Set working directory in the container
WORKDIR /app

# 3. Install system dependencies for Prisma, PostgreSQL, and PDF parsing
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy Prisma schema from root
COPY prisma/ ./prisma/

# 6. Generate Prisma client
RUN prisma generate --schema=./prisma/schema.prisma

# 7. Copy the rest of the backend code
COPY backend/ .

# 8. Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# 9. Expose port (Cloud Run uses PORT environment variable)
EXPOSE 8080

# 10. Start the application
CMD ["sh", "-c", "prisma db push && uvicorn main:app --host 0.0.0.0 --port 8080"]
