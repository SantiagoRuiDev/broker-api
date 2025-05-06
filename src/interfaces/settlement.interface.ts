import { AseguradoraTS } from "./agency.interface";
import { IAgent } from "./agent.interface";
import { IClient } from "./client.interface";

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


export interface ISettlementMapped {
  id?: string;
  tipo: LiquidacionTypes;
  estado: LiquidacionStates;
  kanban?: KanbanStates;
  factura?: number;
  documento?: number;
  orden?: string;
  fecha_vence?: string;
  d_inicial?: number;
  poliza?: string;
  anexo?: number;
  endoso?: string;
  codigo?: number;
  Cliente?: IClient;
  Aseguradora?: AseguradoraTS;
  Subagente?: IAgent;
  SubagenteCodigo?: string;
  f_contab?: string;
  valor_prima?: number;
  comision?: number;
  F?: string;
  L?: string;
  P?: string;
  Notas?: string;
  SAge?: string;
  numero_liquidacion?: string;
  fecha_liquidacion?: string;
  total_liquidado?: number;
}

export interface ISettlementExport {
  codigo_agente: string;
  liquidaciones: ISettlementMapped[];
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

export enum LiquidacionStates {
  EMITIDO = "Emitida",
  LISTA = "Lista",
  POR_FACTURAR = "Por Facturar",
  POR_LIBERAR = "Por Liberar",
}

export enum KanbanStates {
  EMITIDO = "Emitida",
  LISTA = "Lista",
  ENVIADA = "Enviada",
  PAGADA = "Pagada",
}
