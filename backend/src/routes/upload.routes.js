import express from "express";
import {
  uploadDoctorLicense,
  uploadPharmacyLicense,
} from "../config/cloudinary.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = express.Router();

/**
 * هذه الـ routes عامة (بدون auth) لأن المستخدم يرفع الترخيص
 * قبل إنشاء الحساب في Clerk
 * نستخدم uploadLimiter للحماية من الإساءة
 */

// POST /api/upload/doctor-license
router.post(
  "/doctor-license",
  uploadLimiter,
  uploadDoctorLicense.single("license"),
  (req, res) => {
    try {
      if (!req.file) return sendError(res, "لم يتم رفع أي ملف", 400);
      sendSuccess(res, { url: req.file.path }, "تم رفع الترخيص بنجاح", 201);
    } catch (error) {
      sendError(res, error.message);
    }
  },
);

// POST /api/upload/pharmacy-license
router.post(
  "/pharmacy-license",
  uploadLimiter,
  uploadPharmacyLicense.single("license"),
  (req, res) => {
    try {
      if (!req.file) return sendError(res, "لم يتم رفع أي ملف", 400);
      sendSuccess(
        res,
        { url: req.file.path },
        "تم رفع ترخيص الصيدلية بنجاح",
        201,
      );
    } catch (error) {
      sendError(res, error.message);
    }
  },
);

export default router;
