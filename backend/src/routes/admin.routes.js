import express from "express";
import { requireAuth, requireRole, loadUser } from "../middleware/auth.middleware.js";
import {
  getPendingRejectedUsers,
  updateDocPharmApprovelStatus,
  removeRejectedUser,
  getActiveSuspendedUsers,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(requireAuth, loadUser, requireRole("admin"))

router.get("/pending-reject/status", getPendingRejectedUsers);
router.get("/active-suspended/users", getActiveSuspendedUsers);
router.patch("/approve-reject/users/:userId", updateDocPharmApprovelStatus);
router.delete("/remove-reject/users/:userId", removeRejectedUser);


export default router;