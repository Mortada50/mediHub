import express from "express";
import { requireAuth, loadUser } from "../middleware/auth.middleware.js";
import { Doctor } from "../models/Doctor.model.js";
import { Patient } from "../models/Patient.model.js";
import { Pharmacy } from "../models/Pharmacy.model.js";
import { Admin } from "../models/Admin.model.js";
import { ROLES } from "../utils/constants.js";
import { sendSuccess, sendError } from "../utils/response.js";

const router = express.Router();

const modelMap = {
  [ROLES.DOCTOR]: Doctor,
  [ROLES.PATIENT]: Patient,
  [ROLES.PHARMACY]: Pharmacy,
  [ROLES.ADMIN]: Admin,
};

/**
 * GET /api/auth/me
 * get current user's profile
 */
router.get("/me", requireAuth, loadUser, async (req, res) => {
  try {
    const { userRole, mongoId, userStatus } = req;
    const Model = modelMap[userRole];

    if (!Model || !mongoId) {
      return sendError(res, "بيانات المستخدم غير مكتملة", 400);
    }

    const profile = await Model.findById(mongoId);
    if (!profile)
      return sendError(res, "المستخدم غير موجود في قاعدة البيانات", 404);

    sendSuccess(res, {
      role: userRole,
      status: userStatus,
      profile,
    });
  } catch (error) {
    sendError(res, error.message);
  }
});

export default router;
