import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = await hotelsService.getAllHotels();

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getRoomsByHotelId(req: AuthenticatedRequest, res: Response) {
  const hotelId = Number(req.params.hotelId);

  if(!hotelId || isNaN(hotelId)) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const rooms = await hotelsService.getRoomsByHotelId(hotelId);

    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
