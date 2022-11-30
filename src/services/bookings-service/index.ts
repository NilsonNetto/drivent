import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import bookingRepository, { NewBooking } from "@/repositories/booking-repository";

async function getUserBooking(userId: number) {
  const userBooking = await bookingRepository.findBookingByUserId(userId);

  if(!userBooking) {
    throw notFoundError();
  }
  
  return userBooking;
}

async function postNewBooking(userId: number, roomId: number) {
  await verifyRoom(roomId);

  const newBookingData: NewBooking = {
    userId,
    roomId
  };

  const newBooking = await bookingRepository.createNewBooking(newBookingData);

  return newBooking;
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
  postNewBooking
};

export default bookingsService;
