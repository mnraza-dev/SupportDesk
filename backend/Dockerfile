# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/.env ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 5000
CMD ["node", "dist/index.js"]