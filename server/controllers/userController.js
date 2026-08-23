import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Car from "../models/Car.js"; // keep if needed for fetching cars
import {
  extractTextFromImage,
  extractAadhaarNumber,
  isValidAadhaarText,
  detectFakeDocument
} from "../utils/ocr.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Register User (with document uploads, insurance removed)

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || password.length < 8) {
      return res.json({
        success: false,
        message: "Fill all fields (password must be 8+ characters)",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Email already exists" });
    }

    // ✅ File validation
    if (!req.files?.aadhar || !req.files?.license) {
      return res.json({
        success: false,
        message: "Aadhaar and Driving License are required.",
      });
    }

    const aadharFile = req.files.aadhar[0];
    const licenseFile = req.files.license[0];

    // ✅ MIME type check
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (
      !allowedTypes.includes(aadharFile.mimetype) ||
      !allowedTypes.includes(licenseFile.mimetype)
    ) {
      return res.json({
        success: false,
        message: "Invalid file type (only JPG, PNG, PDF allowed)",
      });
    }

    // =========================
    // 🔍 AADHAAR OCR VALIDATION
    // =========================
    const aadharText = await extractTextFromImage(aadharFile.path);

    const aadhaarNumber = extractAadhaarNumber(aadharText);
    const isValidAadharText = isValidAadhaarText(aadharText);
    const isFakeAadhar = !detectFakeDocument(aadharText);

    console.log("AADHAAR TEXT:", aadharText);

    if (!aadhaarNumber || !isValidAadharText || isFakeAadhar) {
      return res.json({
        success: false,
        message: "Invalid or fake Aadhaar document and Driving License",
      });
    }

    // =========================
    // 🪪 LICENSE OCR VALIDATION
    // =========================
    const licenseText = await extractTextFromImage(licenseFile.path);

    // Basic license checks
    const isLicenseValid =
      licenseText.toLowerCase().includes("driving") ||
      licenseText.toLowerCase().includes("licence") ||
      licenseText.toLowerCase().includes("license");

    const hasLicenseNumber = /[A-Z]{2}\d{2}\s?\d{11}/.test(licenseText); 
    // Example: MH12 12345678901

    console.log("LICENSE TEXT:", licenseText);

    if (!isLicenseValid || !hasLicenseNumber) {
      return res.json({
        success: false,
        message: "Invalid or fake Driving License",
      });
    }

    // 🔐 Hash password
    const hashed = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = new User({
      name,
      email,
      password: hashed,
      role: role || "user",
      aadhar: aadharFile.path,
      license: licenseFile.path,
    });

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: "Registration successful!",
      token,
      aadhaarNumber,
      role: user.role,
    });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
};
// ✅ Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ✅ Get User Data (for JWT-authenticated users)
export const getUserData = async (req, res) => {
  try {
    const { user } = req; // comes from middleware
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get Available Cars (optional, same as before)
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find({ isAvailable: true });
    res.json({ success: true, cars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ... (existing code)

// ✅ Get user documents (for frontend display)
export const getUserDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("aadhar license role");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const baseURL = `${req.protocol}://${req.get("host")}`;

    res.json({
      success: true,
      documents: {
        aadhar: user.aadhar ? `${baseURL}/${user.aadhar}` : null,
        license: user.license ? `${baseURL}/${user.license}` : null,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

