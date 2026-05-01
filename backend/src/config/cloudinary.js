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

// ───── Medicine Images Storage ─────
const medicineStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "mediHub/medicines",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: `medicine-${Date.now()}-${Math.round(Math.random()*1e9)}`,
    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: "limit",
      },
      {
        quality: "auto:good",
      },
    ],
  }),
});

// ───── Articale Storage ─────
const articleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediHub/articles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "auto",
      },
      {
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  },
});

// ───── File Size Limits ─────
const licenseFileLimits = { fileSize: 5 * 1024 * 1024 }; // 5MB
const avatarFileLimits = { fileSize: 2 * 1024 * 1024 }; // 2MB
const medicineFileLimits = { fileSize: 4 * 1024 * 1024 }; // 4MB
const articleFileLimits = { fileSize: 4 * 1024 * 1024 }; // 4MB

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

// ───── Upload Medicine Images (single or multiple) ─────
export const uploadMedicineImages = multer({
  storage: medicineStorage,
  limits: medicineFileLimits,
  
  fileFilter: (req, file, cb) => {
    
    if(file.mimetype.startsWith("image/")){

      cb(null,true);
    } else {
      cb(new Error("الملفات يجب أن تكون صور"), false);
    }
  }
});

//  Upload Article Images
export const uploadArticle = multer({
  storage: articleStorage,
  limits: articleFileLimits,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("الملف يجب أن يكون صورة"), false);
    }
  },
});

// ───── Delete file from Cloudinary ─────
// export const deleteFromCloudinary = async (url) => {
//   try {
//     if (!url) return;
//     // Find the upload segment and extract everything after it (excluding version)
//     const uploadIndex = url.indexOf("/upload/");
//     if (uploadIndex === -1) return;

//     // Extract path after /upload/ and remove version prefix (v1234567890/)
//     const pathAfterUpload = url.slice(uploadIndex + 8);
//     const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");

//     // Remove file extension to get publicId
//     const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error("Cloudinary delete error:", error.message);
//   }
// };

export const deleteFromCloudinary = async (urls) => {
  try {
    if (!urls) return;
    // Find the upload segment and extract everything after it (excluding version)

    const urlsArray = Array.isArray(urls) ? urls : [urls];

    await Promise.all(
      urlsArray.map(async (url) => {
        const uploadIndex = url.indexOf("/upload/");
        if (uploadIndex === -1) return;
        // Extract path after /upload/ and remove version prefix (v1234567890/)

        const pathAfterUpload = url.slice(uploadIndex + 8);
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
        // Remove file extension to get publicId

        const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(publicId);
      }),
    );
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

export default cloudinary;
