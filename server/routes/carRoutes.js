import express from "express";
import { 
  addCar, 
  getAllCars, 
  getCarById, 
  getTrendingCars, 
  getUserRecommendedCars 
} from "../controllers/carController.js";
import { authMiddleware, ownerMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

// ✅ Add car
router.post(
  "/add",
  authMiddleware,
  ownerMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "insurance", maxCount: 1 },
  ]),
  addCar
);

// 🔥 IMPORTANT: NO /cars HERE
router.get("/trending", getTrendingCars);
router.get("/recommended", authMiddleware, getUserRecommendedCars);

// ✅ Normal routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

export default router;