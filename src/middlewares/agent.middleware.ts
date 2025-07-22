import { agentSchema } from "../schemas/agent.schema";
import { validateSchemas } from "../utils/schema";
import { NextFunction, Request, Response } from "express";

export class AgentMiddleware {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const agent = req.body;

      if(!agent){
        throw new Error("Ingrese un formato valido");
      }

      if(!agent.nombres){
        throw new Error("El campo nombre no puede estar vacio");
      }
      if(!agent.apellidos){
        throw new Error("El campo apellidos no puede estar vacio");
      }
      if(!agent.correo){
        throw new Error("El campo correo no puede estar vacio");
      }
      if(!agent.rol){
        throw new Error("El campo rol no puede estar vacio");
      }
      if(!agent.codigo){
        throw new Error("El campo SAge no puede estar vacio");
      }
      if(!agent.estatus){
        throw new Error("El campo estatus no puede estar vacio");
      }
      if(agent.iva && agent.iva < 0){
        throw new Error("El campo iva no puede estar vacio o ser cero");
      }
      if(agent.ret_iva && agent.ret_iva < 0){
        throw new Error("El campo retención de iva no puede estar vacio o ser cero");
      }
      if(agent.ret_renta && agent.ret_renta < 0){
        throw new Error("El campo retención de renta no puede estar vacio o ser cero");
      }
      if(agent.tarifa_comision && agent.tarifa_comision < 0){
        throw new Error("El campo tarifa comisión no puede estar vacio o ser cero");
      }
      if(agent.gastos_adm && agent.gastos_adm < 0){
        throw new Error("El campo gastos administrativos no puede estar vacio o ser menor a cero");
      }

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error });
      }
    }
  }
}
