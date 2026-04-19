FROM node:22-alpine AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Build de Vite
RUN npm run build

# Etapa de producción
FROM node:22-alpine
WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/dist ./dist

# Instalar dependencias de producción + tsx
RUN npm install --legacy-peer-deps --production && \
    npm install tsx --legacy-peer-deps

# Variables de entorno
ENV NODE_ENV=production

EXPOSE 10000

# Iniciar servidor
CMD ["npx", "tsx", "server.ts"]
