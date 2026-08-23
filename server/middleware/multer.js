import multer from "multer"
import path from "path"

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, Date.now() + "-" + file.fieldname + ext)
  }
})

// File filter
const fileFilter = (req, file, cb) => {

  const imageTypes = ["image/jpeg", "image/png"]
  const insuranceTypes = ["image/jpeg", "image/png", "application/pdf"]

  if (file.fieldname === "image") {
    if (!imageTypes.includes(file.mimetype)) {
      return cb(new Error("Car image must be JPG or PNG"), false)
    }
  } 
  else if (file.fieldname === "insurance") {
    if (!insuranceTypes.includes(file.mimetype)) {
      return cb(new Error("Insurance must be JPG, PNG or PDF"), false)
    }
  } 
  else {
    return cb(new Error("Invalid field"), false)
  }

  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})


export default upload