import express from "express";
import { requirePatientAuth } from "../middleware/patientAuth.middleware.js";
import { toggleFavorite, getMyFavorites } from "../controllers/favorite.controller.js";
import { favoriteLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(requirePatientAuth);

router.post("/toggle", favoriteLimiter, toggleFavorite);
router.get("/", getMyFavorites);

export default router;
