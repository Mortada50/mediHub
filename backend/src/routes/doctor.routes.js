import express from "express";
import { requireAuth, requireRole, loadUser } from "../middleware/auth.middleware.js";
import {
  updateProfile,
  updateRegisterData,
  updateClinic,
  updateAppointmentSetting,
} from "../controllers/doctor.controller.js";
import { uploadAvatar } from "../config/cloudinary.js"

const router = express.Router();

router.use(requireAuth, loadUser, requireRole("doctor"))

router.put("/update-register/data", updateRegisterData);
router.put("/update-profile", uploadAvatar.single("avatar"), updateProfile);
router.put("/update-clinic/data", updateClinic);
router.put("/update-appointment/data", updateAppointmentSetting);


export default router;