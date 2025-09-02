import { Request, Response } from "express";
import { Subagentes } from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import { generateAgentCode } from "../utils/code";
import { Op } from "sequelize";

export class AgentController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const agent = req.body;

      const alreadyExist = await Subagentes.findOne({
        where: { correo: agent.correo },
      });
      if (alreadyExist)
        throw new Error("Un agente ya ha sido registrado bajo este correo");

      if (String(agent.codigo).trim() == "") {
        let codeIsAvailable = false;
        let tempCode = "";

        while (!codeIsAvailable) {
          tempCode = generateAgentCode();
          const result = await Subagentes.findOne({
            where: { codigo: tempCode },
          });

          if (!result) {
            codeIsAvailable = true;
          }
        }

        agent.codigo = tempCode;
      }

      agent.id = uuidv4();
      if (
        agent.liderId == null ||
        agent.liderId == undefined ||
        String(agent.liderId).trim() == ""
      ) {
        agent.liderId = null;
      } else {
        const leader = await Subagentes.findOne({
          where: { codigo: agent.liderId },
        });
        if (!leader) {
          throw new Error("El agente lider que intentas asignar no existe");
        }
      }

      const savedAgent = await Subagentes.create(agent);

      res.status(201).json(savedAgent);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getAgents(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit);
      const page = Number(req.query.page);
      const name = req.query.name as string | undefined;
      const state = req.query.state as string | undefined;
      const doc = req.query.doc as string | undefined;

      let where: any = {};

      // filtro por nombre si lo envían
      if (name) {
        where[Op.or] = [
          { nombres: { [Op.like]: `%${name}%` } },
          { apellidos: { [Op.like]: `%${name}%` } },
          { codigo: { [Op.like]: `%${name}%` } },
        ];
      }

      // filtro por estatus si lo envían
      if (doc) {
        where.documento = { [Op.like]: `%${doc}%` };
      }
      // filtro por estatus si lo envían
      if (state) {
        where.estatus = state;
      }

      const count = await Subagentes.count({ where });
      const agents = await Subagentes.findAll({
        limit: limit || undefined,
        offset: page ? (page - 1) * limit : undefined,
        where,
      });

      res.status(200).json({ agents, count });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getAgentById(req: Request, res: Response): Promise<void> {
    try {
      const agent = await Subagentes.findOne({ where: { id: req.params.id } });
      if (!agent) {
        res.status(404).json({ message: "No encontramos agentes" });
        return;
      }
      res.status(200).json(agent);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const agent = req.body;
      const uuid = req.params.id;

      if (agent.codigo == "") {
        throw new Error("El codigo de agente no puede estar vacio");
      }

      if (agent.liderId != null && String(agent.liderId).trim() != "") {
        const leader = await Subagentes.findOne({
          where: { codigo: agent.liderId },
        });
        if (!leader) {
          throw new Error("El agente lider que intentas asignar no existe");
        }
      } else {
        agent.liderId = null;
      }

      const agentExist = await Subagentes.findOne({
        where: { id: uuid },
      });
      if (!agentExist) throw new Error("Este agente no existe");

      const agents = await Subagentes.findAll();

      await agentExist.update(agent);

      res.status(201).json({ message: "Agente actualizado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await Subagentes.destroy({
        where: {},
      });

      res.status(201).json({ message: "Subagentes eliminados correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.id;

      const agentExist = await Subagentes.findOne({
        where: { id: uuid },
      });
      if (!agentExist) throw new Error("Este agente no existe");

      await agentExist.destroy();

      res.status(201).json({ message: "Agente eliminado correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
