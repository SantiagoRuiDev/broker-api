import { Request, Response } from "express";
import {
  Clientes,
  Liquidaciones,
  Subagentes,
  Aseguradoras,
  Configuracion,
  Finalizadas,
} from "../database/connection";
import { v4 as uuidv4 } from "uuid";
import {
  ISettlement,
  ISettlementExport,
  KanbanStates,
  LiquidacionTypes,
} from "../interfaces/settlement.interface";
import { generateAgentCode } from "../utils/code";
import { getPendingTemplate } from "../templates/pending.template";
import archiver from "archiver";
import { Sequelize } from "sequelize";
import { getLiquidationTemplate } from "../templates/liquidation.template";
import { getTextTemplate } from "../templates/text.template";
import { generatePDF } from "../utils/generator";
import { CreateOptions } from "html-pdf";
import PDF from "html-pdf";
import fs from "fs/promises";
import { html2pdf, HTML2PDFOptions } from "html2pdf-ts";
import path from "path";
import { Op } from "sequelize";

export class SettlementController {
  constructor() {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payout = req.body;

      const user = await Clientes.findOne({
        where: { correo: payout.cliente },
      });

      const agents = await Subagentes.findAll();

      if (payout.SAge) {
        if (
          agents.filter((agent) => agent.dataValues.codigo == payout.SAge)
            .length == 0
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
          nombre: payout.cliente,
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
              nombre: row.cliente,
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

  async getMultiplePayouts(req: Request, res: Response): Promise<void> {
    try {
      // Extraer IDs desde query
      let ids = req.query.id;

      // Si viene un solo ID, convertirlo en array
      if (!ids) {
        res.status(400).json({ message: "No se proporcionaron IDs." });
        return;
      }

      if (!Array.isArray(ids)) {
        ids = [ids]; // convertir a array si es un solo ID
      }

      const payouts = await Liquidaciones.findAll({
        where: {
          id: ids, // Sequelize va a hacer un WHERE id IN (...)
        },
        include: [
          {
            model: Clientes,
            required: false,
          },
          {
            model: Aseguradoras,
            required: false,
          },
          {
            model: Subagentes,
            required: false,
          },
        ],
      });

      const lastLiquidation = await Liquidaciones.findOne({
        where: { tipo: "Consolidado" },
        order: [
          [
            Sequelize.literal(
              `CAST(SUBSTRING_INDEX(FinalizadaNumeroLiquidacion, '/', -1) AS UNSIGNED)`
            ),
            "DESC",
          ], // Año
          [
            Sequelize.literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(FinalizadaNumeroLiquidacion, '/', 2), '/', -1) AS UNSIGNED)`
            ),
            "DESC",
          ], // Mes
          [
            Sequelize.literal(
              `CAST(SUBSTRING_INDEX(FinalizadaNumeroLiquidacion, '/', 1) AS UNSIGNED)`
            ),
            "DESC",
          ], // Secuencial
        ],
      });

      if (!payouts || payouts.length === 0) {
        res.status(404).json({
          message: "No encontramos Liquidaciones para los IDs proporcionados",
        });
        return;
      }

      const liquidation_number = lastLiquidation
        ? Number(
            lastLiquidation.dataValues.FinalizadaNumeroLiquidacion.split("/")[0]
          ) + 1
        : 1;

      res.status(200).json({
        payouts: payouts,
        count: liquidation_number,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getPayouts(req: Request, res: Response): Promise<void> {
    try {
      const { finished } = req.query;
      let payouts: any[] = [];
      if (!finished) {
        payouts = await Liquidaciones.findAll({
          include: [
            {
              model: Clientes, // Modelo de Clientes
              required: true, // `false` para LEFT JOIN, `true` para INNER JOIN
            },
            {
              model: Subagentes,
              required: true,
            },
          ],
        });
        if (!payouts) {
          res.status(404).json({ message: "No encontramos Liquidaciones" });
          return;
        }
      } else {
        payouts = await Liquidaciones.findAll({
          where: {
            FinalizadaNumeroLiquidacion: {
              [Op.not]: null,
            },
          },
          include: [
            {
              model: Clientes, // Modelo de Clientes
              required: true, // `false` para LEFT JOIN, `true` para INNER JOIN
            },
            {
              model: Subagentes,
              required: true,
            },
            {
              model: Finalizadas,
              required: true,
            },
          ],
        });
        if (!payouts) {
          res.status(404).json({ message: "No encontramos Liquidaciones" });
          return;
        }
      }
      res.status(200).json(payouts);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async liquidate(req: Request, res: Response): Promise<void> {
    try {
      const rows: string[] = req.body.rows;
      const liq_date = req.body.liquidation_date;
      const liq_number = req.body.liquidation_number;
      const { iva, ret_iva, ret_renta, gastos_adm, tarifa_comision, agent } =
        req.body;
      let liq_total = req.body.total;
      let liq_loan = req.body.loan;
      let agent_code = agent;

      if (!Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({ message: "Se requiere un array de IDs" });
        return;
      }

      const liquidationAlreadyExist = await Liquidaciones.findAll({
        where: { FinalizadaNumeroLiquidacion: liq_number },
        include: [
          {
            model: Finalizadas,
            required: true,
          },
        ],
      });

      if (liquidationAlreadyExist.length > 0) {
        // Si la liquidación ya existe, obtiene los valores calculados anteriormente y los recalcula
        liq_total +=
          liquidationAlreadyExist[0].dataValues.Finalizada.total_liquidado;
        liq_loan += liquidationAlreadyExist[0].dataValues.Finalizada.prestamo;
        agent_code = liquidationAlreadyExist[0].dataValues.SubagenteCodigo;

        await Finalizadas.update(
          { total_liquidado: liq_total, prestamo: liq_loan },
          { where: { numero_liquidacion: liq_number } }
        );
        rows.push(...liquidationAlreadyExist.map((l) => l.dataValues.id)); // Empuja el arreglo de las ID ya registradas en la DB
      } else {
        await Finalizadas.create({
          kanban: "Emitida",
          numero_liquidacion: liq_number,
          fecha_liquidacion: liq_date,
          prestamo: liq_loan,
          total_liquidado: liq_total,
          iva: iva,
          ret_iva: ret_iva,
          ret_renta: ret_renta,
          gastos_adm: gastos_adm,
          tarifa_comision: tarifa_comision,
        });
      }

      const [updatedCount] = await Liquidaciones.update(
        {
          tipo: "Consolidado",
          estado: "Emitida",
          FinalizadaNumeroLiquidacion: liq_number,
          SubagenteCodigo: agent_code,
        },
        {
          where: {
            id: rows, // Sequelize interpreta esto como IN
          },
        }
      );

      if (updatedCount === 0) {
        res
          .status(404)
          .json({ message: "No se encontraron liquidaciones para actualizar" });
        return;
      }

      res
        .status(200)
        .json({ message: `${updatedCount} liquidaciones actualizadas` });
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
        .status(200)
        .json({ message: "Liquidación actualizada correctamente" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async updateStatusById(req: Request, res: Response): Promise<void> {
    try {
      const status = req.body.status;
      // Extraer IDs desde query
      const liq_number = req.query.id;

      // Si viene un solo ID, convertirlo en array
      if (!liq_number) {
        res.status(400).json({ message: "No se proporcionaron IDs." });
        return;
      }

      if (!Array.isArray(liq_number) || liq_number.length === 0) {
        res.status(400).json({ message: "Se requiere un array de IDs" });
        return;
      }

      await Finalizadas.update(
        { kanban: status },
        { where: { numero_liquidacion: liq_number[0] } }
      );

      if (status == KanbanStates.LISTA) {
        const liq = await Liquidaciones.findOne({
          where: { FinalizadaNumeroLiquidacion: liq_number[0] },
          include: [
            {
              model: Clientes,
              required: true,
            },
            {
              model: Aseguradoras,
              required: true,
            },
            {
              model: Subagentes,
              required: true,
            },
            {
              model: Finalizadas,
              required: true,
            },
          ],
        });

        if (!liq) {
          throw new Error("Liquidación no encontrada");
        }

        const filename =
          String(liq_number[0]).split("/")[0] +
          " " +
          String(liq.dataValues.Subagente.nombres).toUpperCase() +
          " " +
          String(liq.dataValues.Subagente.apellidos).toUpperCase();
        const config = await Configuracion.findOne({
          where: { id: "CONFIGURACION" },
        });
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="' + filename + '"'
        );
        res.setHeader("Content-Type", "text/plain");
        res
          .status(200)
          .send(getTextTemplate(liq?.dataValues, config?.dataValues));
        return; // <-- ¡Esto es importante!
      }

      res.status(200).json({ message: "Estado actualizado correctamente" });
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
      await Finalizadas.destroy({
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

  async getPendingPdfs(req: Request, res: Response): Promise<void> {
    try {
      // Extraer IDs desde query
      let ids = req.query.id;

      // Si viene un solo ID, convertirlo en array
      if (!ids) {
        res.status(400).json({ message: "No se proporcionaron IDs." });
        return;
      }

      if (!Array.isArray(ids)) {
        ids = [ids]; // convertir a array si es un solo ID
      }

      const payouts = await Liquidaciones.findAll({
        where: {
          id: ids, // Sequelize va a hacer un WHERE id IN (...)
        },
        include: [
          {
            model: Clientes,
            required: false,
          },
          {
            model: Aseguradoras,
            required: false,
          },
          {
            model: Subagentes,
            required: false,
          },
        ],
      });
      const filteredRows: ISettlementExport[] = [];

      Array.from(payouts).forEach((liq) => {
        const exist = filteredRows.find(
          (i: ISettlementExport) =>
            i.codigo_agente === liq.dataValues.SubagenteCodigo
        );
        if (exist) {
          exist.liquidaciones.push(liq.dataValues);
        } else {
          filteredRows.push({
            codigo_agente: liq.dataValues.SubagenteCodigo || "",
            liquidaciones: [liq.dataValues],
          });
        }
      });

      const archive = archiver("zip", { zlib: { level: 9 } });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="RECORDATORIOS_PENDIENTES.zip"'
      );
      archive.pipe(res);

      let remaining = filteredRows.length;

      for (const row of filteredRows) {
        const filename =
          "PENDIENTE " + String(payouts[0].dataValues.id).split("-")[0];
        const html = getPendingTemplate(row.liquidaciones);
        const filePath = path.join(
          __dirname,
          "../../public/pdf",
          filename + ".pdf"
        );

        const options: HTML2PDFOptions = {
          format: "A4",
          filePath: "./public/pdf/" + filename + ".pdf",
          landscape: false,
          resolution: {
            height: 1920,
            width: 1080,
          },
        };

        await html2pdf.createPDF(html, options);

        const pdfBuffer = await fs.readFile(filePath);
        archive.append(pdfBuffer, {
          name: `PENDIENTES_${row.codigo_agente}.pdf`,
        });
        remaining--;
        if (remaining === 0) {
          // Finalizar el zip cuando todos estén agregados
          archive.finalize();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
  async getLiquidationTXT(req: Request, res: Response): Promise<void> {
    try {
      let { id } = req.query;

      // Si viene un solo ID, convertirlo en array
      if (!id) {
        res.status(400).json({ message: "No se proporcionaron IDs." });
        return;
      }

      if (!Array.isArray(id)) {
        id = [id]; // convertir a array si es un solo ID
      }

      const liq = await Liquidaciones.findOne({
        where: { FinalizadaNumeroLiquidacion: id[0] },
        include: [
          {
            model: Clientes,
            required: true,
          },
          {
            model: Aseguradoras,
            required: true,
          },
          {
            model: Subagentes,
            required: true,
          },
          {
            model: Finalizadas,
            required: true,
          },
        ],
      });

      if (!liq) {
        throw new Error("Liquidación no encontrada");
      }

      const config = await Configuracion.findOne({
        where: { id: "CONFIGURACION" },
      });
      const filename =
        String(liq.dataValues.FinalizadaNumeroLiquidacion).split("/")[0] +
        " " +
        String(liq.dataValues.Subagente.nombres).toUpperCase() +
        " " +
        String(liq.dataValues.Subagente.apellidos).toUpperCase();
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + filename + '"'
      );
      res.setHeader("Content-Type", "text/plain");
      res
        .status(200)
        .send(getTextTemplate(liq?.dataValues, config?.dataValues));
      return; // <-- ¡Esto es importante!
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async getLiquidationPDF(req: Request, res: Response): Promise<void> {
    try {
      // Extraer IDs desde query
      const { id } = req.query;

      // Si viene un solo ID, convertirlo en array
      if (!id) {
        res.status(400).json({ message: "No se proporcionaron ID." });
        return;
      }

      const payouts = await Liquidaciones.findAll({
        where: {
          FinalizadaNumeroLiquidacion: id, // Sequelize va a hacer un WHERE id IN (...)
        },
        include: [
          {
            model: Clientes,
            required: true,
          },
          {
            model: Aseguradoras,
            required: true,
          },
          {
            model: Finalizadas,
            required: true,
          },
        ],
      });

      if (payouts.length == 0) {
        throw new Error(
          "Porfavor ingresa un numero de liquidación que tenga liquidaciones"
        );
      }

      const agent = await Subagentes.findOne({
        where: { codigo: payouts[0].dataValues.SubagenteCodigo },
      });

      if (!agent) {
        throw new Error(
          "No encontramos un subagente relacionado a estas liquidaciones"
        );
      }

      const filename =
        "LIQUIDACION " +
        String(payouts[0].dataValues.FinalizadaNumeroLiquidacion).split("/")[0];

      const pdfBuffer = await generatePDF(
        getLiquidationTemplate(payouts, agent.dataValues)
      );

      // 3. Enviar como archivo descargable
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.pdf"`
      );

      res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    }
  }
}
