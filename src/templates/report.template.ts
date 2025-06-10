import { Aseguradoras, Ramos } from "../database/connection";
import { IReportRow } from "../interfaces/settlement.interface";
import config from "../utils/config";

export const getReportTemplate = async (rows: IReportRow[], today: Date) => {
  const agency_codes = await Ramos.findAll({
    include: [{ model: Aseguradoras, required: true }],
  });
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const first_line =
    "I01         " +
    config.BROKER_CODE +
    "     " +
    day +
    "/" +
    month +
    "/" +
    year +
    "   " +
    (rows.length + 1) +
    "\n";

  let content = "";

  for (const row of rows) {
    content +=
      row.ruc_aseguradora +
      "   " +
      agency_codes.find(
        (code) =>
          code.dataValues.codigo_ramo == row.codigo_ramo &&
          code.dataValues.Aseguradora.ruc == row.ruc_aseguradora
      )?.dataValues.codigo_ramo_cia +
      "   " +
      row.valor_prima +
      "   " +
      row.comision +
      "\n";
  }

  return first_line + content;
};
