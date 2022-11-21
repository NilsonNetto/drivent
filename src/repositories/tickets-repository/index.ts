import { prisma } from "@/config";
import { Ticket, TicketStatus } from "@prisma/client";

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

async function findTicketById(id: number) {
  return prisma.ticket.findFirst({
    where: { id }
  });
}

async function createTicket(enrollmentId: number, ticketTypeId: number) {
  return prisma.ticket.create({
    data: {
      "ticketTypeId": ticketTypeId,
      "enrollmentId": enrollmentId,
      "status": TicketStatus.RESERVED
    }
  });
}

async function updateTicketStatusById(ticketId: number) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { 
      status: TicketStatus.PAID,
      updatedAt: new Date()
    }
  });
}

export type NewTicket = Partial<Ticket>
export type InsertTicket = Pick<Ticket, "ticketTypeId" | "enrollmentId">  

const ticketsRepository = {
  findTicketsTypes,
  findTicketsTypeByTypeId,
  findUserTicket,
  findTicketById,
  updateTicketStatusById,
  createTicket
};

export default ticketsRepository;
