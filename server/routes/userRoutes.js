import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { register, login, getUserData, getCars, getUserDocuments } from "../controllers/userController.js";  // ✅ Added getUserDocuments
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Define upload fields for register
const uploadFields = upload.fields([
  { name: "aadhar", maxCount: 1 },
  { name: "license", maxCount: 1 },
]);

// 📝 Register user (now supports document upload)
router.post("/register", uploadFields, register);

// 🔑 Login user
router.post("/login", login);

// 👤 Get logged-in user data (requires auth)
router.get("/me", authMiddleware, getUserData);

// 🚗 Get all available cars
router.get("/cars", getCars);

// 👤 Get user documents (requires auth)
router.get("/documents", authMiddleware, getUserDocuments);  // ✅ Now it will work

export default router;