import express from "express";
import {
  requireAuth,
  requireRole,
  loadUser,
  requireActiveStatus,
} from "../middleware/auth.middleware.js";

import {
  getAllArticles,
  addNewArticle,
  updateArticle,
  toggleIsFeaturStatus,
  deleteArticle,
} from "../controllers/article.controller.js";

import { uploadArticle } from "../config/cloudinary.js";

const router = express.Router();

router.use(requireAuth, loadUser);

router.get("/", getAllArticles);

router.use(requireActiveStatus, requireRole("admin", "doctor"));

router.post("/add", uploadArticle.single("image"), addNewArticle);
router.put("/update", uploadArticle.single("image"), updateArticle);
router.patch("/update/:articleId", requireRole("admin"), toggleIsFeaturStatus);
router.delete("/delete/:articleId", deleteArticle);

export default router;
