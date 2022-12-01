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

async function findBookingById(bookingId: number) {
  return prisma.booking.findFirst({
    where: { id: bookingId }
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

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { roomId }
  });
}

const bookingRepository = {
  findBookingByUserId,
  findBookingById,
  findRoomById,
  countBookingsByRoomId,
  createNewBooking,
  updateBooking
};

export default bookingRepository;
