FROM node:20-slim

# Instala dependencias del sistema necesarias para correr Chrome
RUN apt-get update && apt-get install -y \
    wget \
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
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instala Google Chrome estable
RUN wget -O google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt install -y ./google-chrome.deb \
    && rm google-chrome.deb

# Crea directorio y copia archivos
WORKDIR /app
COPY . .

# Instala dependencias
RUN npm install

# Compila TypeScript
RUN npm run build || tsc

EXPOSE 3000

# Comando de arranque
CMD ["node", "dist/index.js"]
