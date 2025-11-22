# Use official Node.js image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
ENV PORT=3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
