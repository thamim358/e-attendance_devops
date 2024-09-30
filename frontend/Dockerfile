# Use the official Node.js image as a base
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Clean npm cache (optional)
RUN npm cache clean --force

# Install dependencies using npm ci for better caching
RUN npm ci --verbose

# Copy the rest of the application code
COPY frontend/ .

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
