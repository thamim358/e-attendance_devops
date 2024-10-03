# Stage 1: Build the React app with Vite
FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./

# Install npm dependencies
RUN npm ci --verbose

# Copy all files to the container
COPY . .

# Build the app for production
RUN npm run build

# Stage 2: Serve the built files using nginx
FROM nginx:alpine

# Copy the build output to the nginx HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
