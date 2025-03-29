import Joi from "joi";

export const clientSchema = Joi.object({
  nombre: Joi.string().required(),
  direccion: Joi.string().required(),
  telefono: Joi.string().required(),
  correo: Joi.string().required()
});