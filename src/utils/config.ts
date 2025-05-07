import { config } from "dotenv";

// Solo cargar .env si no está en producción
if (process.env.NODE_ENV !== "production") {
  config(); // Cargar variables desde .env local solo en dev
}

const isProduction = process.env.PRODUCTION === "true";

export default {
  PORT: process.env.PORT || process.env.DEVELOPMENT_PORT || 3000,
  SECRET_KEY: process.env.SECRET_KEY || "default-secret",
  PRODUCTION: isProduction,
  DB_HOST: isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
  DB_USER: isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
  DB_PASS: isProduction ? process.env.DB_PASS_PROD : process.env.DB_PASS_DEV,
  DB_NAME: isProduction ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV,
  DB_PORT: Number(isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_DEV),
};
