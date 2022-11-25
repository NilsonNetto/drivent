import { notFoundError, unauthorizedError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import { paymentRequiredError } from "@/errors/payment-required-error";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import paymentsRepository from "@/repositories/payments-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { Ticket, TicketType } from "@prisma/client";

async function getAllHotels(userId: number) {
  const enrollment = await verifyEnrollment(userId);

  const ticket = await verifyTicket(enrollment.id);

  await verifyPayment(ticket.id);

  verifyTicketType(ticket);

  const allHotels = await hotelRepository.findAllHotels();

  return allHotels;
}

async function getRoomsByHotelId(userId: number, hotelId: number) {
  const enrollment = await verifyEnrollment(userId);

  const ticket = await verifyTicket(enrollment.id);

  await verifyPayment(ticket.id);

  verifyTicketType(ticket);

  const hotelRooms = await hotelRepository.findRoomsByHotelId(hotelId);

  if(!hotelRooms) {
    throw notFoundError();
  }

  return hotelRooms;
}

async function verifyEnrollment(userId: number) {
  const enrollment = await enrollmentRepository.findEnrollmentByUserId(userId);

  if(!enrollment) {
    throw notFoundError();
  }

  return enrollment;
}

async function verifyTicket(enrollmentId: number) {
  const ticket = await ticketsRepository.findUserTicket(enrollmentId);

  if(!ticket) {
    throw unauthorizedError();
  }

  return ticket;
}

async function verifyPayment(ticketId: number) {
  const payment = await paymentsRepository.findPaymentByTicketId(ticketId);

  if(!payment) {
    throw paymentRequiredError();
  }

  return payment;
}

function verifyTicketType(ticket: TicketResponse) {
  if(ticket.TicketType.isRemote) {
    throw forbiddenError();
  }

  if(!ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
}

export type TicketResponse = Ticket & {TicketType: TicketType}

const hotelsService = {
  getAllHotels,
  getRoomsByHotelId
};

export default hotelsService;
