import { Request, Response } from "express";
import { Subagentes } from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import { generateAgentCode } from "../utils/code";

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
      const agents = await Subagentes.findAll();
      if (!agents) {
        res.status(404).json({ message: "No encontramos agentes" });
        return;
      }
      res.status(200).json(agents);
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

      if(agent.codigo == ""){
        throw new Error("El codigo de agente no puede estar vacio");
      }

      const agentExist = await Subagentes.findOne({
        where: { id: uuid },
      });
      if (!agentExist) throw new Error("Este agente no existe");

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

      res
        .status(201)
        .json({ message: "Subagentes eliminados correctamente" });
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
