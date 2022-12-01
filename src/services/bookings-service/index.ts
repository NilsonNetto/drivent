import { notFoundError, forbiddenError } from "@/errors";
import bookingRepository, { NewBooking } from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { TicketStatus } from "@prisma/client";

async function getUserBooking(userId: number) {
  const userBooking = await bookingRepository.findBookingByUserId(userId);

  if(!userBooking) {
    throw notFoundError();
  }
  
  return userBooking;
}

async function postNewBooking(userId: number, roomId: number) {
  await verifyTicket(userId);
  
  await verifyRoom(roomId);

  const verifyUserBooking = await bookingRepository.findBookingByUserId(userId);

  if(verifyUserBooking) {
    throw forbiddenError();
  }

  const newBookingData: NewBooking = {
    userId,
    roomId
  };

  const newBooking = await bookingRepository.createNewBooking(newBookingData);

  return newBooking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.findBookingById(bookingId);

  if(!booking) {
    throw notFoundError();
  }

  if(userId !== booking.userId || roomId === booking.roomId) {
    throw forbiddenError();
  }

  await verifyRoom(roomId);

  const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId);

  return updatedBooking;
}

async function verifyTicket(userId: number) {
  const enrollment = await enrollmentRepository.findEnrollmentByUserId(userId);

  if(!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketsRepository.findUserTicket(enrollment.id);

  if(!ticket) {
    throw forbiddenError();
  }

  if(ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }

  if(ticket.status !== TicketStatus.PAID) {
    throw forbiddenError();
  }
}

async function verifyRoom(roomId: number) {
  const room = await bookingRepository.findRoomById(roomId);

  if(!room) {
    throw notFoundError();
  }

  const bookingsOnRoom = await bookingRepository.countBookingsByRoomId(roomId);

  if( bookingsOnRoom >= room.capacity) {
    throw forbiddenError();
  }
}

const bookingsService = {
  getUserBooking,
  postNewBooking,
  updateBooking
};

export default bookingsService;
