import { Request, Response } from "express";
import {
  Clientes,
  Liquidaciones,
  Subagentes,
} from "../database/connection";
import { Op } from "sequelize";
import { LiquidacionTypes } from "../interfaces/settlement.interface";
import {
  PayoutsMonthlyStat,
} from "../interfaces/analytic.interface";

export class AnalyticController {
  constructor() {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const clients = await Clientes.count();
      const agents = await Subagentes.count();

      const pendingPayments = await Liquidaciones.count({
        where: { tipo: LiquidacionTypes.NEGOCIO_PENDIENTE },
      });
      const missingInformation = await Liquidaciones.count({
        where: { tipo: LiquidacionTypes.NEGOCIO_LIBERADO },
      });

      const year = new Date().getFullYear();
      const mappedPayouts: PayoutsMonthlyStat[] = [];

      for (let month = 0; month < 12; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // último día del mes

        const count = await Liquidaciones.count({
          where: {
            fecha_importacion: {
              [Op.between]: [startDate, endDate],
            },
            tipo: {
              [Op.in]: [
                LiquidacionTypes.ARCHIVADO,
                LiquidacionTypes.CONSOLIDADO,
                LiquidacionTypes.PRE_LIQUIDACIONES,
              ],
            },
          },
        });

        const monthName = startDate.toLocaleString("en-US", { month: "short" }); // ej. 'Jan'
        mappedPayouts.push({ month: monthName, quantity: count });
      }

      res
        .status(200)
        .json({
          clients: clients,
          agents: agents,
          monthly_payouts: mappedPayouts,
          pending_payments: pendingPayments,
          missing_information: missingInformation,
        });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
