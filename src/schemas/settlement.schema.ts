import Joi from "joi";

export const settlementSchema = Joi.object({
  id: Joi.string().optional(),
  tipo: Joi.string()
    .valid(
      "Pre Liquidacion",
      "Negocio Pendiente",
      "Negocio Liberado",
      "Consolidado"
    )
    .required(),
  estado: Joi.string()
    .valid("Emitido", "Enviado", "Listo", "Pagado")
    .required(),
  empresa: Joi.string().optional(),
  ciudad: Joi.string().optional(),
  factura: Joi.number().optional(),
  documento: Joi.number().optional(),
  orden: Joi.string().optional(),
  fecha_vence: Joi.date().optional(),
  fecha_inicio: Joi.number().optional(),
  poliza: Joi.string().optional(),
  anexo: Joi.string().optional(),
  endoso: Joi.string().optional(),
  codigo: Joi.number().optional(),
  S: Joi.date().optional(),
  valor_prima: Joi.number().optional(),
  comision: Joi.number().optional(),
  F: Joi.string().optional(),
  L: Joi.string().optional(),
  P: Joi.string().optional(),
  ori: Joi.string().optional(),
  sAge: Joi.string().optional(),
  fecha_facturacion: Joi.date().optional(),
  facturado: Joi.string().valid("Si", "No").optional(),
  cobrado: Joi.string().valid("Si", "No").optional(),
  fecha_cobrado: Joi.date().optional(),
  pagado: Joi.string().valid("Si", "No").optional(),
  fecha_liquidacion: Joi.date().optional(),
  por_enviar: Joi.string().valid("Si", "No").optional(),
  clientId: Joi.string().optional(),
  subagenteId: Joi.string().optional(),
  aseguradoraId: Joi.string().optional(),
});
