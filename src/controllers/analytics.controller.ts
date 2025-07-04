import { Request, Response } from "express";
import {
  Clientes,
  Liquidaciones,
  Subagentes,
  Usuarios,
} from "../database/connection";
import { CustomRequest } from "../interfaces/custom_request.interface";
import { Op } from "sequelize";
import { LiquidacionTypes } from "../interfaces/settlement.interface";
import { categories, PayoutsMonthlyStat } from "../interfaces/analytic.interface";

export class AnalyticController {
  constructor() {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const clients = await Clientes.findAll();
      const agents = await Subagentes.findAll();

      const min_date = new Date();
      const max_date = new Date();
      min_date.setMonth(0,1);
      max_date.setMonth(11,31);
      const payouts = await Liquidaciones.findAll({
        where: {
          fecha_importacion: {
            [Op.between]: [min_date, max_date],
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
      const pendingPayments = await Liquidaciones.findAll({where: {tipo: LiquidacionTypes.NEGOCIO_PENDIENTE}})
      const missingInformation = await Liquidaciones.findAll({where: {tipo: LiquidacionTypes.NEGOCIO_LIBERADO}})
      const mappedPayouts: PayoutsMonthlyStat[] = [];
      const months = categories;
      for(const month of months){
        mappedPayouts.push({month: month, quantity: 0});
      }
      for(const payout of payouts){
        const payout_month = new Date(payout.dataValues.fecha_importacion).toLocaleString('en-US', { month: 'long' });
        const statExist = mappedPayouts.find(mp => mp.month == payout_month.slice(0,3));
        if(statExist){
          statExist.quantity++;
        }
      }
      res.status(200).json({ clients: clients.length, agents: agents.length, monthly_payouts: mappedPayouts, pending_payments: pendingPayments.length, missing_information: missingInformation.length });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
