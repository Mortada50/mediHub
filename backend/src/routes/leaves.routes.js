import express from "express";
import {
  requireAuth,
  requireRole,
  loadUser,
  requireActiveStatus,
} from "../middleware/auth.middleware.js";

import {
  getLeaves,
  addLeave,
  deleteLeave,
  cancelLeave
} from "../controllers/leaves.controller.js";

const router = express.Router();


router.use(requireAuth, loadUser, requireRole("doctor"));

router.get("/", getLeaves);

router.use(requireActiveStatus);

router.post("/", addLeave);
router.delete("/:leaveId", deleteLeave);
router.patch("/:leaveId", cancelLeave)

export default router;