import express from "express";
import {
  requireAuth,
  requireRole,
  loadUser,
  requireActiveStatus,
} from "../middleware/auth.middleware.js";
import {
  getWeeklySchedule,
    toggleDay,
    clearDaySessions,
    addSession,
    updateSession,
    deleteSession,
    toggleSession,
} from "../controllers/schedule.controller.js";

const router = express.Router();


router.use(requireAuth, loadUser, requireRole("doctor"));

router.get("/", getWeeklySchedule);

router.use(requireActiveStatus);

router.patch("/day/:dayNumber/toggle", toggleDay);
router.delete("/day/:dayNumber/sessions", clearDaySessions);

router.post("/day/:dayNumber/session", addSession);
router.put("/day/:dayNumber/session/:sessionId", updateSession);
router.delete("/day/:dayNumber/session/:sessionId", deleteSession);
router.patch("/day/:dayNumber/session/:sessionId/toggle", toggleSession);


export default router;
