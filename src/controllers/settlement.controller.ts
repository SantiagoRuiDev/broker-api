import { Request, Response } from "express";
import { Clientes, Liquidaciones, Subagentes } from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import {
  ISettlement,
  LiquidacionTypes,
} from "../interfaces/settlement.interface";
import { generateAgentCode } from "../utils/code";

export class SettlementController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payout = req.body;
      
      const user = await Clientes.findOne({
        where: { correo: payout.cliente },
      });

      if(user){
        const userHasLiquidation = await Liquidaciones.findOne({where: {ClienteId: user.dataValues.id, tipo: payout.tipo}});
        if(userHasLiquidation){
          throw new Error("El usuario ya esta relacionado a una " + payout.tipo);
        }
      }

      const agents = await Subagentes.findAll();

      if (payout.SAge) {
        if (
          agents.filter((agent) => agent.dataValues.codigo == payout.SAge).length == 0
        ) {
          // Crear SubAgente si no existe
          await Subagentes.create({
            codigo: payout.SAge,
            estatus: "Activo",
            rol: "Subagente",
          });
        }
        payout.SubagenteCodigo = payout.SAge;
      } else {
        let codeIsAvailable = false;
        let tempCode = "";

        while (!codeIsAvailable) {
          tempCode = generateAgentCode();
          const result =
            agents.filter((agent) => agent.dataValues.codigo == tempCode)
              .length > 0;

          if (!result) {
            codeIsAvailable = true;
          }
        }

        await Subagentes.create({
          codigo: tempCode,
          estatus: "Activo",
          rol: "Subagente",
        });
        payout.SubagenteCodigo = tempCode;
      }

      if (user) {
        payout.ClienteId = user.dataValues.id;
      } else {
        const newUser = await Clientes.create({
          nombre: "Sin Nombre",
          direccion: "Sin Direccion",
          correo: payout.cliente,
          telefono: "Sin Telefono",
        });
        payout.ClienteId = newUser.dataValues.id;
      }

      payout.id = uuidv4();
      const savedPayout = await Liquidaciones.create(payout);

      res.status(201).json(savedPayout);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async createMany(req: Request, res: Response): Promise<void> {
    try {
      const payouts = req.body;
      let agents = await Subagentes.findAll();

      // A los arreglos que contienen las liquidaciones recorremos cada elemento y asignamos la sucursal y aseguradora.
      payouts.without_user = payouts.without_user.map((row: ISettlement) => {
        return {
          ...row,
          AseguradoraId: payouts.agency.id,
          SucursaleId: payouts.subsidiary.id,
        };
      });

      payouts.with_user = payouts.with_user.map((row: ISettlement) => {
        return {
          ...row,
          AseguradoraId: payouts.agency.id,
          SucursaleId: payouts.subsidiary.id,
        };
      });

      if (payouts.without_user.length > 0) {
        // Realizamos validaciones para liquidaciones sin usuarios registrados
        const remainingWithoutUser: ISettlement[] = [];

        let clients = await Clientes.findAll();
        const registeredEmails = clients.map(
          (client) => client.dataValues.correo
        );

        for (const row of payouts.without_user) {
          if (!registeredEmails.includes(row.cliente)) {
            const newUser = await Clientes.create({
              nombre: "Sin Nombre",
              direccion: "Sin Direccion",
              correo: row.cliente,
            });
            row.ClienteId = newUser.dataValues.id;
            remainingWithoutUser.push(row);
            clients.push(newUser); // actualizar lista
            registeredEmails.push(row.cliente);
            // Se crea el usuario que no existe y se le agrega a la lista, por si otras liquidaciones tienen el mismo usuario.
          } else {
            // Si el usuario existe en la lista de emails registrados se le asigna y se deriva a la lista con usuarios
            row.ClienteId = clients.find(
              (client) => client.dataValues.correo === row.cliente
            )!.dataValues.id;
            payouts.with_user.push(row);
          }
        }

        // Se filtra la lista para evitar que los elementos tengan el campo ID
        const filteredData = remainingWithoutUser.map((liq: ISettlement) => {
          const { id, ...rest } = liq;
          return Object.fromEntries(
            Object.entries(rest).filter(([_, value]) => value !== undefined)
          );
        });

        for (const settlement of filteredData) {
          if (settlement.SAge) {
            const exists = agents.some(
              (agent) => agent.dataValues.codigo === settlement.SAge
            );
            if (!exists) {
              await Subagentes.create({
                codigo: settlement.SAge,
                estatus: "Activo",
                rol: "Subagente",
              });
              agents = await Subagentes.findAll();
            }
            settlement.SubagenteCodigo = settlement.SAge;
          } else {
            const tempCode = generateAgentCode();
            await Subagentes.create({
              codigo: tempCode,
              estatus: "Activo",
              rol: "Subagente",
            });
            agents = await Subagentes.findAll();
            settlement.SubagenteCodigo = tempCode;
          }
        }

        await Liquidaciones.bulkCreate(filteredData);
      }

      if (payouts.with_user.length > 0) {
        if (payouts.with_user.some((payout: any) => !payout.tipo)) {
          res
            .status(400)
            .json({ error: "Cada liquidación debe tener un tipo." });
          return;
        }
        // Eliminar ID de cada liquidación para evitar conflictos con el UUID automático
        const cleanData = payouts.with_user.map((liq: ISettlement) => {
          const { id, ...rest } = liq;
          return rest; // Retorna el objeto sin el ID
        });

        // Filtrar los valores undefined para evitar errores en Sequelize
        const filteredData = cleanData.map((liq: ISettlement) =>
          Object.fromEntries(
            Object.entries(liq).filter(([_, value]) => value !== undefined)
          )
        );

        for (const settlement of filteredData) {
          if (settlement.SAge) {
            const exists = agents.some(
              (agent) => agent.dataValues.codigo === settlement.SAge
            );
            if (!exists) {
              await Subagentes.create({
                codigo: settlement.SAge,
                estatus: "Activo",
                rol: "Subagente",
              });
              agents = await Subagentes.findAll();
            }
            settlement.SubagenteCodigo = settlement.SAge;
          } else {
            const tempCode = generateAgentCode();
            await Subagentes.create({
              codigo: tempCode,
              estatus: "Activo",
              rol: "Subagente",
            });
            agents = await Subagentes.findAll();
            settlement.SubagenteCodigo = tempCode;
          }
        }

        await Liquidaciones.bulkCreate(filteredData);
      }

      res
        .status(201)
        .json({ message: "Se han creado multiples liquidaciones" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getPayouts(req: Request, res: Response): Promise<void> {
    try {
      const payouts = await Liquidaciones.findAll({
        include: [
          {
            model: Clientes, // Modelo de Clientes
            required: false, // `false` para LEFT JOIN, `true` para INNER JOIN
          },
        ],
      });
      if (!payouts) {
        res.status(404).json({ message: "No encontramos Liquidaciones" });
        return;
      }
      res.status(200).json(payouts);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getPayoutById(req: Request, res: Response): Promise<void> {
    try {
      const payout = await Liquidaciones.findOne({
        where: { id: req.params.id },
      });
      if (!payout) {
        res.status(404).json({ message: "No encontramos esa liquidación" });
        return;
      }
      res.status(200).json(payout);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getPayoutsByType(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type;

      // Usa los valores del enum LiquidacionTypes
      const validTypes: LiquidacionTypes[] = [
        LiquidacionTypes.PRE_LIQUIDACIONES,
        LiquidacionTypes.NEGOCIO_PENDIENTE,
        LiquidacionTypes.NEGOCIO_LIBERADO,
        LiquidacionTypes.CONSOLIDADO,
      ];

      // Verifica si el tipo proporcionado es válido
      if (!validTypes.includes(type as LiquidacionTypes)) {
        res.status(400).json({ message: "Tipo de liquidación no válido" });
        return;
      }

      const payouts = await Liquidaciones.findAll({
        where: { tipo: type },
        include: [
          {
            model: Clientes, // Modelo de Clientes
            required: false, // `false` para LEFT JOIN, `true` para INNER JOIN
          },
        ],
        order: [["fecha_vence", "DESC"]], // Ordena por fecha_vence de forma ascendente
      });
      if (!payouts) {
        res
          .status(404)
          .json({ message: "No encontramos Liquidaciones de este tipo" });
        return;
      }
      res.status(200).json(payouts);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const payout = req.body;
      const uuid = req.params.id;

      const settlementExist = await Liquidaciones.findOne({
        where: { id: uuid },
      });
      if (!settlementExist) throw new Error("Esta liquidación no existe");

      await settlementExist.update(payout);

      res
        .status(201)
        .json({ message: "Liquidación actualizada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await Liquidaciones.destroy({
        where: {},
      });

      res
        .status(201)
        .json({ message: "Liquidaciones eliminada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.id;

      const settlementExist = await Liquidaciones.findOne({
        where: { id: uuid },
      });
      if (!settlementExist) throw new Error("Esta liquidación no existe");

      await settlementExist.destroy();

      res.status(201).json({ message: "Liquidación eliminada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
