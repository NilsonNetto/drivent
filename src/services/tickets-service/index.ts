import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/tickets-repository";

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
  const enrollmentId = await enrollmentRepository.findWithAddressByUserId(userId);

  const newTicket = await ticketsRepository.createTicket(enrollmentId.id, ticketTypeId);

  if(!newTicket) {
    throw notFoundError();
  }

  const ticketType = await ticketsRepository.findTicketsTypeByTypeId(newTicket.ticketTypeId);

  return { ...newTicket, TicketType: ticketType };
}

const ticketsService = {
  getAllTicketsTypes,
  getTicketsFromUser,
  postTicket
};

export default ticketsService;
