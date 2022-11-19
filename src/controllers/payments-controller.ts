import { AuthenticatedRequest } from "@/middlewares";
import { PaymentData } from "@/protocols";
import paymentsService from "@/services/payments-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function postCreatePayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const paymentData = req.body as PaymentData;
  
  try {
    const paymentResponse = await paymentsService.postPayment(userId, paymentData);

    return res.status(httpStatus.OK).send(paymentResponse);
  } catch (error) {
    if(error.name === "UnauthorizedError") {
      return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId }  = req;
    const ticketId = Number(req.query.ticketId);

    const payment = await paymentsService.getPayment(userId, ticketId);
    
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if(error.name === "UnauthorizedError") {
      return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}
