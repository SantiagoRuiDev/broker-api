import { IConfiguration } from "../interfaces/configuration.interface";
import { ISettlementMapped } from "../interfaces/settlement.interface";

export const getTextTemplate = (payout: ISettlementMapped, config: IConfiguration) => {
  const agent = payout.Subagente;
  if (agent) {
    return (
      config.tipo + "	" +
      config.numero_empresa +
      "	" +
      config.numero_secuencial +
      "		" +
      agent.codigo_de_beneficiario +
      "	" +
      config.moneda.toUpperCase() +
      "	" +
      payout.total_liquidado +
      "	" +
      agent.forma_de_pago?.toUpperCase() +
      "	" +
      agent.codigo_de_banco +
      "	" +
      agent.tipo_de_cuenta?.toUpperCase() +
      "	" +
      agent.numero_cuenta +
      "	" +
      agent.tipo_de_documento?.toUpperCase() +
      "	" +
      agent.cedula +
      "	" +
      agent.nombres.toUpperCase() + " " + agent.apellidos.toUpperCase() +
      "		" +
      agent.ciudad_beneficiario?.toUpperCase() +
      "			" +
      "PAGO LIQUIDACION " +
      payout.numero_liquidacion?.split("/")[0]
    );
  }
};
