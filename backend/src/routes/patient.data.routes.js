import express from "express";
import { getActiveDoctors, getActivePharmacies, getLatestArticles } from "../controllers/patient.data.controller.js";

const router = express.Router();

// Publicly accessible for patients (or we can add auth later if needed)
router.get("/doctors", getActiveDoctors);
router.get("/pharmacies", getActivePharmacies);
router.get("/articles", getLatestArticles);

export default router;
