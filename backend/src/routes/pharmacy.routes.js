import express from "express";
import { requireAuth, requireRole, loadUser } from "../middleware/auth.middleware.js";
import {
  updateManagerProfile,
  updateProfile,
  updatePharmacy,
  addMedicineToPharmacy,
  getMyMedicines,
  deleteMedicineFromPharmacy,
  updateMedicinePrice
} from "../controllers/pharmacy.controller.js";

import { uploadAvatar } from "../config/cloudinary.js";

const router = express.Router();

router.use(requireAuth, loadUser, requireRole("pharmacy"));

router.put("/update-profile", updateProfile);
router.put('/update-manager-profile',uploadAvatar.single("avatar"), updateManagerProfile);
router.put('/update-pharmacy/data', updatePharmacy);
router.post('/add-medicine', addMedicineToPharmacy);
router.get('/my-medicines', getMyMedicines);
router.delete('/remove-medicine/:medicineId', deleteMedicineFromPharmacy);
router.put('/update-medicine-price/:medicineId', updateMedicinePrice);

export default router;