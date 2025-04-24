import { NextFunction, Request, Response } from "express";
import {
  compareSettlements,
  ISettlement,
  LiquidacionTypes,
} from "../interfaces/settlement.interface";
import { Liquidaciones } from "../database/connection";
import { IError } from "../interfaces/error.interface";

export class SettlementMiddleware {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlement = req.body;

      if (Array.isArray(settlement)) {
        throw new Error("Porfavor no envies un conjunto de liquidaciones");
      }

      const searchFields = {
        factura: Number(settlement.factura),
        endoso: settlement.endoso,
        anexo: settlement.anexo,
        documento: settlement.documento,
        poliza: settlement.poliza,
        codigo: settlement.codigo,
        valor_prima: settlement.valor_prima,
        comision: settlement.comision,
      };

      const payoutAlreadyExist = await Liquidaciones.findAndCountAll({
        where: searchFields,
      });

      if (payoutAlreadyExist.count >= 1) {
        throw new Error("Estas intentando insertar una fila duplicada");
      }

      const fields = [settlement.F, settlement.L, settlement.P];
      const fieldsLength = fields.filter((field) => field == "").length;

      if (fieldsLength == 3 && settlement.factura == 0) {
        throw new Error("Porfavor, completa los campos (F,L,P) y Factura");
      }

      if (settlement.fecha_vence == "") {
        throw new Error("Porfavor, completa el campo fecha de vencimiento");
      }
      if (settlement.f_contab == "") {
        throw new Error("Porfavor, completa el campo f/contab");
      }
      if (settlement.comision == 0) {
        throw new Error("Porfavor, completa el campo comisión");
      }
      if (settlement.codigo == 0) {
        throw new Error("Porfavor, completa el campo codigo");
      }
      if (settlement.endoso == "") {
        throw new Error("Porfavor, completa el campo anexo");
      }
      if (settlement.anexo == 0) {
        throw new Error("Porfavor, completa el campo anexo");
      }
      if (settlement.poliza == "") {
        throw new Error("Porfavor, completa el campo poliza");
      }
      if (settlement.documento == "") {
        throw new Error("Porfavor, completa el campo documento");
      }
      if (settlement.cliente == "") {
        throw new Error("Porfavor, completa el campo cliente");
      }

      if (settlement.factura == 0) {
        if (fieldsLength == 0) {
          settlement.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
        } else {
          throw new Error("Porfavor completa los campos (F,L,P)");
        }
      } else {
        if (fieldsLength == 0) {
          settlement.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
        } else {
          settlement.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
        }
      }

      req.body = settlement;

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error });
        return;
      }
    }
  }

  async createMany(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payouts = req.body;
      if (
        !Array.isArray(payouts.with_user) &&
        !Array.isArray(payouts.without_user)
      ) {
        res
          .status(400)
          .json({ error: "Se esperaba un conjunto de liquidaciones" });
        return;
      }
      const errors: IError[] = [];

      for (let i = 0; i < payouts.with_user.length; i++) {
        const payout = payouts.with_user[i];
        const fields = [payout.F, payout.L, payout.P]; // Completo = [S, S, S]
        const fieldsLength = fields.filter((field) => field == "").length; // Si los campos estan vacios (3) si esta completo (0)

        const searchFields = {
          factura: Number(payout.factura),
          endoso: payout.endoso,
          anexo: payout.anexo,
          documento: payout.documento,
          poliza: payout.poliza,
          codigo: payout.codigo,
          valor_prima: payout.valor_prima,
          comision: payout.comision,
        };

        const payoutAlreadyExist = await Liquidaciones.findOne({
          where: searchFields,
        });

        if (payoutAlreadyExist) {
          errors.push({
            index: i,
            field: "Esta fila ya existe en el sistema",
            fill: false,
          });
        }

        // Revisa que no haya otra fila identica
        if (
          payouts.with_user.filter((settlement: ISettlement) =>
            compareSettlements(settlement, payout)
          ).length >= 2
        ) {
          errors.push({
            index: i,
            field: "Esta fila esta duplicada",
            fill: false,
          });
        }
        if (
          payouts.without_user.find((settlement: ISettlement) =>
            compareSettlements(settlement, payout)
          )
        ) {
          errors.push({
            index: i,
            field: "Esta fila esta duplicada",
            fill: false,
          });
        }

        if (payout.fecha_vence == "") {
          errors.push({ index: i, field: "Fecha vencimiento", fill: true });
        }
        if (payout.valor_prima == 0) {
          errors.push({ index: i, field: "Valor prima", fill: true });
        }
        if (payout.comision == 0) {
          errors.push({ index: i, field: "Comisión agente", fill: true });
        }
        if (payout.codigo == 0) {
          errors.push({ index: i, field: "Codigo", fill: true });
        }
        if (payout.endoso == "") {
          errors.push({ index: i, field: "Endoso", fill: true });
        }
        if (payout.anexo == 0) {
          errors.push({ index: i, field: "Anexo", fill: true });
        }
        if (payout.poliza == "") {
          errors.push({ index: i, field: "Poliza", fill: true });
        }
        if (payout.f_contab == "") {
          errors.push({ index: i, field: "F/Contab", fill: true });
        }
        if (payout.documento == "") {
          errors.push({ index: i, field: "Documento", fill: true });
        }
        if (payout.cliente == "") {
          errors.push({ index: i, field: "Cliente", fill: true });
        }

        if (fieldsLength == 3) {
          if (payout.factura == 0) {
            // Si no tiene numero de factura y los campos estan vacios
            errors.push({ index: i, field: "Factura, F, L, P", fill: true });
          } else {
            // Si tiene numero de factura y los campos estan vacios
            errors.push({ index: i, field: "F, L, P", fill: true });
          }
        }

        if (payout.factura == 0) {
          if (fieldsLength == 0) {
            // Si los campos estan completos y no tiene numero de factura
            payout.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
          }
        } else {
          if (fieldsLength == 0) {
            // Si los campos estan completos y tiene numero de factura
            payout.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
          } else {
            // Si los campos estan incompletos y tiene numero de factura
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
          }
        }
      }

      for (let i = 0; i < payouts.without_user.length; i++) {
        const payout = payouts.without_user[i];
        const fields = [payout.F, payout.L, payout.P];
        const fieldsLength = fields.filter((field) => field == "").length;

        const searchFields = {
          factura: Number(payout.factura),
          endoso: payout.endoso,
          anexo: payout.anexo,
          documento: payout.documento,
          poliza: payout.poliza,
          codigo: payout.codigo,
          valor_prima: payout.valor_prima,
          comision: payout.comision,
        };

        const payoutAlreadyExist = await Liquidaciones.findOne({
          where: searchFields,
        });

        if (payoutAlreadyExist) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Esta fila ya existe en el sistema",
            fill: false,
          });
        }
        // Revisa que no haya otra fila identica
        if (
          payouts.without_user.filter((settlement: ISettlement) =>
            compareSettlements(settlement, payout)
          ).length >= 2
        ) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Esta fila esta duplicada",
            fill: false,
          });
        }
        if (
          payouts.with_user.find((settlement: ISettlement) =>
            compareSettlements(settlement, payout)
          )
        ) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Esta fila esta duplicada",
            fill: false,
          });
        }

        if (payout.fecha_vence == "") {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Fecha vencimiento",
            fill: true,
          });
        }
        if (payout.valor_prima == 0) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Valor prima",
            fill: true,
          });
        }
        if (payout.comision == 0) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Comisión",
            fill: true,
          });
        }
        if (payout.codigo == 0) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Codigo",
            fill: true,
          });
        }
        if (payout.endoso == "") {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Endoso",
            fill: true,
          });
        }
        if (payout.f_contab == "") {
          errors.push({
            index: payouts.with_user.length + i,
            field: "F/Contab",
            fill: true,
          });
        }
        if (payout.anexo == 0) {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Anexo",
            fill: true,
          });
        }
        if (payout.poliza == "") {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Poliza",
            fill: true,
          });
        }
        if (payout.documento == "") {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Documento",
            fill: true,
          });
        }
        if (payout.cliente == "") {
          errors.push({
            index: payouts.with_user.length + i,
            field: "Cliente",
            fill: true,
          });
        }

        if (fieldsLength == 3) {
          if (payout.factura == 0) {
            errors.push({
              index: payouts.with_user.length + i,
              field: "Factura, F, L, P",
              fill: true,
            });
          } else {
            errors.push({
              index: payouts.with_user.length + i,
              field: "F, L, P",
              fill: true,
            });
          }
        }

        if (payout.factura == 0) {
          if (fieldsLength == 0) {
            payout.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
          }
        } else {
          if (fieldsLength == 0) {
            payout.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
          } else {
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
          }
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          message: "Las liquidaciones tienen errores en su estructura",
          errors,
          payouts,
        });
        return;
      }

      req.body = payouts;

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message, error });
        return;
      }
    }
  }
}
