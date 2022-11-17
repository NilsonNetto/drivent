import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTicketsType(req: AuthenticatedRequest, res: Response) {
  try {
    return;
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getTicketsByUser(req: AuthenticatedRequest, res: Response) {
  try {
    return;
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postCreateTicket(req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId } = req.body;
  
  try {
    return;
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
