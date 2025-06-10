import express from "express";
import { AgencyController } from "../controllers/agency.controller";
import { UserMiddleware } from "../middlewares/user.middleware";

const router = express.Router();

// Inyectar dependencias
const agencyController = new AgencyController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.post("/", agencyController.create.bind(agencyController));
router.delete("/delete-all", agencyController.deleteAll.bind(agencyController));
router.put("/:id", agencyController.update.bind(agencyController));
router.delete("/:id", agencyController.delete.bind(agencyController));
router.get("/", agencyController.getAgencies.bind(agencyController));
router.post("/subsidiary/:id", agencyController.addSubsidiary.bind(agencyController));
router.delete("/subsidiary/:id", agencyController.removeSubsidiary.bind(agencyController));
router.get("/subsidiary/:id", agencyController.getSubsidiaries.bind(agencyController));
router.get("/report-svcs", agencyController.getReportSVCS.bind(agencyController));
router.get("/codes", agencyController.getAgencyCodes.bind(agencyController));
router.post("/codes", agencyController.createCode.bind(agencyController));
router.put("/codes/:id", agencyController.updateCode.bind(agencyController));

export default router;
