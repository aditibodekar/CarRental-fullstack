import express from "express";
import { getPrediction } from "../controllers/predictionController.js";

const router = express.Router();

router.get("/prediction", async (req, res) => {
  res.json({
    success: true,
    predictions: [
      {
        car: "Test Car",
        prediction: [1800, 1900, 2000, 2100, 2200, 2300, 2400]
      }
    ]
  });
});

export default router;