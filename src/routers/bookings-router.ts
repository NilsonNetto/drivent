import { getUserBooking } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { createPaymentSchema } from "@/schemas/payments-schemas";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking )
  .post("/", validateBody(createPaymentSchema), )
  .put("/:bookingId/", );

export { bookingRouter };
