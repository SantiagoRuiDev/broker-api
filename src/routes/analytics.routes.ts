import express from "express";
import { UserMiddleware } from "../middlewares/user.middleware";
import { AnalyticController } from "../controllers/analytics.controller";

const router = express.Router();

// Inyectar dependencias
const analyticsController = new AnalyticController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.get("/", analyticsController.getAll.bind(analyticsController));

export default router;
