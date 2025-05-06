import { Request, Response } from "express";
import { Configuracion } from "../database/connection";

export class ConfigurationController {
  constructor() {}

  async get(req: Request, res: Response): Promise<void> {
    try {
      const configuration = await Configuracion.findOne({where: {id: "CONFIGURACION"}});
      res.status(201).json(configuration);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body;

      await Configuracion.update(config, {where: {id: "CONFIGURACION"}});

      res
        .status(201)
        .json({ message: "Configuracion actualizada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
