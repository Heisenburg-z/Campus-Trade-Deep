# Use Node.js LTS
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy server source code
COPY server/src ./src

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the server
CMD ["node", "src/server.js"]