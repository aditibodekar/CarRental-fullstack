import Booking from "../models/Booking.js";
import Car from "../models/Car.js";

// ✅ Utility: Calculate number of days (inclusive)
const calculateDays = (pickupDate, returnDate) => {
  const start = new Date(pickupDate);
  const end = new Date(returnDate);

  // Normalize time → avoids timezone bugs
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Difference in days + inclusive fix
  const diffTime = end - start;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return days;
};

// ✅ Check if a car is available for a given date range
export const checkAvailabilityOfCar = async (req, res) => {
  try {
    const { carId, pickupDate, returnDate } = req.body;

    const bookings = await Booking.find({ car: carId });

    const isAvailable = !bookings.some(b => {
      const bookedFrom = new Date(b.pickupDate);
      const bookedTo = new Date(b.returnDate);
      const requestedFrom = new Date(pickupDate);
      const requestedTo = new Date(returnDate);

      return (requestedFrom <= bookedTo && requestedTo >= bookedFrom);
    });

    res.json({ success: true, isAvailable });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ Create a new booking (CORRECT DATE-BASED PRICING)
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate, pickupLocation, dropLocation } = req.body;

    if (!pickupLocation || !dropLocation) {
      return res.json({
        success: false,
        message: "Pickup and drop locations are required"
      });
    }

    // 🔍 Check availability
    const bookings = await Booking.find({ car });

    const isAvailable = !bookings.some(b => {
      const bookedFrom = new Date(b.pickupDate);
      const bookedTo = new Date(b.returnDate);
      const requestedFrom = new Date(pickupDate);
      const requestedTo = new Date(returnDate);

      return (requestedFrom <= bookedTo && requestedTo >= bookedFrom);
    });

    if (!isAvailable) {
      return res.json({ success: false, message: "Car is not available" });
    }

    // 🚗 Get car data
    const carData = await Car.findById(car);
    if (!carData) {
      return res.json({ success: false, message: "Car not found" });
    }

    // ✅ CORRECT DAY CALCULATION
    const noOfDays = calculateDays(pickupDate, returnDate);

    // ✅ FINAL PRICE
    const price = carData.pricePerDay * noOfDays;

    // 🧾 Save booking
    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      pickupLocation,
      dropLocation,
      price,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Booking Created",
      noOfDays,
      price
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ Get all bookings of logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("car")
      .then(data => data.filter(b => b.car !== null));

    res.json({ success: true, bookings });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ Get all bookings for cars owned by the logged-in owner
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car");

    res.json({ success: true, bookings });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ Change status of a booking (owner only)
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.owner.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({ success: true, message: "Booking status updated" });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ GET booked dates for a car
export const getCarBookings = async (req, res) => {
  try {
    const { carId } = req.params;

    const bookings = await Booking.find({ car: carId });

    res.json({
      success: true,
      bookings,
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};