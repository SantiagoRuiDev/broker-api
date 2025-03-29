import { Schema } from "joi";

export const validateSchemas = (InputBuffer: any, Schema: Schema): any => {
  const { error } = Schema.validate(InputBuffer, {
    errors: { wrap: { label: false } }, // Evita mostrar índices en errores de arrays
    messages: {
      "string.base": "El campo {{#label}} debe ser de tipo texto",
      "string.empty": "El campo {{#label}} no puede estar vacio",
      "string.min":
        "El campo {{#label}} debe ser de al menos {{#limit}} caracteres",
      "number.min": "El campo {{#label}} debe ser mayor o igual que {{#limit}}",
      "string.email": "Ingresa un email valido",
      "string.pattern.base":
        "Tu contraseña debe contener al menos una mayuscula",
      "any.required": "{{#label}} es un campo requerido",
    },
  });
  if (error) {
    // Eliminar índices de los errores en arrays
    const cleanMessage = error.details[0].message.replace(/\[\d+\]\./, "");

    throw new Error(cleanMessage);
  }
};
