import express from "express";
import { UserController } from "../controllers/user.controller";
import { UserMiddleware } from "../middlewares/user.middleware";

const router = express.Router();

// Inyectar dependencias
const userController = new UserController();
const userMiddleware = new UserMiddleware();

// Definir rutas
router.post("/auth/data", userMiddleware.verifyToken, userController.fetchData.bind(userController));
router.post("/auth", userMiddleware.verifyAuthFields, userController.auth.bind(userController));
router.post("/", userMiddleware.verifyUserFields, userController.create.bind(userController));
router.put("/change-password", userMiddleware.verifyToken, userMiddleware.verifyPasswordFields, userController.changePassword.bind(userController));
router.put("/:id", userController.update.bind(userController));
router.delete("/:id", userController.delete.bind(userController));
router.get("/", userController.getUsers.bind(userController));

export default router;
