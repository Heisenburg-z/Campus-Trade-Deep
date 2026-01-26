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

# Copy .env file if exists (for build-time variables)
COPY server/.env ./

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(e=>process.exit(1))"

# Start the server
CMD ["node", "src/server.js"]