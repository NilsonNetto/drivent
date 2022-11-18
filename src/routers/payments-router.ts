import { getPaymentByTicketId, postCreatePayment } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { createPaymentSchema, ticketIdParamsSchema } from "@/schemas/payments-schemas";
import { Router } from "express";

const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .post("/process", validateBody(createPaymentSchema), postCreatePayment)
  .get("/", validateParams(ticketIdParamsSchema), getPaymentByTicketId);

export { paymentsRouter };
