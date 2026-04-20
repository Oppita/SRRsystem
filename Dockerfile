FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Etapa de producción
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/dist ./dist

RUN npm install --legacy-peer-deps --production && \
    npm install tsx --legacy-peer-deps

ENV NODE_ENV=production

EXPOSE 10000

CMD ["npx", "tsx", "server.ts"]
