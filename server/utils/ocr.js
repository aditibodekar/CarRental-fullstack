import Tesseract from "tesseract.js";

// 🔍 Extract text
export const extractTextFromImage = async (filePath) => {
  const {
    data: { text },
  } = await Tesseract.recognize(filePath, "eng");

  return text;
};

// 🔢 Extract Aadhaar number
export const extractAadhaarNumber = (text) => {
  const regex = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
  const match = text.match(regex);
  return match ? match[0].replace(/\s/g, "") : null;
};

// ✅ Validate Aadhaar keywords
export const isValidAadhaarText = (text) => {
  const lower = text.toLowerCase();

  return (
    lower.includes("government of india") ||
    lower.includes("aadhaar") ||
    lower.includes("unique identification authority")
  );
};


// 🤖 ✅ ADD THIS HERE (bottom of file)
export const detectFakeDocument = (text) => {
  let score = 0;

  if (text.toLowerCase().includes("government of india")) score++;
  if (text.toLowerCase().includes("aadhaar")) score++;
  if (/\d{4}\s?\d{4}\s?\d{4}/.test(text)) score++;

  return score >= 2; // threshold
};
export const isCarImage = (text) => {
  const keywords = [
    "car",
    "vehicle",
    "toyota",
    "honda",
    "hyundai",
    "engine",
    "wheel",
    "number plate"
  ];

  let score = 0;

  keywords.forEach(word => {
    if (text.toLowerCase().includes(word)) score++;
  });

  return score >= 1; // threshold
};
export const isInsuranceDocument = (text) => {
  const keywords = [
    "insurance",
    "policy",
    "vehicle",
    "validity",
    "premium",
    "insured"
  ];

  let score = 0;

  keywords.forEach(word => {
    if (text.toLowerCase().includes(word)) score++;
  });

  return score >= 2;
};