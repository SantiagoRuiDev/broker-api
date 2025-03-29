import express from "express";
import { AgencyController } from "../controllers/agency.controller";
import { UserMiddleware } from "../middlewares/user.middleware";

const router = express.Router();

// Inyectar dependencias
const agencyController = new AgencyController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.post("/", agencyController.create.bind(agencyController));
router.put("/:id", agencyController.update.bind(agencyController));
router.delete("/:id", agencyController.delete.bind(agencyController));
router.get("/", agencyController.getAgencies.bind(agencyController));

export default router;
