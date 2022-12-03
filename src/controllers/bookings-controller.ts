import { AuthenticatedRequest } from "@/middlewares";
import bookingsService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  
  try {
    const userBooking = await bookingsService.getUserBooking(userId);

    return res.status(httpStatus.OK).send(userBooking);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}

export async function postNewBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = Number(req.body.roomId);

  try {
    const newBooking = await bookingsService.postNewBooking(userId, roomId);

    return res.status(httpStatus.OK).send(newBooking);
  } catch (error) {
    if(error.name === "ForbiddenError") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    return res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const roomId = Number(req.body.roomId);

  try {
    const updatedBooking = await bookingsService.updateBooking(userId, bookingId, roomId);

    return res.status(httpStatus.OK).send(updatedBooking);
  } catch (error) {
    if(error.name === "ForbiddenError") {
      return res.status(httpStatus.FORBIDDEN).send(error.message);
    }
    return res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}
