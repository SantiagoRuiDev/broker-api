import express from "express";
import { UserMiddleware } from "../middlewares/user.middleware";
import { AgentController } from "../controllers/agent.controller";

const router = express.Router();

// Inyectar dependencias
const agentController = new AgentController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.post("/", agentController.create.bind(agentController));
router.put("/:id", agentController.update.bind(agentController));
router.delete("/delete-all", agentController.deleteAll.bind(agentController));
router.delete("/:id", agentController.delete.bind(agentController));
router.get("/:id", agentController.getAgentById.bind(agentController));
router.get("/", agentController.getAgents.bind(agentController));

export default router;
