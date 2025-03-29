import { Request, Response } from "express";
import { Liquidaciones } from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import { LiquidacionTypes } from "../interfaces/settlement.interface";

export class SettlementController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payout = req.body;

      if(Array.isArray(payout)){
        throw new Error("Porfavor no envies un conjunto de liquidaciones");
      }

      const savedPayout = await Liquidaciones.create({
        id: uuidv4(),
        ...payout,
      });

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
      if (!Array.isArray(payouts)) {
        res
          .status(400)
          .json({ error: "Se esperaba un conjunto de liquidaciones" });
        return;
      }

      // Asegúrate de que cada liquidación tiene la estructura esperada
      // Si tienes un tipo o validación adicional, puedes agregarla aquí
      if (payouts.some((payout: any) => !payout.tipo)) {
        res.status(400).json({ error: "Cada liquidación debe tener un tipo." });
        return;
      }
      // Eliminar ID de cada liquidación para evitar conflictos con el UUID automático
      const cleanData = payouts.map((liq) => {
        const { id, ...rest } = liq;
        return rest; // Retorna el objeto sin el ID
      });

      // Filtrar los valores undefined para evitar errores en Sequelize
      const filteredData = cleanData.map((liq) =>
        Object.fromEntries(
          Object.entries(liq).filter(([_, value]) => value !== undefined)
        )
      );

      // Crear todas las liquidaciones en un solo insert
      const savedPayouts = await Liquidaciones.bulkCreate(filteredData);

      res.status(201).json(savedPayouts);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getPayouts(req: Request, res: Response): Promise<void> {
    try {
      const payouts = await Liquidaciones.findAll();
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

      const payouts = await Liquidaciones.findAll({ where: { tipo: type } });
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
