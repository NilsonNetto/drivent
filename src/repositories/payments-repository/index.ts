import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function createPayment(newPayment: NewPayment) {
  return prisma.payment.create({
    data: newPayment
  });
}

export type NewPayment = Omit<Payment, "id">;

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: { ticketId }
  });
}

const paymentsRepository = {
  createPayment,
  findPaymentByTicketId
};

export default paymentsRepository;
