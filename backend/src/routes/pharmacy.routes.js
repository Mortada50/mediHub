import express from "express";
import { requireAuth, requireRole, loadUser } from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/pharmacy.controller.js";

const router = express.Router();

router.use(requireAuth, loadUser, requireRole("pharmacy"));

router.put("/update-profile", updateProfile);


export default router;