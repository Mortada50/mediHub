import mongoose from "mongoose";
import { DRUGCATEGORIES } from "../utils/constants.js";
const medicineSchema = new mongoose.Schema(
  {
    images: [{ type: String, required: true }],
    arabicName: {
      type: String,
      trim: true,
    },
    englishName: {
      type: String,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: DRUGCATEGORIES,
    },
    // ── التركيز  ────────────────────────────────
    concentration: {
      type: String,
      trim: true,
    },
    // ── نوع الدواء  ────────────────────────────────
    type: {
      type: String,
      enum: ["حبوب", "شراب", "كبسولة", "حقن", "كريم", "نقط", "مرهم"],
      required: true,
    },
    // ── المصنع ─────────────────────────────────────────
    countryOfManufacture: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    // ── التسجيل ────────────────────────────────────────
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    // ── الفئة العمرية ──────────────────────────────────
    ageGroup: {
      type: {
        type: String,
        enum: ["جميع الأعمار", "حد أدنى", "نطاق"],
        default: "جميع الأعمار",
      },
      minAge: { type: Number, min: 0 }, // بالسنوات
      maxAge: { type: Number, min: 0 }, // يُستخدم فقط عند النوع "نطاق"
    },

    // ── المعلومات الطبية ───────────────────────────────
    sideEffects: { type: String },
    warnings: { type: String },
    contraindications: { type: String },

    // ── الخصائص ────────────────────────────────────────
    requiresPrescription: { type: Boolean, default: true },

    // ── التخزين والوصف ─────────────────────────────────
    storageConditions: { type: String, trim: true },
    description: { type: String, trim: true },
  },

  {
    timestamps: true,
  },
);

// medicineSchema.path("ageGroup").validate(function (v) {
//   if (v?.type === "نطاق") {
//     return v.maxAge != null && v.minAge != null && v.maxAge > v.minAge;
//   }
//   return true;
// }, "maxAge يجب أن يكون أكبر من minAge عند اختيار نطاق عمري");


export const Medicine = mongoose.model("Medicine", medicineSchema);
