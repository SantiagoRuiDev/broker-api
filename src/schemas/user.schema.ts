import Joi from "joi";

export const userSchema = Joi.object({
  nombre: Joi.string().required(),
  correo: Joi.string().required(),
  telefono: Joi.string().required(),
  direccion: Joi.string().required(),
  password: Joi.string().min(4).required(),
});


export const authSchema = Joi.object({
  correo: Joi.string().required(),
  password: Joi.string().min(4).required(),
});