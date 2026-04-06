import mongoose from "mongoose";
import { DAYS_OF_WEEK } from "../utils/constants.js";

// ───── Session Schema ─────
export const sessionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["morning", "evening"],
    },
    startTime: {
      type: String,
      required: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "صيغة الوقت غير صحيحة (HH:MM)",
      ],
    },
    endTime: {
      type: String,
      required: true,
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "صيغة الوقت غير صحيحة (HH:MM)",
      ],
    },
  },
  { _id: true },
);

// ───── Weekly Schedule Schema ─────
export const weeklyScheduleSchema = new mongoose.Schema(
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
    sessions: [sessionSchema],
  },
  { _id: true },
);

// ───── Address Schema ─────
export const addressSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    area: { type: String, required: true },
    street: { type: String, required: true },
  },
  { _id: false },
);

// ───── Location Schema (GeoJSON) ─────
export const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: (v) => !v.length || v.length === 2,
        message: "الإحداثيات يجب أن تكون [longitude, latitude]",
      },
    },
  },
  { _id: false },
);
