import { notFoundError } from "@/errors";
import { PaymentData } from "@/protocols";
import enrollmentRepository from "@/repositories/enrollment-repository";
import paymentsRepository, { NewPayment } from "@/repositories/payments-repository";
import ticketsRepository from "@/repositories/tickets-repository";

async function postPayment(userId: number, paymentData: PaymentData) {
  const enrollmentId = await enrollmentRepository.findWithAddressByUserId(userId);

  const userTicket = await ticketsRepository.findUserTicket(enrollmentId.id);

  if(!userTicket) {
    throw notFoundError();
  }

  const ticketType = await ticketsRepository.findTicketsTypeByTypeId(userTicket.ticketTypeId);

  const newPayment: NewPayment = {
    ticketId: paymentData.ticketId,
    value: ticketType.price,
    cardIssuer: paymentData.cardData.issuer,
    cardLastDigits: paymentData.cardData.number.toString().slice(-4)
  };

  const insertedPayment = await paymentsRepository.createOrUpdatePayment(newPayment);

  if(!insertedPayment) {
    throw notFoundError();
  }

  return insertedPayment;
}

async function getPayment(userId: number, ticketId: number) {
  const paymentData = await paymentsRepository.findPaymentByTicketId(ticketId);

  if(!paymentData) { //aqui é se não tiver o pagamento do ticketId
    throw notFoundError();
  }

  const enrollmentId = await enrollmentRepository.findWithAddressByUserId(userId);

  const userTicket = await ticketsRepository.findUserTicket(enrollmentId.id);

  if(userTicket.id !== paymentData.ticketId) { //aqui é se o ticketId
    throw notFoundError();
  }

  return paymentData;
}

const paymentsService = {
  postPayment,
  getPayment
};

export default paymentsService;
