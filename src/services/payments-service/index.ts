import { notFoundError, unauthorizedError } from "@/errors";
import { PaymentData } from "@/protocols";
import enrollmentRepository from "@/repositories/enrollment-repository";
import paymentsRepository, { NewPayment } from "@/repositories/payments-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { Ticket } from "@prisma/client";

async function postPayment(userId: number, paymentData: PaymentData) {
  const ticket = await verifyTicket(paymentData.ticketId);

  await verifyUserTicket(userId, ticket);

  const ticketType = await ticketsRepository.findTicketsTypeByTypeId(ticket.ticketTypeId);

  const newPayment: NewPayment = {
    ticketId: paymentData.ticketId,
    value: ticketType.price,
    cardIssuer: paymentData.cardData.issuer,
    cardLastDigits: paymentData.cardData.number.toString().slice(-4),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const insertedPayment = await paymentsRepository.createPayment(newPayment);

  if(!insertedPayment) {
    return;
  }

  await ticketsRepository.updateTicketStatusById(ticket.id);

  return insertedPayment;
}

async function getPayment(userId: number, ticketId: number) {
  const ticket = await verifyTicket(ticketId);

  await verifyUserTicket(userId, ticket);

  const paymentData = await paymentsRepository.findPaymentByTicketId(ticketId);

  return paymentData;
}

async function verifyTicket(ticketId: number) {
  const ticket = await ticketsRepository.findTicketById(ticketId);

  if(!ticket) {
    throw notFoundError();
  }

  return ticket;
}

async function verifyUserTicket(userId: number, ticket: Ticket) {
  const enrollment = await enrollmentRepository.findEnrollmentByUserId(userId);

  if(ticket.enrollmentId !== enrollment.id) {
    throw unauthorizedError();
  }  
}

const paymentsService = {
  postPayment,
  getPayment
};

export default paymentsService;
