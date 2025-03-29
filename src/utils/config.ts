import { config } from "dotenv"

config();

export default {
    PORT: process.env.PORT || process.env.DEVELOPMENT_PORT,
    SECRET_KEY: process.env.SECRET_KEY || "default-secret",
    PRODUCTION: (process.env.PRODUCTION == "true") ? true : false,
    DB_HOST: (process.env.PRODUCTION == "true") ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
    DB_USER: (process.env.PRODUCTION == "true") ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
    DB_PASS: (process.env.PRODUCTION == "true") ? process.env.DB_PASS_PROD : process.env.DB_PASS_DEV,
    DB_NAME: (process.env.PRODUCTION == "true") ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV,
    DB_PORT: (process.env.PRODUCTION == "true") ? Number(process.env.DB_PORT_PROD) : Number(process.env.DB_PORT_DEV),
}