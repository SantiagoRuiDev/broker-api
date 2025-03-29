import { Request, Response } from "express";
import { Aseguradoras } from "../database/connection";
import { v4 as uuidv4 } from "uuid";

export class AgencyController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const agency = req.body;

      const alreadyExist = await Aseguradoras.findOne({
        where: { correo: agency.correo },
      });
      if (alreadyExist)
        throw new Error("Una aseguradora ya ha sido registrada bajo este correo");

      const savedAgency = await Aseguradoras.create({id: uuidv4(), ...agency});

      res.status(201).json(savedAgency);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getAgencies(req: Request, res: Response): Promise<void> {
    try {
      const agencies = await Aseguradoras.findAll();
      if (!agencies) {
        res.status(404).json({ message: "No encontramos Aseguradoras" });
        return;
      }
      res.status(200).json(agencies);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const agency = req.body;
      const uuid = req.params.id;

      const agencyExist = await Aseguradoras.findOne({
        where: { id: uuid },
      });
      if (!agencyExist) throw new Error("Esta aseguradora no existe");

      await agencyExist.update(agency);

      res.status(201).json({ message: "Aseguradora actualizada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.id;

      const agencyExist = await Aseguradoras.findOne({
        where: { id: uuid },
      });
      if (!agencyExist) throw new Error("Esta aseguradora no existe");

      await agencyExist.destroy();

      res.status(201).json({ message: "Aseguradora eliminada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
