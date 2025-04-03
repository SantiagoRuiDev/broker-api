export interface ISettlement {
  id?: string;
  tipo: LiquidacionTypes;
  estado: LiquidacionStates;
  factura?: number;
  documento?: number;
  orden?: string;
  fecha_vence?: Date;
  d_inicial?: number;
  poliza?: string;
  anexo?: number;
  endoso?: string;
  codigo?: number;
  cliente?: string;
  f_contab?: Date;
  valor_prima?: number;
  comision?: number;
  F?: string;
  L?: string;
  P?: string;
  Ori?: string;
  SAge?: string;
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
