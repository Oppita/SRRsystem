FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias forzando resolución de conflictos
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer el puerto que usa Render
EXPOSE 10000

# Comando para correr la aplicación
CMD ["npm", "run", "start"]
