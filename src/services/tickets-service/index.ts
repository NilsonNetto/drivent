import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository, { NewTicket } from "@/repositories/tickets-repository";

async function getAllTicketsTypes() {
  const allTicketsTypes = await ticketsRepository.findTicketsTypes();

  return allTicketsTypes;
}

async function getTicketsFromUser(userId: number) {
  const enrollmentId = await enrollmentRepository.findWithAddressByUserId(userId);

  const userTicket = await ticketsRepository.findUserTicket(enrollmentId.id);

  if(!userTicket) {
    throw notFoundError();
  }

  const ticketType = await ticketsRepository.findTicketsTypeByTypeId(userTicket.ticketTypeId);

  return { ...userTicket, TicketType: ticketType };
}

async function postTicket(userId: number, ticketTypeId: number) {
  const enrollment = await enrollmentRepository.findEnrollmentByUserId(userId);

  const insertedTicket = await ticketsRepository.createTicket(enrollment.id, ticketTypeId);

  if(!insertedTicket) {
    throw notFoundError();
  }

  const ticketType = await ticketsRepository.findTicketsTypeByTypeId(insertedTicket.ticketTypeId);

  return { ...insertedTicket, TicketType: ticketType };
}

const ticketsService = {
  getAllTicketsTypes,
  getTicketsFromUser,
  postTicket
};

export default ticketsService;
