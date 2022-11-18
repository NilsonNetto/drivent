import { AuthenticatedRequest } from "@/middlewares";
import paymentsService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function postCreatePayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const paymentData = req.body;
  
  try {
    const paymentResponse = await paymentsService.postPayment(userId, paymentData);

    return res.status(httpStatus.OK).send(paymentResponse);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId }  = req;
    const ticketId = Number(req.params.ticketId);

    const payment = await paymentsService.getPayment(userId, ticketId);
    
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
