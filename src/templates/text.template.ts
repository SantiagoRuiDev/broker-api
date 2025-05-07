import { IConfiguration } from "../interfaces/configuration.interface";
import { ISettlementMapped } from "../interfaces/settlement.interface";

export const getTextTemplate = (payout: ISettlementMapped, config: IConfiguration) => {
  const agent = payout.Subagente;
  if (agent) {
    const ciudad_beneficiario = agent.ciudad_beneficiario ? agent.ciudad_beneficiario.toUpperCase() : 0;
    const codigo_de_beneficiario = agent.codigo_de_beneficiario ? agent.codigo_de_beneficiario : 0;
    const forma_de_pago = agent.forma_de_pago ? agent.forma_de_pago.toUpperCase() : 0;
    const codigo_de_banco = agent.codigo_de_banco ? agent.codigo_de_banco : 0;
    const tipo_de_cuenta = agent.tipo_de_cuenta ? agent.tipo_de_cuenta.toUpperCase() : 0;
    const numero_cuenta = agent.numero_cuenta ? agent.numero_cuenta : 0;
    const tipo_de_documento = agent.tipo_de_documento ? agent.tipo_de_documento.toUpperCase().charAt(0) : 0;
    const cedula = agent.cedula ? agent.cedula : 0;
     return (
      config.tipo + "	" +
      config.numero_empresa +
      "	" +
      config.numero_secuencial +
      "		" +
      codigo_de_beneficiario +
      "	" +
      config.moneda.toUpperCase() +
      "	" +
      Math.round((payout.total_liquidado || 0) * 10_000_000_000) +
      "	" +
      forma_de_pago +
      "	" +
      codigo_de_banco +
      "	" +
      tipo_de_cuenta +
      "	" +
      numero_cuenta +
      "	" +
      tipo_de_documento +
      "	" +
      cedula +
      "	" +
      agent.nombres.toUpperCase() + " " + agent.apellidos.toUpperCase() +
      "		" +
      ciudad_beneficiario +
      "			" +
      "PAGO LIQUIDACION " +
      payout.numero_liquidacion?.split("/")[0]
    );
  }
};
