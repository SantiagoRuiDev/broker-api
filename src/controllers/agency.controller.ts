import { Request, Response } from "express";
import {
  Aseguradoras,
  Clientes,
  Configuracion,
  Liquidaciones,
  Ramos,
  Sucursales,
} from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import { getReportTemplate } from "../templates/report.template";
import { Op } from "sequelize";
import {
  IReportRow,
  LiquidacionStates,
  LiquidacionTypes,
} from "../interfaces/settlement.interface";
import config from "../utils/config";
import { isStringObject } from "util/types";

export class AgencyController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const agency = req.body;

      const alreadyExist = await Aseguradoras.findOne({
        where: { correo: agency.correo },
      });
      if (alreadyExist)
        throw new Error(
          "Una aseguradora ya ha sido registrada bajo este correo"
        );

      const savedAgency = await Aseguradoras.create({
        id: uuidv4(),
        ...agency,
      });

      res.status(201).json(savedAgency);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getAgencies(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit);
      const page = Number(req.query.page);
      
      const count = await Aseguradoras.count();
      const agencies = await Aseguradoras.findAll({
        limit: limit ? limit : undefined,
        offset: page ? (page - 1) * limit : undefined,
        include: [
          {
            model: Sucursales,
            required: false,
          },
        ],
      });
      if (!agencies) {
        res.status(404).json({ message: "No encontramos Aseguradoras" });
        return;
      }
      res.status(200).json({agencies, count});
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async createCode(req: Request, res: Response): Promise<void> {
    try {
      const alreadyExist = await Ramos.findOne({
        where: {
          AseguradoraId: req.body.AseguradoraId,
          codigo_ramo: req.body.codigo_ramo,
        },
      });
      if (alreadyExist)
        throw new Error(
          "Esta aseguradora ya tiene un codigo ramo con la misma referencia."
        );

      await Ramos.create({
        id: uuidv4(),
        ...req.body,
      });

      res.status(200).json({ message: "Codigo ramo agregado exitosamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async updateCode(req: Request, res: Response): Promise<void> {
    try {
      const codeExist = await Ramos.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (codeExist) {
        const schema = req.body;
        await codeExist.update(schema);
      }

      res.status(200).json({ message: "Codigo ramo actualizado exitosamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getAgencyCodes(req: Request, res: Response): Promise<void> {
    try {
      const agency_codes = await Ramos.findAll({
        include: [{ model: Aseguradoras, required: true }],
      });
      if (!agency_codes) {
        res.status(404).json({ message: "No encontramos codigos ramo" });
        return;
      }
      res.status(200).json(agency_codes);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getSubsidiaries(req: Request, res: Response): Promise<void> {
    try {
      const subsidiaries = await Sucursales.findAll({
        where: { AseguradoraId: req.params.id },
      });
      res.status(200).json(subsidiaries);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

async getReportSVCS(req: Request, res: Response): Promise<void> {
    try {
      /**
       * Buscar todas las liquidaciones realizadas a empresas de seguros en el año.
       * Solo aquellos negocios que sean validos pre-liquidaciones, pendientes por liberar y liquidados.
       * Por cada empresa se calculara la prima neta y total de comisiones cobradas
       * Traducir el codigo ramo de cada empresa por el codigo supercia.
       */
      // Rango de fechas: desde 1 año atrás hasta hoy
      const { from, to } = req.query;
      let min_date = new Date();
      min_date.setMonth(0, 1);
      let max_date = new Date();
      max_date.setMonth(11, 31);

      if(from){
        min_date = new Date(from.toString());
        min_date.setDate(min_date.getDate() + 1);
      }
      if(to){
        max_date = new Date(to.toString());
        max_date.setDate(max_date.getDate() + 1);
      }
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
        include: [
          {
            model: Aseguradoras,
            required: true,
          },
        ],
      });

      const agency_codes = await Ramos.findAll({
        include: [{ model: Aseguradoras, required: true }],
      });

      const report_row: IReportRow[] = [];

      for (const payout of payouts) {
        const raw_code = payout.dataValues.poliza.split("-")[0];
        const final_code = agency_codes.find((code) => code.dataValues.codigo_ramo == raw_code && code.dataValues.Aseguradora.ruc == payout.dataValues.Aseguradora.ruc)?.dataValues.codigo_ramo_cia;

        const alreadyExist = report_row.find(
          (row) =>
            row.ruc_aseguradora == payout.dataValues.Aseguradora.ruc &&
            row.codigo_ramo == final_code
        );
        if (alreadyExist) {
          alreadyExist.valor_prima += payout.dataValues.valor_prima;
          alreadyExist.comision += payout.dataValues.comision;
          continue;
        }

        report_row.push({
          ruc_aseguradora: payout.dataValues.Aseguradora.ruc,
          codigo_ramo: final_code,
          comision: payout.dataValues.comision,
          valor_prima: payout.dataValues.valor_prima,
        });
      }

      const day = String(max_date.getDate()).padStart(2, "0");
      const month = String(max_date.getMonth() + 1).padStart(2, "0");
      const year = max_date.getFullYear();

      report_row.sort((a, b) =>
        a.ruc_aseguradora.localeCompare(b.ruc_aseguradora)
      );

      const config = await Configuracion.findOne({
        where: { id: "CONFIGURACION" },
      });

      const broker_code = config?.dataValues.codigo_broker;

      const filename =
        "I01A" + broker_code + day + "" + month + "" + year;
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + filename + '"'
      );
      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(await getReportTemplate(report_row, max_date, broker_code));
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async addSubsidiary(req: Request, res: Response): Promise<void> {
    try {
      const subsidiary = req.body;

      const agencyExist = await Aseguradoras.findOne({
        where: { id: req.params.id },
      });

      if (!agencyExist) throw new Error("Esta aseguradora no existe");

      await Sucursales.create(subsidiary);

      res.status(201).json({ message: "Sucursal añadida con exito" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    try {
      await Sucursales.destroy({
        where: {},
      });
      await Aseguradoras.destroy({
        where: {},
      });

      res
        .status(201)
        .json({ message: "Aseguradoras eliminadas correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async removeSubsidiary(req: Request, res: Response): Promise<void> {
    try {
      const findSubsidiary = await Sucursales.findOne({
        where: { id: req.params.id },
      });

      if (!findSubsidiary) throw new Error("Esta sucursal no existe");

      await findSubsidiary.destroy();

      res.status(201).json({ message: "Sucursal eliminada con exito" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const agency = req.body;
      const uuid = req.params.id;

      const agencyExist = await Aseguradoras.findOne({
        where: { id: uuid },
      });
      if (!agencyExist) throw new Error("Esta aseguradora no existe");

      await agencyExist.update(agency);

      res
        .status(201)
        .json({ message: "Aseguradora actualizada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const uuid = req.params.id;

      const agencyExist = await Aseguradoras.findOne({
        where: { id: uuid },
      });
      if (!agencyExist) throw new Error("Esta aseguradora no existe");

      await agencyExist.destroy();

      res.status(201).json({ message: "Aseguradora eliminada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
