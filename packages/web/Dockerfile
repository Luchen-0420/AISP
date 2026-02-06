# Stage 1: Build React App
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy web package and shared/dependent packages if any (none yet, but good practice)
COPY packages/web ./packages/web

# Install all dependencies (we need devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build web
WORKDIR /app/packages/web
RUN pnpm build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
