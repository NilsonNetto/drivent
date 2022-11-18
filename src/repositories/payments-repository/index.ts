import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function createOrUpdatePayment(newPayment: NewPayment) {
  return prisma.payment.create({
    data: newPayment
  });
}

export type NewPayment = Omit<Payment, "id" | "createdAt" | "updatedAt">;

async function findPaymentByTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId
    }
  });
}

const paymentsRepository = {
  createOrUpdatePayment,
  findPaymentByTicketId
};

export default paymentsRepository;
