import express from "express";
import { getActiveDoctors, getActivePharmacies, getLatestArticles, getPharmaciesWithMedicine } from "../controllers/patient.data.controller.js";

const router = express.Router();

// Publicly accessible for patients (or we can add auth later if needed)
router.get("/doctors", getActiveDoctors);
router.get("/pharmacies", getActivePharmacies);
router.get("/articles", getLatestArticles);
router.get("/medicine/:medicineId/pharmacies", getPharmaciesWithMedicine);

export default router;
