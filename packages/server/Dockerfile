# Server Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy server package
COPY packages/server ./packages/server

# Install dependencies (frozen-lockfile for consistency)
RUN pnpm install --frozen-lockfile --filter server...

# Build server
WORKDIR /app/packages/server
RUN pnpm build

# Expose port
EXPOSE 3001

# Start command
CMD ["node", "dist/index.js"]
