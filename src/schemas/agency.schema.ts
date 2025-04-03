import Joi from "joi";

export const agencySchema = Joi.object({
  nombre: Joi.string().required(),
  contrato: Joi.string().required(),
  direccion: Joi.string().required(),
  ciudad: Joi.string().required(),
  correo_encargado_sucursal: Joi.string().required(),
  correo: Joi.string().required()
});