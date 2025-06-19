FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install
CMD ["pnpm", "run", "dev"]
EXPOSE 3000