# Usa Node 20 o 22 (mejor compatibilidad con Tailwind v4)
FROM node:22-alpine AS builder

WORKDIR /app

# Copia solo los archivos de dependencias primero
COPY package*.json ./

# Limpia e instala con flags para Tailwind/Oxide
RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install --legacy-peer-deps --include=optional && \
    npm install @tailwindcss/oxide --save-dev

# Copia el resto del código
COPY . .

# Construye la app
RUN npm run build

# Etapa de producción (más ligera)
FROM node:22-alpine

WORKDIR /app

# Copia solo lo necesario
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Variables y puerto de Render
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# Comando de inicio (usa tsx como tienes en package.json)
CMD ["npm", "run", "start"]
