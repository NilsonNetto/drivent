import { getTicketsType, getTicketsByUser, postCreateTicket } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketsType )
  .get("/", getTicketsByUser)
  .post("/", postCreateTicket);

export { ticketsRouter };
