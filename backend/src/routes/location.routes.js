import express from "express";
import {
  requireAuth,
  requireRole,
  loadUser,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth, loadUser, requireRole("patient"));

// this route for user (mobile app)

export default router;