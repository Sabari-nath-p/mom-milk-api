# Multi-stage Docker build for NestJS application
FROM node:18-slim AS development

# Install OpenSSL and other required packages for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:18-slim AS production

# Install required packages for production
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app user for security
RUN addgroup --gid 1001 --system nodejs
RUN adduser --uid 1001 --system --gid nodejs nestjs

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code and change ownership
COPY --chown=nestjs:nodejs . .

# Generate Prisma client
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

# Remove unnecessary files
RUN rm -rf src/ test/ *.md docker/ scripts/

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["npm", "run", "start:prod"]

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/src/data ./src/data

# Generate Prisma client for production
RUN npm run prisma:generate

# Change ownership to nodejs user
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
