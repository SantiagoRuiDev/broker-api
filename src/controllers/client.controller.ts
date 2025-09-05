import { Request, Response } from "express";
import { Aseguradoras, Clientes, Liquidaciones, Subagentes, Sucursales } from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import NodeCache from "node-cache";

const cache = new NodeCache();

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

      const savedClient = await Clientes.create({ id: uuidv4(), ...client });

      res.status(201).json(savedClient);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getClients(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit);
      const page = Number(req.query.page);
      const name = req.query.name;

      if(!limit && !page){
        const cachedClients = cache.get('clients');
        if(cachedClients) {
          res.status(200).json(cachedClients);
          return;
        }
        const clients = await Clientes.findAll({attributes: ['id', 'nombre', 'correo']});
        cache.set('clients', clients, 40000);
        res.status(200).json(clients);
        return;
      }

      let count = 0;
      let clients = null;
      if (name) {
        count = await Clientes.count({
          where: {
            nombre: {
              [Op.like]: `%${name}%`,
            },
          },
        });
        clients = await Clientes.findAll({
          limit: limit ? limit : undefined,
          offset: page ? (page - 1) * limit : undefined,
          where: {
            nombre: {
              [Op.like]: `%${name}%`,
            },
          },
          include: [
            {
              model: Liquidaciones,
              limit: 1, // solo el último
              order: [["fecha_importacion", "DESC"]], // ordenado por fecha o id
              include: [
                {
                  model: Subagentes,
                  required: true
                },
                {
                  model: Aseguradoras,
                  required: true
                },
                {
                  model: Sucursales,
                  required: false
                },
              ],
            },
          ],
        });
      } else {
        count = await Clientes.count();
        clients = await Clientes.findAll({
          limit: limit ? limit : undefined,
          offset: page ? (page - 1) * limit : undefined,
          include: [
            {
              model: Liquidaciones,
              limit: 1, // solo el último
              order: [["fecha_importacion", "DESC"]], // ordenado por fecha o id
              include: [
                {
                  model: Subagentes,
                  required: true
                },
                {
                  model: Aseguradoras,
                  required: true
                },
                {
                  model: Sucursales,
                  required: false
                },
              ],
            },
          ],
        });
      }
      if (!clients) {
        res.status(404).json({ message: "No encontramos clientes" });
        return;
      }
      res.status(200).json({ clients, count });
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

  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await Clientes.destroy({
        where: {},
      });

      res.status(201).json({ message: "Clientes eliminados correctamente" });
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
