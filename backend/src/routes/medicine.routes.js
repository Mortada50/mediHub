import express from "express";
import {
  requireAuth,
  requireRole,
  loadUser,
} from "../middleware/auth.middleware.js";
import {
  getAllMedicines,
  addNewMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineById,
} from "../controllers/medicine.controller.js";

import {uploadMedicineImages} from "../config/cloudinary.js"


const router = express.Router();

router.get("/", getAllMedicines);
router.get("/:medicineId", getMedicineById);

router.use(requireAuth, loadUser);

router.use(requireRole("admin"))

router.post("/add", uploadMedicineImages.array("images", 3), addNewMedicine)
router.put("/update", uploadMedicineImages.array("images", 3), updateMedicine)
router.delete("/delete/:medicineId", deleteMedicine)

export default router;