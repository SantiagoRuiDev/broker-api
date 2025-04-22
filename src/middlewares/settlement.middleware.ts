import { validateSchemas } from "../utils/schema";
import { NextFunction, Request, Response } from "express";
import { LiquidacionTypes } from "../interfaces/settlement.interface";
import { IError } from "../interfaces/error.interface";

export class SettlementMiddleware {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settlement = req.body;
      
      if (Array.isArray(settlement)) {
        throw new Error("Porfavor no envies un conjunto de liquidaciones");
      }

      const fields = [settlement.F, settlement.L, settlement.P];
      const fieldsLength = fields.filter((field) => field == "").length;

      if (fieldsLength == 3 && settlement.factura == 0) {
        throw new Error("Porfavor, completa los campos (F,L,P) y Factura");
      }

      if(settlement.anexo == ""){
        throw new Error("Porfavor, completa el campo anexo");
      }
      if(settlement.poliza == ""){
        throw new Error("Porfavor, completa el campo poliza");
      }
      if(settlement.documento == ""){
        throw new Error("Porfavor, completa el campo documento");
      }
      if(settlement.cliente == ""){
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

        if(payout.anexo == ""){
          errors.push({index: i, field: "Anexo", fill: true})
        }
        if(payout.poliza == ""){
          errors.push({index: i, field: "Poliza", fill: true})
        }
        if(payout.documento == ""){
          errors.push({index: i, field: "Documento", fill: true})
        }
        if(payout.cliente == ""){
          errors.push({index: i, field: "Cliente", fill: true})
        }
        
        if (fieldsLength == 3) {
          if(payout.factura == 0){ // Si no tiene numero de factura y los campos estan vacios
            errors.push({index: i, field: "Factura, F, L, P", fill: true})
          } else { // Si tiene numero de factura y los campos estan vacios
            errors.push({index: i, field: "F, L, P", fill: true})
          }
        }

        if (payout.factura == 0) {
          if (fieldsLength == 0) { // Si los campos estan completos y no tiene numero de factura
            payout.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
          } 
        } else {
          if (fieldsLength == 0) { // Si los campos estan completos y tiene numero de factura
            payout.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
          } else { // Si los campos estan incompletos y tiene numero de factura
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
          }
        }
      }

      for (let i = 0; i < payouts.without_user.length; i++) {
        const payout = payouts.without_user[i];
        const fields = [payout.F, payout.L, payout.P];
        const fieldsLength = fields.filter((field) => field == "").length;
        
        if(payout.anexo == ""){
          errors.push({index: i, field: "Anexo", fill: true})
        }
        if(payout.poliza == ""){
          errors.push({index: i, field: "Poliza", fill: true})
        }
        if(payout.documento == ""){
          errors.push({index: i, field: "Documento", fill: true})
        }
        if(payout.cliente == ""){
          errors.push({index: i, field: "Cliente", fill: true})
        }
        
        
        if (fieldsLength == 3) {
          if(payout.factura == 0){
            errors.push({index: payouts.with_user.length + i, field: "Factura, F, L, P", fill: true})
          } else {
            errors.push({index: payouts.with_user.length + i, field: "F, L, P", fill: true})
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

      if(errors.length > 0){
        res.status(400).json({ message: "Las liquidaciones tienen errores en su estructura", errors, payouts });
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
