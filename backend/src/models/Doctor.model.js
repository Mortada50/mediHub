import mongoose from "mongoose";
import { SPECIALITY } from "../utils/constants.js";
import {
  weeklyScheduleSchema,
  addressSchema,
  locationSchema,
} from "./shared.schema.js";

// ───── Vacation Schema ─────
const vacationSchema = new mongoose.Schema(
  {
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة (YYYY-MM-DD)"],
    },
    endDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة (YYYY-MM-DD)"],
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "سبب الإجازة يجب ألا يتجاوز 500 حرف"],
    },
  },
  { _id: true, timestamps: true },
);

// ───── Doctor Schema ─────
const doctorSchema = new mongoose.Schema(
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
      minlength: [6, "الاسم يجب أن يكون 6 أحرف على الأقل"],
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
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "النبذة يجب ألا تتجاوز 500 حرف"],
    },

    // ── Professional Info ──
    speciality: {
      type: String,
      required: true,
      enum: SPECIALITY,
    },
    qualifications: {
      type: String,
      required: true,
      trim: true,
    },
    yearOfExperience: {
      type: Number,
      min: [0, "سنوات الخبرة لا يمكن أن تكون سالبة"],
      max: [60, "سنوات الخبرة تبدو غير واقعية"],
    },
    license: {
      type: String,
      required: true, // URL من Cloudinary
    },

    // ── Clinic Info ──
    clinicName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      match: [/^(?:\+967|00967)?(77|71|78|73)\d{7}$/, "الرجاء إدخال رقم صالح"],
    },
    address: addressSchema,
    location: locationSchema,

    // ── Appointment Settings ──
    appointmentFee: {
      type: Number,
      min: [1000, "سعر الحجز يجب أن يكون أكبر من 999 ريال"],
      max: [10000, "سعر الحجز لا يجب أن يتجاوز 10,000 ريال"],
    },
    appointmentDuration: {
      type: Number,
      default: 30, // بالدقائق
      enum: [15, 20, 30, 45, 60],
    },

    // ── Schedule ──
    weeklySchedule: [weeklyScheduleSchema],
    vacation: [vacationSchema],

    // ── Status ──
    status: {
      type: String,
      enum: ["pending", "rejected", "active", "suspended"],
      default: "pending",
    },

    role: {
      type: String,
      required: true,
      default: "doctor",
    },

    // ── Stats (تُحدَّث تلقائياً) ──
    totalAppointments: { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// ───── Indexes ─────
doctorSchema.index({ location: "2dsphere" });
doctorSchema.index({ speciality: 1 });
doctorSchema.index({ "address.city": 1 });

export const Doctor = mongoose.model("Doctor", doctorSchema);
