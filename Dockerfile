FROM node:16-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Create non-root user for security
RUN addgroup --system app && \
    adduser --system --group app && \
    chown -R app:app /app

USER app

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]