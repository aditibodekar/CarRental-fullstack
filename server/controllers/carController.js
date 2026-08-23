import Car from "../models/Car.js";
import {
  extractTextFromImage,
  detectFakeDocument,
  isCarImage,
  isInsuranceDocument
} from "../utils/ocr.js";
import {
  isRealCarImage,
  extractInsuranceText,
  isValidInsurance,
  isFakeInsurance
} from "../utils/googleVision.js";
import Booking from "../models/Booking.js"; // 🔥 add this at top

import { upload } from "../middleware/multer.js"

// ============================
// ✅ GET ALL AVAILABLE CARS
// ============================

export const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();

    const carsWithAvailability = await Promise.all(
      cars.map(async (car) => {
        const bookings = await Booking.find({ car: car._id });

        const now = new Date();

        const isAvailable = !bookings.some(b => {
          const from = new Date(b.pickupDate);
          const to = new Date(b.returnDate);
          return now >= from && now <= to;
        });

        return { ...car._doc, isAvailable };
      })
    );

    res.json({ success: true, cars: carsWithAvailability });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getTrendingCars = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: "$car",
          totalBookings: { $sum: 1 }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 6 }
    ]);

    let cars = [];

    if (bookings.length > 0) {
      const carIds = bookings.map(b => b._id);
      cars = await Car.find({ _id: { $in: carIds } });
    } else {
      // 🔥 FALLBACK (VERY IMPORTANT)
      cars = await Car.find().limit(6);
    }

    res.json({
      success: true,
      cars
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getUserRecommendedCars = async (req, res) => {
  try {
    const userId = req.user._id;

    // 🔥 Get user bookings
    const userBookings = await Booking.find({ user: userId });

    if (userBookings.length === 0) {
      return res.json({ success: true, cars: [] });
    }

    // 🔥 Get booked car IDs
    const carIds = userBookings.map(b => b.car);

    const bookedCars = await Car.find({ _id: { $in: carIds } });

    // ✅ Extract preferences
    const categories = bookedCars.map(c => c.category);
    const avgPrice =
      bookedCars.reduce((acc, c) => acc + c.pricePerDay, 0) /
      bookedCars.length;

    // 🔥 Smart recommendation
    const recommendedCars = await Car.find({
      category: { $in: categories },
      pricePerDay: { $gte: avgPrice * 0.7, $lte: avgPrice * 1.3 },
      _id: { $nin: carIds } // avoid already booked cars
    }).limit(6);

    res.json({
      success: true,
      cars: recommendedCars
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
// ============================
// ✅ GET SINGLE CAR
// ============================

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);
    if (!car) {
      return res.json({ success: false, message: "Car not found" });
    }

    const bookings = await Booking.find({ car: car._id });

    const { pickupDate, returnDate } = req.query;

let isAvailable = true;

if (pickupDate && returnDate) {
  const requestedFrom = new Date(pickupDate);
  const requestedTo = new Date(returnDate);

  isAvailable = !bookings.some(b => {
    const bookedFrom = new Date(b.pickupDate);
    const bookedTo = new Date(b.returnDate);

    return (requestedFrom <= bookedTo && requestedTo >= bookedFrom);
  });
}


    res.json({ 
      success: true, 
      car: { ...car._doc, isAvailable } 
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ============================
// ✅ ADD CAR (WITH VALIDATION)
// ============================
export const addCar = async (req, res) => {
  try {

    // ✅ GET FILES
    const image = req.files?.image?.[0];
    const insurance = req.files?.insurance?.[0];

    if (!image) {
      return res.json({ success: false, message: "Car image is required" });
    }

    if (!insurance) {
      return res.json({ success: false, message: "Insurance document is required" });
    }

    // ✅ FILE TYPE VALIDATION
    const allowedImageTypes = ["image/jpeg", "image/png"];
    const allowedDocs = ["image/jpeg", "image/png", "application/pdf"];

    if (!allowedImageTypes.includes(image.mimetype)) {
      return res.json({ success: false, message: "Only JPG/PNG car images allowed" });
    }

    if (!allowedDocs.includes(insurance.mimetype)) {
      return res.json({ success: false, message: "Insurance must be JPG, PNG or PDF" });
    }

    // ============================
    // 🧠 AI CAR VALIDATION
    // ============================
    const isCar = await isRealCarImage(image.path);

    if (!isCar) {
      return res.json({
        success: false,
        message: "Only car images are allowed",
      });
    }

    // ============================
    // 📄 INSURANCE VALIDATION
    // ============================
    const insuranceText = await extractInsuranceText(insurance.path);

    console.log("Insurance Text:", insuranceText);

    if (!isValidInsurance(insuranceText)) {
      return res.json({
        success: false,
        message: "Invalid insurance document",
      });
    }

    if (isFakeInsurance(insuranceText)) {
      return res.json({
        success: false,
        message: "Fake insurance detected",
      });
    }

    // ============================
    // ✅ PARSE DATA
    // ============================
    const carData = JSON.parse(req.body.carData);

    const {
      brand,
      model,
      pricePerDay,
      category,
      year,
      transmission,
      fuel_type,
      seating_capacity,
      location,
      description
    } = carData;

    if (!brand || !model || !pricePerDay || !category) {
      return res.json({
        success: false,
        message: "All fields are required",
      });
    }

    // ============================
    // ✅ SAVE
    // ============================
    const car = new Car({
      brand,
      model,
      pricePerDay,
      category,
      year,
      transmission,
      fuel_type,
      seating_capacity,
      location,
      description,
      image: image.path,
      insuranceDocument: insurance.path,
      isAvailable: true,
    });

    await car.save();

    res.json({
      success: true,
      message: "Car added successfully",
      car,
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};