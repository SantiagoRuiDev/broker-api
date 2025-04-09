import { Request, Response } from "express";
import { Aseguradoras, Sucursales } from "../database/connection";
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
        throw new Error(
          "Una aseguradora ya ha sido registrada bajo este correo"
        );

      const savedAgency = await Aseguradoras.create({
        id: uuidv4(),
        ...agency,
      });

      res.status(201).json(savedAgency);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getAgencies(req: Request, res: Response): Promise<void> {
    try {
      const agencies = await Aseguradoras.findAll({
        include: [
          {
            model: Sucursales,
            required: false,
          },
        ],
      });
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

  async getSubsidiaries(req: Request, res: Response): Promise<void> {
    try {
      const subsidiaries = await Sucursales.findAll({
        where: { AseguradoraId: req.params.id },
      });
      res.status(200).json(subsidiaries);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async addSubsidiary(req: Request, res: Response): Promise<void> {
    try {
      const subsidiary = req.body;

      const agencyExist = await Aseguradoras.findOne({
        where: { id: req.params.id },
      });

      if (!agencyExist) throw new Error("Esta aseguradora no existe");

      await Sucursales.create(subsidiary);

      res.status(201).json({ message: "Sucursal añadida con exito" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await Sucursales.destroy({
        where: {},
      });
      await Aseguradoras.destroy({
        where: {},
      });

      res
        .status(201)
        .json({ message: "Aseguradoras eliminadas correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async removeSubsidiary(req: Request, res: Response): Promise<void> {
    try {
      const findSubsidiary = await Sucursales.findOne({
        where: { id: req.params.id },
      });

      if (!findSubsidiary) throw new Error("Esta sucursal no existe");

      await findSubsidiary.destroy();

      res.status(201).json({ message: "Sucursal eliminada con exito" });
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

      res
        .status(201)
        .json({ message: "Aseguradora actualizada correctamente" });
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
