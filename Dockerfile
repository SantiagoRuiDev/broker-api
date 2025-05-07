FROM node:18-slim

# Evita preguntas durante instalación
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependencias necesarias para Puppeteer y Chrome headless
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Descarga y descomprime Chrome estable (sin .deb)
RUN CHROME_VERSION="124.0.6367.60" && \
    mkdir -p /opt/chrome && \
    curl -Lo chrome-linux.zip "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/${CHROME_VERSION}/linux64/chrome-linux64.zip" && \
    unzip chrome-linux64.zip && \
    mv chrome-linux64/* /opt/chrome/ && \
    rm -rf chrome-linux64.zip chrome-linux64

# Establece la ruta del binario de Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/opt/chrome/chrome

# Crea carpeta para app
WORKDIR /app

# Copia package.json y package-lock.json e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto (ajustá si usás otro)
EXPOSE 3000

# Comando para iniciar tu app
CMD ["npm", "run", "start"]
