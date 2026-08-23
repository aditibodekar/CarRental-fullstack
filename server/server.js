import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";

import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import carRouter from "./routes/carRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";



const app = express();

// ✅ Connect DB
await connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads folder (ONLY ONCE)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ Health check
const clientPath = path.join(process.cwd(), "../client/dist");

app.use(express.static(clientPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// --------------------
// API Routes
// --------------------
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/cars", carRouter);
app.use("/api/owner", predictionRoutes);

// (Optional v2)
app.use("/api/v2/user", userRouter);
app.use("/api/v2/owner", ownerRouter);
app.use("/api/v2/bookings", bookingRouter);
app.use("/api/v2/cars", carRouter);

// ✅ Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
