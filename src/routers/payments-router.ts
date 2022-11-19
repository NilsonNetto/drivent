import { getPaymentByTicketId, postCreatePayment } from "@/controllers";
import { authenticateToken, validateBody, validateQuery } from "@/middlewares";
import { createPaymentSchema, ticketIdQuerySchema } from "@/schemas/payments-schemas";
import { Router } from "express";

const paymentsRouter = Router();

paymentsRouter
  .all("/*", authenticateToken)
  .post("/process", validateBody(createPaymentSchema), postCreatePayment)
  .get("/", validateQuery(ticketIdQuerySchema), getPaymentByTicketId);

export { paymentsRouter };
