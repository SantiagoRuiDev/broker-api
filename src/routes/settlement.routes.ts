import express from "express";
import { UserMiddleware } from "../middlewares/user.middleware";
import { SettlementController } from "../controllers/settlement.controller";
import { SettlementMiddleware } from "../middlewares/settlement.middleware";

const router = express.Router();

// Inyectar dependencias
const settlementController = new SettlementController();
const userMiddleware = new UserMiddleware();
const settlementMiddleware = new SettlementMiddleware();

// Definir rutas
router.post("/liquidate", settlementController.liquidate.bind(settlementController));
router.post("/many", settlementMiddleware.createMany.bind(settlementMiddleware), settlementController.createMany.bind(settlementController));
router.post("/", settlementMiddleware.create.bind(settlementMiddleware), settlementController.create.bind(settlementController));
router.put("/set-status", settlementController.updateStatusById.bind(settlementController));
router.put("/:id", settlementController.update.bind(settlementController));
router.delete('/delete-all', settlementController.deleteAll.bind(settlementController));
router.delete("/:id", settlementController.delete.bind(settlementController));
router.get("/generate-liquidation-txt", settlementController.getLiquidationTXT.bind(settlementController));
router.get("/generate-liquidation-pdf", settlementController.getLiquidationPDF.bind(settlementController));
router.get("/generate-pending-pdf", settlementController.getPendingPdfs.bind(settlementController));
router.get("/search-by/:type", settlementController.getPayoutsByType.bind(settlementController));
router.get("/multiple", settlementController.getMultiplePayouts.bind(settlementController));
router.get("/:id", settlementController.getPayoutById.bind(settlementController));
router.get("/", settlementController.getPayouts.bind(settlementController));

export default router;
