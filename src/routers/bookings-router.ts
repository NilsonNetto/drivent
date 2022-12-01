import { getUserBooking, postNewBooking, putBooking } from "@/controllers";
import { authenticateToken, validateBody, validateParams } from "@/middlewares";
import { bookingIdSchema, roomIdSchema } from "@/schemas";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", validateBody(roomIdSchema), postNewBooking)
  .put("/:bookingId/", validateParams(bookingIdSchema), validateBody(roomIdSchema), putBooking );

export { bookingRouter };
