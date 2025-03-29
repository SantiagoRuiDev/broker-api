import { Request, Response } from "express";
import { Clientes } from "../database/connection";
import { v4 as uuidv4 } from "uuid";

export class ClientController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const client = req.body;

      const alreadyCorreo = await Clientes.findOne({
        where: { correo: client.correo },
      });
      if (alreadyCorreo)
        throw new Error("Un cliente ya ha sido registrado bajo este correo");

      const savedClient = await Clientes.create({id: uuidv4(), ...client});

      res.status(201).json(savedClient);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getClients(req: Request, res: Response): Promise<void> {
    try {
      const clients = await Clientes.findAll();
      if (!clients) {
        res.status(404).json({ message: "No encontramos clientes" });
        return;
      }
      res.status(200).json(clients);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const client = req.body;
      const uuid = req.params.id;

      const clientExist = await Clientes.findOne({
        where: { id: uuid },
      });
      if (!clientExist) throw new Error("Este cliente no existe");

      await clientExist.update(client);

      res.status(201).json({ message: "Cliente actualizado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.id;

      const clientExist = await Clientes.findOne({
        where: { id: uuid },
      });
      if (!clientExist) throw new Error("Este cliente no existe");

      await clientExist.destroy();

      res.status(201).json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
