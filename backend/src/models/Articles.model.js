import mongoose from "mongoose";
import { ARTICLE_CATEGORIES } from "../utils/constants.js";

const articleSchema = new mongoose.Schema(
  {
    // ── الأساسيات ──────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
      // محتوى المقالة كاملة (يمكن يكون HTML أو Markdown)
    },
    // ── الصور ──────────────────────────────────────────
    image: {
      type: String,
      default: null,
    },

    // ── المؤلف ─────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "authorRole",
    },
    authorRole: {
      type: String,
      required: true,
      enum: ["doctor", "admin"],
    },
    authorName: {
      type: String,
      required: true,
      // حفظ الاسم مباشرة لتجنب population على كل استعلام
    },
    authorSpecialty: {
      type: String,
      // تخصص الطبيب (فقط إذا كان authorRole = "Doctor")
    },
    authorAvatar: {
      type: String,
      default: null,
      // تخصص الطبيب (فقط إذا كان authorRole = "Doctor")
    },

    // ── التصنيف─ ─────────────────────
    category: {
      type: String,
      required: true,
      enum: ARTICLE_CATEGORIES,
    },

    // ── مميزة ─────────────────────────────────────────

    isFeatured: {
      type: Boolean,
      default: false,
      // هل المقالة معلقة في الأعلى؟
    },
  },
  {
    timestamps: true,
  },
);

export const Article = mongoose.model("Article", articleSchema);