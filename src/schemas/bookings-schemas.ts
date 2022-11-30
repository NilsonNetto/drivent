import Joi from "joi";

export const createBookingSchema = Joi.object<{roomId: number}>({
  roomId: Joi.number().integer().positive().required()
});
