import { AseguradoraTS } from "./agency.interface";
import { IAgent } from "./agent.interface";
import { IClient } from "./client.interface";
import { IFinished } from "./finished.interface";

export interface ISettlement {
  id?: string;
  tipo: LiquidacionTypes;
  estado: LiquidacionStates;
  factura_ciaros?: number;
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
  FinalizadaNumeroLiquidacion?: string;
  ori?: string;
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
  factura_ciaros?: number;
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
  ori?: string;
  F?: string;
  L?: string;
  P?: string;
  Notas?: string;
  SAge?: string;
  FinalizadaNumeroLiquidacion?: string;
  Finalizada?: IFinished;
}

export interface IReportRow {
  ruc_aseguradora: string;
  codigo_ramo: string;
  valor_prima: number;
  comision: number;
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
  ARCHIVADO = "Archivado"
}

export enum LiquidacionStates {
  EMITIDO = "Emitida",
  LISTA = "Lista",
  POR_FACTURAR = "Por Facturar",
  POR_LIBERAR = "Por Liberar",
  ARCHIVADA = "Archivada"
}

export enum KanbanStates {
  EMITIDO = "Emitida",
  LISTA = "Lista",
  ENVIADA = "Enviada",
  PAGADA = "Pagada",
  ARCHIVADA = "Archivada"
}
