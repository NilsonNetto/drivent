import { prisma } from "@/config";
import { TicketType, Ticket } from "@prisma/client";

async function findTicketsTypes() {
  return prisma.ticketType.findMany();
}

async function findTicketsTypeByTypeId(id: number) {
  return prisma.ticketType.findFirst({
    where: { id }
  });
}

async function findUserTicket(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: { enrollmentId }
  });
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
  return prisma.ticket.create({
    data: {
      "ticketTypeId": ticketTypeId,
      "enrollmentId": enrollmentId,
      "status": "RESERVED"
    }
  });
}

const ticketsRepository = {
  findTicketsTypes,
  findTicketsTypeByTypeId,
  findUserTicket,
  createTicket
};

export default ticketsRepository;
