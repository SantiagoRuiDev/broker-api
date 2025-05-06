import express from "express";
import { ConfigurationController } from "../controllers/configuration.controller";
import { UserMiddleware } from "../middlewares/user.middleware";

const router = express.Router();

// Inyectar dependencias
const configurationController = new ConfigurationController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.get("/", configurationController.get.bind(configurationController))
router.put("/", configurationController.update.bind(configurationController));


export default router;
