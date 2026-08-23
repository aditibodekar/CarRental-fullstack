import express from "express";
import {
  checkAvailabilityOfCar,
  createBooking,
  getUserBookings,
  getOwnerBookings,
  changeBookingStatus,
  getCarBookings // ✅ ADD THIS
} from "../controllers/bookingController.js";

import { authMiddleware } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityOfCar);
bookingRouter.post("/create", authMiddleware, createBooking);

bookingRouter.get("/user", authMiddleware, getUserBookings);
bookingRouter.get("/owner", authMiddleware, getOwnerBookings);

// ✅ NEW ROUTE
bookingRouter.get("/car/:carId", getCarBookings);

bookingRouter.post("/change-status", authMiddleware, changeBookingStatus);

export default bookingRouter;