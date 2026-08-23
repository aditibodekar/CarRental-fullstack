import express from "express";
import { authMiddleware, ownerMiddleware } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  addCar,
  getDashboardData,
  getOwnerCars,
  toggleCarAvailability,
  deleteCar,
  updateUserImage
} from "../controllers/ownerController.js";

const router = express.Router();

// Owner dashboard (owners only)
router.get("/dashboard", authMiddleware, ownerMiddleware, getDashboardData);

// Owner's cars
router.get("/cars", authMiddleware, ownerMiddleware, getOwnerCars);

// ✅ Add a new car — now supports both car image and insurance upload
router.post(
  "/add-car",
  authMiddleware,
  ownerMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
  ]),
  addCar
);

// Toggle car availability
router.post("/toggle-car", authMiddleware, ownerMiddleware, toggleCarAvailability);

// Delete a car
router.post("/delete-car", authMiddleware, ownerMiddleware, deleteCar);

// Update user image
router.post("/update-image", authMiddleware, ownerMiddleware, upload.single("image"), updateUserImage);


export default router;
