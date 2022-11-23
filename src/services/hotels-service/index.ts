import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

async function getAllHotels() {
  const allHotels = await hotelRepository.findAllHotels();

  return allHotels;
}

async function getRoomsByHotelId(hotelId: number) {
  const hotelRooms = await hotelRepository.findRoomsByHotelId( hotelId );

  if(!hotelRooms) {
    throw notFoundError();
  }

  return hotelRooms;
}

const hotelsService = {
  getAllHotels,
  getRoomsByHotelId
};

export default hotelsService;
