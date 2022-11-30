import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    include: {
      Room: true
    }
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId }
  });
}

async function countBookingsByRoomId(roomId: number) {
  return prisma.booking.count({
    where: { roomId }
  });
}

async function createNewBooking(newBookingData: NewBooking ) {
  return prisma.booking.create({
    data: {
      ...newBookingData
    }
  });
}

export type NewBooking = Pick<Booking, "userId" | "roomId">

const bookingRepository = {
  findBookingByUserId,
  findRoomById,
  countBookingsByRoomId,
  createNewBooking
};

export default bookingRepository;
