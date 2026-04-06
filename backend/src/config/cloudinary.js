import pkg from "cloudinary";
const { v2: cloudinary } = pkg;
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { ENV } from "./env.js";

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

// ───── Doctor License Storage ─────
const doctorLicenseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediHub/licenses/doctors",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ quality: "auto:good" }],
  },
});

// ───── Pharmacy License Storage ─────
const pharmacyLicenseStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediHub/licenses/pharmacies",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ quality: "auto:good" }],
  },
});

// ───── Avatar Storage ─────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediHub/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
    ],
  },
});

// ───── File Size Limits ─────
const licenseFileLimits = { fileSize: 5 * 1024 * 1024 }; // 5MB
const avatarFileLimits = { fileSize: 2 * 1024 * 1024 }; // 2MB

export const uploadDoctorLicense = multer({
  storage: doctorLicenseStorage,
  limits: licenseFileLimits,
});

export const uploadPharmacyLicense = multer({
  storage: pharmacyLicenseStorage,
  limits: licenseFileLimits,
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: avatarFileLimits,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("يجب أن يكون الملف صورة"), false);
    }
  },
});

// ───── Delete file from Cloudinary ─────
export const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;
    // Find the upload segment and extract everything after it (excluding version)
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return;

    // Extract path after /upload/ and remove version prefix (v1234567890/)
    const pathAfterUpload = url.slice(uploadIndex + 8);
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");

    // Remove file extension to get publicId
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

export default cloudinary;
