FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
# Compila el proyecto TS a JS (se generará en dist)
RUN npm run build

# Comando para ejecutar el archivo compilado en dist/index.js
CMD ["npm", "start"]