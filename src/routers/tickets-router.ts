import { getTicketsType, getTicketsByUser, postCreateTicket } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { createTicketSchema } from "@/schemas/tickets-schemas";
import { Router } from "express";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketsType )
  .get("/", getTicketsByUser)
  .post("/", validateBody(createTicketSchema), postCreateTicket);

export { ticketsRouter };
