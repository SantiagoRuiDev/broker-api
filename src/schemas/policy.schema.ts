import Joi from "joi";

export const policySchema = Joi.object({
  id: Joi.string().required(),
  policyNumber: Joi.string().required(),
  clientId: Joi.string().required(),
  insuranceCompanyId: Joi.string().required(),
  subagentId: Joi.string().required(),
  issueDate: Joi.date().required(),
  status: Joi.string().valid("vigente", "pendiente", "expirada").required(),
  totalAmount: Joi.number().required(),
  amountPaid: Joi.number().required(),
  signedByClient: Joi.boolean().required(),
  signedPolicy: Joi.boolean().required(),
  firstPaymentDone: Joi.boolean().required(),
  released: Joi.boolean().required(),
});