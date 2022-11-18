import Joi from "joi";

export const createPaymentSchema = Joi.object({
  ticketId: Joi.number().integer().positive().required(),
  cardData: Joi.object({
    issuer: Joi.string().required(),
    number: Joi.number().integer().positive().required(),
    name: Joi.string().min(3).required(),
    expirationDate: Joi.date().greater("now").required(),
    cvv: Joi.number().integer().positive().required()
  }) 

});

export const ticketIdParamsSchema = Joi.object({
  ticketId: Joi.number().integer().positive().required()
});
