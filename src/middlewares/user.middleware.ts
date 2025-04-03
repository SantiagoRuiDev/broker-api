import { validateSchemas } from "../utils/schema";
import { NextFunction, Request, Response } from "express";
import { authSchema, passwordSchema, userSchema } from "../schemas/user.schema";
import { isValidToken } from "../utils/token";
import { CustomRequest } from "../interfaces/custom_request.interface";

export class UserMiddleware {
  async verifyAuthFields(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      validateSchemas(req.body, authSchema);
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error });
      }
    }
  }
  async verifyUserFields(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      validateSchemas(req.body, userSchema);
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error });
      }
    }
  }
  async verifyPasswordFields(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      validateSchemas(req.body, passwordSchema);
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error });
      }
    }
  }

  async verifyToken(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Obtener el token del header
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) throw new Error("Token not provided");

      // Decodificar el token
      const decoded = isValidToken(token);

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message, error });
      }
    }
  }
}
