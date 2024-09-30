# Use the official Node.js image as a base
FROM node:16

# Set the working directory
WORKDIR /app

ENV NODE_OPTIONS=--max_old_space_size=4096

# Copy package.json and package-lock.json
COPY package*.json ./

# Clean npm cache (optional)
RUN npm cache clean --force

# Install dependencies using npm ci for better caching
RUN npm ci --verbose

# Copy the rest of the application code
COPY . .

RUN npm run build || exit 1
# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
