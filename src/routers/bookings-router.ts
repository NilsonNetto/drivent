import { getUserBooking, postNewBooking } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { createBookingSchema } from "@/schemas";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", validateBody(createBookingSchema), postNewBooking)
  .put("/:bookingId/", );

export { bookingRouter };
