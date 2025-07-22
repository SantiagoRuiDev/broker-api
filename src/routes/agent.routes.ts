import express from "express";
import { UserMiddleware } from "../middlewares/user.middleware";
import { AgentController } from "../controllers/agent.controller";
import { AgentMiddleware } from "../middlewares/agent.middleware";

const router = express.Router();

// Inyectar dependencias
const agentController = new AgentController();
const agentMiddleware = new AgentMiddleware();

// Definir rutas
router.post("/", agentMiddleware.create.bind(agentMiddleware), agentController.create.bind(agentController));
router.put("/:id", agentMiddleware.create.bind(agentMiddleware), agentController.update.bind(agentController));
router.delete("/delete-all", agentController.deleteAll.bind(agentController));
router.delete("/:id", agentController.delete.bind(agentController));
router.get("/:id", agentController.getAgentById.bind(agentController));
router.get("/", agentController.getAgents.bind(agentController));

export default router;
