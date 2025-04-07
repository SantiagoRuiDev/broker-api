import { validateSchemas } from "../utils/schema";
import { NextFunction, Request, Response } from "express";
import { authSchema, passwordSchema, userSchema } from "../schemas/user.schema";
import { isValidToken } from "../utils/token";
import { CustomRequest } from "../interfaces/custom_request.interface";
import { Usuarios } from "../database/connection";

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

  
  async isAdmin(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Obtener el token del header
      const user = req.user;

      const userIsAdmin = await Usuarios.findOne({where: {id: user.uuid}});

      if(userIsAdmin){
        if(userIsAdmin.dataValues.rol == "Admin"){
          next();
        } else {
          throw new Error("No tiene el rol necesario para esta acción");
        }
      } else {
        throw new Error("Este usuario no existe");
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message, error });
      }
    }
  }

  
  async isStaff(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Obtener el token del header
      const user = req.user;

      const userIsStaff = await Usuarios.findOne({where: {id: user.uuid}});

      if(userIsStaff){
        if(userIsStaff.dataValues.rol == "Asistente" || userIsStaff.dataValues.rol == "Admin"){
          next();
        } else {
          throw new Error("No tiene el rol necesario para esta acción");
        }
      } else {
        throw new Error("Este usuario no existe");
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ message: error.message, error });
      }
    }
  }
}
