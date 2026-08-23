import axios from "axios";

export const getPrediction = async (req, res) => {
  try {
    const { data } = await axios.get("http://127.0.0.1:8000/predict");

    res.json({
      success: true,
      predictions: data.predictions   // ✅ FIXED
    });

  } catch (err) {
    res.json({
      success: false,
      message: err.message
    });
  }
};