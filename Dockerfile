# Base image for Node.js (Frontend)
FROM node:16 AS frontend_builder

# Set working directory
WORKDIR /app

# Set memory options and install frontend dependencies
ENV NODE_OPTIONS=--max_old_space_size=4096
COPY frontend/package*.json ./
RUN npm cache clean --force
RUN npm ci --verbose || exit 1

# Copy frontend code and build
COPY frontend/ .
RUN npm run build || exit 1

# Base image for Python (Backend)
FROM python:3.9 AS backend_builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy backend code
COPY backend/ .

# Final image with Nginx for frontend and Python for backend
FROM nginx:alpine

# Copy frontend build artifacts to nginx directory
COPY --from=frontend_builder /app/dist /usr/share/nginx/html

# Copy backend code into the Nginx container (for simplicity in this example)
COPY --from=backend_builder /app /app

# Set working directory for backend
WORKDIR /app

# Expose ports
EXPOSE 80 5000

# Start backend server
CMD ["sh", "-c", "python /app/app.py & nginx -g 'daemon off;'"]
