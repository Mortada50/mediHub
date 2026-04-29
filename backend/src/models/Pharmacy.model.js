import mongoose from "mongoose";
import {
  addressSchema,
  locationSchema,
} from "./shared.schema.js";

import { DAYS_OF_WEEK } from "../utils/constants.js";

const weeklyScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    dayNumber: {
      type: Number,
      min: 0,
      max: 6,
    },

  },
  { _id: true },
);

// todo: check the weekly schedule

const pharmacySchema = new mongoose.Schema(
  {
    // ── Clerk Auth ──
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ── Personal Info ──
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "الاسم يجب أن يكون حرفين على الأقل"],
      maxlength: [100, "الاسم يجب ألا يتجاوز 100 حرف"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["ذكر", "أنثى"],
    },
    avatar: { type: String, default: null },
    bio: { type: String, trim: true },

    // ── Pharmacy Info ──
    pharmacyName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "اسم الصيدلية يجب أن يكون حرفين على الأقل"],
      maxlength: [100, "اسم الصيدلية يجب ألا يتجاوز 100 حرف"],
    },
    phone: {
      type: String,
      match: [/^(?:\+967|00967)?(77|71|78|73)\d{7}$/, "الرجاء إدخال رقم صالح"],
    },
    address: addressSchema,

    location: locationSchema,
    license: {
      type: String,
      required: true, // URL من Cloudinary
    },

    // ── Schedule ──
    weeklySchedule: [weeklyScheduleSchema],

    // ── Medicines ──
    medicines: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
        },
      },
    ],

    // ── Status ──
    status: {
      type: String,
      enum: ["pending", "rejected", "active", "suspended"],
      default: "pending",
    },

    role: {
      type: String,
      required: true,
      default: "pharmacy",
    },

    // ── Stars ──
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    // ── Opend & Closed Time ──
    // هل الصيدلية تعمل 24 ساعة؟
    isOpen24Hours: {
      type: Boolean,
      default: false,
    },

    // وقت العمل (في حالة ليست 24 ساعة)
    workingHours: {
      openTime: {
        type: String,
        required: function () {
          return !this.isOpen24Hours;
        },
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm
      },
      closeTime: {
        type: String,
        required: function () {
          return !this.isOpen24Hours;
        },
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      },
    },
  },
  { timestamps: true },
);

// ───── Indexes ─────
pharmacySchema.index({ location: "2dsphere" });
pharmacySchema.index({ "address.city": 1 });

export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
