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
  codigo?: string;
  cliente?: string;
  f_contab?: Date;
  valor_prima?: number;
  comision?: number;
  F?: string;
  L?: string;
  P?: string;
  Notas?: string;
  SAge?: string;
}

export function compareSettlements (arg1: ISettlement, arg2: ISettlement) {
  return arg1.factura == arg2.factura && arg1.endoso == arg2.endoso && arg1.anexo == arg2.anexo && arg1.documento == arg2.documento && arg1.poliza == arg2.poliza && arg1.codigo == arg2.codigo && arg1.valor_prima == arg2.valor_prima && arg1.comision == arg2.comision
}

export enum LiquidacionTypes {
  PRE_LIQUIDACIONES = "Pre Liquidacion",
  NEGOCIO_PENDIENTE = "Negocio pendiente por liberar",
  NEGOCIO_LIBERADO = "Negocio pendiente por facturar",
  CONSOLIDADO = "Consolidado",
}

enum LiquidacionStates {
  EMITIDO = "Emitido",
  ENVIADO = "Enviado",
  LISTO = "Listo",
  PAGADO = "Pagado",
}
