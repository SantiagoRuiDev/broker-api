export interface IFinished {
  numero_liquidacion: string;
  kanban: KanbanStates;
  fecha_liquidacion: string;
  total_liquidado: number;
  prestamo: number;
  iva: number;
  ret_iva: number;
  ret_renta: number;
  gastos_adm: number;
  tarifa_comision: number;
}

export enum KanbanStates {
  EMITIDO = "Emitida",
  LISTA = "Lista",
  ENVIADA = "Enviada",
  PAGADA = "Pagada",
}
