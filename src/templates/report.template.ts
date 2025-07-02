import { IReportRow } from "../interfaces/settlement.interface";

export const getReportTemplate = async (rows: IReportRow[], today: Date, broker_code: string) => {
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  const first_line =
    "I01         " +
    broker_code +
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
      row.codigo_ramo +
      "   " +
      row.valor_prima.toFixed(2) +
      "   " +
      row.comision.toFixed(2) +
      "\n";
  }

  return first_line + content;
};
