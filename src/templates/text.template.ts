import { IConfiguration } from "../interfaces/configuration.interface";
import { ISettlementMapped } from "../interfaces/settlement.interface";

function to13DigitString(value: number): string {
  const cents = Math.round(value * 100); // convierte a centavos
  return cents.toString().padStart(13, '0'); // rellena con ceros a la izquierda
}

export const getTextTemplate = (payout: ISettlementMapped, config: IConfiguration) => {
  const agent = payout.Subagente;
  if (agent) {
    const ciudad_beneficiario = agent.ciudad_beneficiario ? agent.ciudad_beneficiario.toUpperCase() : 0;
    const codigo_de_beneficiario = agent.codigo_de_beneficiario ? agent.codigo_de_beneficiario : 0;
    const forma_de_pago = config.forma_de_pago ? config.forma_de_pago.toUpperCase() : 0;
    const codigo_de_banco = agent.codigo_de_banco ? agent.codigo_de_banco : 0;
    const tipo_de_cuenta = agent.tipo_de_cuenta ? agent.tipo_de_cuenta.toUpperCase() : 0;
    const numero_cuenta = agent.numero_cuenta ? agent.numero_cuenta : 0;
    const tipo_de_documento = agent.tipo_de_documento ? agent.tipo_de_documento.toUpperCase().charAt(0) : 0;
    const cedula = agent.cedula ? agent.cedula : 0;
    const nombre = (agent.nombres != null && agent.apellidos != null) ? agent.nombres.toUpperCase() + " " + agent.apellidos.toUpperCase() : "SIN NOMBRE";
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
      to13DigitString(payout.total_liquidado || 0) +
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
      nombre +
      "		" +
      ciudad_beneficiario +
      "			" +
      "PAGO LIQUIDACION " +
      payout.numero_liquidacion?.split("/")[0]
    );
  }
};
