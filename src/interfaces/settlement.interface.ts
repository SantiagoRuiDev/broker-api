export interface ISettlement {
  id?: string;
  tipo: LiquidacionTypes;
  estado: LiquidacionStates;
  empresa?: string;
  ciudad?: string;
  factura?: number;
  documento?: number;
  orden?: string;
  fecha_vence?: Date;
  fecha_inicio?: number;
  poliza?: string;
  anexo?: string;
  endoso?: string;
  codigo?: number;
  S?: Date;
  valor_prima?: number;
  comision?: number;
  F?: string;
  L?: string;
  P?: string;
  ori?: string;
  sAge?: string;
  fecha_facturacion?: Date;
  facturado?: "Si" | "No";
  cobrado?: "Si" | "No";
  fecha_cobrado?: Date;
  pagado?: "Si" | "No";
  fecha_liquidacion?: Date;
  por_enviar?: "Si" | "No";
  clientId?: string;
  subagenteId?: string;
  aseguradoraId?: string;
}

export enum LiquidacionTypes {
  PRE_LIQUIDACIONES = "Pre Liquidacion",
  NEGOCIO_PENDIENTE = "Negocio Pendiente",
  NEGOCIO_LIBERADO = "Negocio Liberado",
  CONSOLIDADO = "Consolidado",
}

enum LiquidacionStates {
  EMITIDO = "Emitido",
  ENVIADO = "Enviado",
  LISTO = "Listo",
  PAGADO = "Pagado",
}
