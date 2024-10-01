# Use the official Node.js image as a base
FROM node:16

# Set the working directory
WORKDIR /app

# Environment variable for node memory limit
ENV NODE_OPTIONS=--max_old_space_size=4096

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean npm cache (optional)
RUN npm cache clean --force

# Install dependencies using npm ci for better caching
RUN npm ci --verbose

# Copy the rest of the application code
COPY . .

# Build the production assets
RUN npm run build || exit 1

# Install a lightweight web server to serve the static files (e.g., `serve`)
RUN npm install -g serve

# Expose the desired port
EXPOSE 3000

# Command to serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
