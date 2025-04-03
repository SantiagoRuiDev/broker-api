import Joi from "joi";

export const userSchema = Joi.object({
  nombre: Joi.string().required(),
  correo: Joi.string().required(),
  rol: Joi.string().required(),
  password: Joi.string().min(4).required(),
});


export const authSchema = Joi.object({
  correo: Joi.string().required(),
  password: Joi.string().min(4).required(),
});


export const passwordSchema = Joi.object({
  old_password: Joi.string().min(4).required(),
  new_password: Joi.string().min(4).required(),
  repeat_password: Joi.string().min(4).required(),
});