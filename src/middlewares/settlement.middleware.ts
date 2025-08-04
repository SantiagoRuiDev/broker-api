import { NextFunction, Request, Response } from "express";
import {
  compareSettlements,
  ISettlement,
  LiquidacionStates,
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

      const fields = [settlement.F, settlement.L, settlement.P];
      const fieldsLength = fields.filter((field) => field == "").length;

      const payoutAlreadyExist = await Liquidaciones.findOne({
        where: {
          factura: settlement.factura,
          orden: settlement.orden,
          anexo: settlement.anexo,
          endoso: settlement.endoso,
          documento: settlement.documento,
          poliza: settlement.poliza,
          codigo: settlement.codigo,
        },
      });

      if (payoutAlreadyExist) {
        // Comprueba si el neg que ya existe es un negocio pendiente por liberar y puede convertirlo a pre-liquidación
        const data = payoutAlreadyExist.dataValues;
        if (data.factura_ciaros > 0) {
          if ([data.F, data.L, data.P].filter((i) => i == "").length < 3) {
            if (fieldsLength == 0) {
              payoutAlreadyExist.set({
                F: "S",
                L: "S",
                P: "S",
                tipo: LiquidacionTypes.PRE_LIQUIDACIONES,
                estado: LiquidacionStates.LISTA,
              });
              await payoutAlreadyExist.save();
              res.status(200).json({
                message: "El negocio ya existia, fue actualizado correctamente",
              });
              return;
            }
          }
        } else {
          payoutAlreadyExist.set({
            factura_ciaros: settlement.factura_ciaros,
            F: "S",
            L: "S",
            P: "S",
            tipo: LiquidacionTypes.CONSOLIDADO,
            estado: LiquidacionStates.EMITIDO,
          });
          await payoutAlreadyExist.save();
          res.status(200).json({
            message: "El negocio ya existia, fue actualizado correctamente",
          });
          return;
        }

        throw new Error("Estas intentando insertar una fila duplicada");
      }

      if (fieldsLength == 3 && settlement.factura_ciaros == 0) {
        throw new Error(
          "Porfavor, completa los campos (F,L,P) y Factura Ciaros"
        );
      }

      if (settlement.factura == 0) {
        throw new Error("Porfavor, completa el campo factura");
      }
      if (settlement.comision == 0) {
        throw new Error("Porfavor, completa el campo comisión");
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

      if (settlement.fecha_vence) {
        const expire_date = new Date(settlement.fecha_vence);
        settlement.fecha_vence = expire_date.setDate(expire_date.getDate() - 1);
      } else {
        settlement.fecha_vence = null;
      }

      if (settlement.f_contab) {
        const contab_date = new Date(settlement.f_contab);
        settlement.f_contab = contab_date.setDate(contab_date.getDate() - 1);
      } else {
        settlement.f_contab = null;
      }

      if (settlement.factura_ciaros == 0) {
        if (fieldsLength == 0) {
          if (String(settlement.ori).includes("PXC")) {
            settlement.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
            settlement.estado = LiquidacionStates.POR_LIBERAR;
          } else {
            settlement.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
            settlement.estado = LiquidacionStates.POR_FACTURAR;
          }
        } else {
          settlement.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
          settlement.estado = LiquidacionStates.POR_LIBERAR;
        }
      } else {
        if (fieldsLength == 0) {
          settlement.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
          settlement.estado = LiquidacionStates.LISTA;
        } else {
          settlement.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
          settlement.estado = LiquidacionStates.POR_LIBERAR;
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
        const fieldsLength = fields.filter(
          (field) => String(field).trim() == ""
        ).length; // Si los campos estan vacios (3) si esta completo (0)

        const payoutAlreadyExist = await Liquidaciones.findOne({
          where: {
            factura: payout.factura,
            orden: payout.orden,
            anexo: payout.anexo,
            endoso: payout.endoso,
            documento: payout.documento,
            poliza: payout.poliza,
            codigo: payout.codigo,
          },
        });

        if (payoutAlreadyExist) {
          // Comprueba si el neg que ya existe es un negocio pendiente por liberar y puede convertirlo a pre-liquidación
          const data = payoutAlreadyExist.dataValues;
          if (data.factura_ciaros > 0) {
            if ([data.F, data.L, data.P].filter((i) => i == "").length < 3) {
              if (fieldsLength == 0) {
                payoutAlreadyExist.set({
                  F: "S",
                  L: "S",
                  P: "S",
                  tipo: LiquidacionTypes.PRE_LIQUIDACIONES,
                  estado: LiquidacionStates.LISTA,
                });
                await payoutAlreadyExist.save();
                payouts.with_user = payouts.with_user.filter(
                  (i: ISettlement) => i != payout
                );
                i--;
                continue;
              }
            }
          } else {
            payoutAlreadyExist.set({
              factura_ciaros: payout.factura_ciaros,
              F: "S",
              L: "S",
              P: "S",
              tipo: LiquidacionTypes.CONSOLIDADO,
              estado: LiquidacionStates.EMITIDO,
            });
            await payoutAlreadyExist.save();
            payouts.with_user = payouts.with_user.filter(
              (i: ISettlement) => i != payout
            );
            i--;
            continue;
          }
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

        if (payout.factura == 0) {
          errors.push({ index: i, field: "Factura", fill: true });
        }
        if (payout.valor_prima == 0) {
          errors.push({ index: i, field: "Valor prima", fill: true });
        }
        if (payout.comision == 0) {
          errors.push({ index: i, field: "Comisión agente", fill: true });
        }
        if (payout.poliza == "") {
          errors.push({ index: i, field: "Poliza", fill: true });
        }
        if (payout.documento == "") {
          errors.push({ index: i, field: "Documento", fill: true });
        }
        if (payout.cliente == "") {
          errors.push({ index: i, field: "Cliente", fill: true });
        }

        if (fieldsLength == 3) {
          if (payout.factura_ciaros == 0) {
            // Si no tiene numero de factura y los campos estan vacios
            errors.push({
              index: i,
              field: "Factura Ciaros, F, L, P",
              fill: true,
            });
          } else {
            // Si tiene numero de factura y los campos estan vacios
            errors.push({ index: i, field: "F, L, P", fill: true });
          }
        }

        if (payout.fecha_vence) {
          const expire_date = new Date(payout.fecha_vence);
          payout.fecha_vence = expire_date.setDate(expire_date.getDate() - 1);
        } else {
          payout.fecha_vence = null;
        }

        if (payout.f_contab) {
          const contab_date = new Date(payout.f_contab);
          payout.f_contab = contab_date.setDate(contab_date.getDate() - 1);
        } else {
          payout.f_contab = null;
        }

        if (
          payout.factura_ciaros == 0 ||
          String(payout.factura_ciaros).trim() == ""
        ) {
          if (fieldsLength == 0) {
            if (payout.ori && String(payout.ori).includes("PXC")) {
              payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
              payout.estado = LiquidacionStates.POR_LIBERAR;
            } else {
              payout.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
              payout.estado = LiquidacionStates.POR_FACTURAR;
            }
          } else {
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
            payout.estado = LiquidacionStates.POR_LIBERAR;
          }
        } else {
          if (fieldsLength == 0) {
            // Si los campos estan completos y tiene numero de factura
            if (String(payout.endoso).trim() == "RES") {
              payout.tipo = LiquidacionTypes.CONSOLIDADO;
              payout.estado = LiquidacionStates.EMITIDO;
              continue;
            }
            payout.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
            payout.estado = LiquidacionStates.LISTA;
          } else {
            // Si los campos estan incompletos y tiene numero de factura
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
            payout.estado = LiquidacionStates.POR_LIBERAR;
          }
        }
      }

      for (let i = 0; i < payouts.without_user.length; i++) {
        const payout = payouts.without_user[i];
        const fields = [payout.F, payout.L, payout.P];
        const fieldsLength = fields.filter(
          (field) => String(field).trim() == ""
        ).length;

        const payoutAlreadyExist = await Liquidaciones.findOne({
          where: {
            factura: payout.factura,
            orden: payout.orden,
            anexo: payout.anexo,
            endoso: payout.endoso,
            documento: payout.documento,
            poliza: payout.poliza,
            codigo: payout.codigo,
          },
        });

        if (payoutAlreadyExist) {
          // Comprueba si el neg que ya existe es un negocio pendiente por liberar y puede convertirlo a pre-liquidación
          const data = payoutAlreadyExist.dataValues;
          if (data.factura_ciaros > 0) {
            if ([data.F, data.L, data.P].filter((i) => i == "").length < 3) {
              if (fieldsLength == 0) {
                payoutAlreadyExist.set({
                  F: "S",
                  L: "S",
                  P: "S",
                  tipo: LiquidacionTypes.PRE_LIQUIDACIONES,
                  estado: LiquidacionStates.LISTA,
                });
                await payoutAlreadyExist.save();
                payouts.without_user = payouts.without_user.filter(
                  (i: ISettlement) => i != payout
                );
                i--;
                continue;
              }
            }
          } else {
            payoutAlreadyExist.set({
              factura_ciaros: payout.factura_ciaros,
              F: "S",
              L: "S",
              P: "S",
              tipo: LiquidacionTypes.CONSOLIDADO,
              estado: LiquidacionStates.EMITIDO,
            });
            await payoutAlreadyExist.save();
            payouts.without_user = payouts.without_user.filter(
              (i: ISettlement) => i != payout
            );
            i--;
            continue;
          }
          errors.push({
            index: i,
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

        if (payout.factura == 0) {
          errors.push({ index: i, field: "Factura", fill: true });
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
          if (payout.factura_ciaros == 0) {
            errors.push({
              index: payouts.with_user.length + i,
              field: "Factura Ciaros, F, L, P",
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

        if (payout.fecha_vence) {
          const expire_date = new Date(payout.fecha_vence);
          payout.fecha_vence = expire_date.setDate(expire_date.getDate() - 1);
        } else {
          payout.fecha_vence = null;
        }

        if (payout.f_contab) {
          const contab_date = new Date(payout.f_contab);
          payout.f_contab = contab_date.setDate(contab_date.getDate() - 1);
        } else {
          payout.f_contab = null;
        }

        if (
          payout.factura_ciaros == 0 ||
          String(payout.factura_ciaros).trim() == ""
        ) {
          if (fieldsLength == 0) {
            if (payout.ori && String(payout.ori).includes("PXC")) {
              payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
              payout.estado = LiquidacionStates.POR_LIBERAR;
            } else {
              payout.tipo = LiquidacionTypes.NEGOCIO_LIBERADO;
              payout.estado = LiquidacionStates.POR_FACTURAR;
            }
          } else {
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
            payout.estado = LiquidacionStates.POR_LIBERAR;
          }
        } else {
          if (fieldsLength == 0) {
            // Si los campos estan completos y tiene numero de factura
            if (String(payout.endoso).trim() == "RES") {
              payout.tipo = LiquidacionTypes.CONSOLIDADO;
              payout.estado = LiquidacionStates.EMITIDO;
              continue;
            }
            payout.tipo = LiquidacionTypes.PRE_LIQUIDACIONES;
            payout.estado = LiquidacionStates.LISTA;
          } else {
            // Si los campos estan incompletos y tiene numero de factura
            payout.tipo = LiquidacionTypes.NEGOCIO_PENDIENTE;
            payout.estado = LiquidacionStates.POR_LIBERAR;
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
