import { Request, Response } from "express";
import { Clientes, Liquidaciones } from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import {
  ISettlement,
  LiquidacionTypes,
} from "../interfaces/settlement.interface";

export class SettlementController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payout = req.body;

      if (Array.isArray(payout)) {
        throw new Error("Porfavor no envies un conjunto de liquidaciones");
      }

      if (payout.cliente == "") {
        throw new Error("Ingresa el correo de un cliente valido");
      }

      const user = await Clientes.findOne({
        where: { correo: payout.cliente },
      });
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

      // Verificar si los datos son un array
      if (
        !Array.isArray(payouts.with_user) &&
        !Array.isArray(payouts.without_user)
      ) {
        res
          .status(400)
          .json({ error: "Se esperaba un conjunto de liquidaciones" });
        return;
      }

      // Asegúrate de que cada liquidación tiene la estructura esperada
      // Si tienes un tipo o validación adicional, puedes agregarla aquí
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

        await Liquidaciones.bulkCreate(filteredData);
      }

      if (payouts.without_user.length > 0) {
        if (payouts.without_user.some((payout: any) => !payout.tipo)) {
          res
            .status(400)
            .json({ error: "Cada liquidación debe tener un tipo." });
          return;
        }
        // Eliminar ID de cada liquidación para evitar conflictos con el UUID automático
        const cleanData = payouts.without_user.map((liq: ISettlement) => {
          const { id, ...rest } = liq;
          return rest; // Retorna el objeto sin el ID
        });

        // Filtrar los valores undefined para evitar errores en Sequelize
        const filteredData = cleanData.map((liq: ISettlement) =>
          Object.fromEntries(
            Object.entries(liq).filter(([_, value]) => value !== undefined)
          )
        );

        for(const row of payouts.without_user){
          const newUser = await Clientes.create({
            nombre: "Sin Nombre",
            direccion: "Sin Direccion",
            correo: row.cliente,
            telefono: "Sin Telefono",
          });
          row.ClienteId = newUser.dataValues.id;
        }

        await Liquidaciones.bulkCreate(filteredData);
      }

      res.status(201).json({message: "Se han creado multiples liquidaciones"});
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
      const payout = await Liquidaciones.findOne({where: {id: req.params.id}});
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
