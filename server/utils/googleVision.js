import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

// ✅ CAR DETECTION
export const isRealCarImage = async (imagePath) => {
  // 🔹 OBJECT DETECTION (MAIN)
  const [objResult] = await client.objectLocalization(imagePath);
  const objects = objResult.localizedObjectAnnotations;

  console.log("Objects:", objects.map(o => `${o.name} (${o.score})`));

  // ✅ MUST detect car/vehicle with HIGH confidence
  const carObject = objects.find(
    (o) =>
      ["Car", "Vehicle"].includes(o.name) &&
      o.score > 0.80   // 🔥 stricter
  );

  if (!carObject) return false;

  // 🔹 EXTRA SAFETY: reject if person/animal dominates
  const invalidObject = objects.find(
    (o) =>
      ["Person", "Dog", "Cat", "Food"].includes(o.name) &&
      o.score > 0.70
  );

  if (invalidObject) return false;

  return true;
};

// ✅ INSURANCE TEXT DETECTION
export const extractInsuranceText = async (imagePath) => {
  const [result] = await client.textDetection(imagePath);

  const text = result.fullTextAnnotation?.text || "";

  console.log("Insurance Text:", text);

  return text;
};

// ✅ INSURANCE VALIDATION
export const isValidInsurance = (text) => {
  const keywords = [
    "insurance",
    "policy",
    "vehicle",
    "premium",
    "valid",
    "policy number",
    "coverage"
  ];

  return keywords.some(word =>
    text.toLowerCase().includes(word)
  );
};

// ✅ FAKE DETECTION
export const isFakeInsurance = (text) => {
  if (!text || text.length < 30) return true;

  const suspicious = ["lorem", "dummy", "sample"];

  return suspicious.some(word =>
    text.toLowerCase().includes(word)
  );
};