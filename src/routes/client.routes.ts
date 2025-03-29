import express from "express";
import { ClientController } from "../controllers/client.controller";
import { UserMiddleware } from "../middlewares/user.middleware";

const router = express.Router();

// Inyectar dependencias
const clientController = new ClientController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.post("/", clientController.create.bind(clientController));
router.put("/:id", clientController.update.bind(clientController));
router.delete("/:id", clientController.delete.bind(clientController));
router.get("/", clientController.getClients.bind(clientController));

export default router;
