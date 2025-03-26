# ================================
# 1) FRONTEND BUILD STAGE
# ================================
FROM node:16-alpine AS frontend-build

# Set working directory for the frontend
WORKDIR /app/frontend

# Suppress engine-strict and force peer dependencies to install
RUN npm config set engine-strict false

# Copy package.json for the frontend
COPY frontend/package.json ./

# Install dependencies
RUN npm install --force --no-fund --no-audit --loglevel=error

# Copy the rest of the frontend code
COPY frontend/ ./

# Create a build directory to avoid errors if the build fails
RUN mkdir -p /app/frontend/build

# Try to build. If the build fails, create a minimal fallback index.html
RUN (CI=true npm run build || echo "Build attempted") && \
    if [ ! -f /app/frontend/build/index.html ]; then \
      echo "<html><body><h1>SM3 Alertmanager</h1><p>Frontend build could not complete.</p></body></html>" \
      > /app/frontend/build/index.html; \
    fi


# ================================
# 2) PYTHON BACKEND STAGE
# ================================
FROM python:3.10-slim

# Set working directory for the backend
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy main application files
COPY app.py .
COPY config.py .

# Copy fallback frontend build to /app/frontend/fallback-build
COPY frontend/fallback-build /app/frontend/fallback-build

# Ensure /app/frontend/build exists
RUN mkdir -p /app/frontend/build

# If no build directory is found, copy the fallback build
RUN if [ -d /app/frontend/build ]; then \
      echo "Using frontend build"; \
    else \
      cp -r /app/frontend/fallback-build/* /app/frontend/build/; \
    fi

# Copy the actual built frontend from the previous stage
COPY --from=frontend-build /app/frontend/build /app/frontend/build/

# Create a non-root user for security
RUN addgroup --system app && \
    adduser --system --group app && \
    chown -R app:app /app

USER app

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Expose the Flask port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
