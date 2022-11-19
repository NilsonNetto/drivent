import Joi from "joi";

export const createPaymentSchema = Joi.object({
  ticketId: Joi.number().integer().positive().required(),
  cardData: Joi.object({
    issuer: Joi.string().required(),
    number: Joi.string().min(15).max(16).required(),
    name: Joi.string().required(),
    expirationDate: Joi.string(),
    cvv: Joi.string().length(3).required()
  }) 

});

export const ticketIdQuerySchema = Joi.object({
  ticketId: Joi.number().integer().positive().required()
});
