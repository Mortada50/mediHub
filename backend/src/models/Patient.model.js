import mongoose from "mongoose";
import { addressSchema } from "./shared.schema.js";
const patientSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: String,
    lastName: String,
    fullName: {
      type: String,
      minlength: [2, "الاسم يجب أن يكون حرفين على الأقل"],
      maxlength: [100, "الاسم يجب ألا يتجاوز 100 حرف"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["ذكر", "أنثى"],
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      match: [/^(?:\+967|00967)?(77|71|78|73)\d{7}$/, "الرجاء ادخال رقم صالح"],
    },
    dateOfBirth: {
      type: Date,
      // todo: check the date of birth
    },
    address: addressSchema,
    medicalHistory: {
      bloodType: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
        default: "unknown",
      },
      allergies: {
        type: String,
        trim: true,
      },

      chronicDiseases: {
        type: String,
        trim: true,
      },
      hight: {
        type: Number,
        min: [1, "يجب ان يكون الطول 1 متر على الاقل"],
        max: [2.5, "لا يجب ان يزيد الطول على 2.5 متر"],
        trim: true,
      },
      wight: {
        type: Number,
        min: [20, "يجب ان يكون الوزن 20 كيلو على الاقل"],
        max: [200, "لا يجب ان يزيد الوزن على 200 كيلو"],
        trim: true,
      },
      badHabits: {
        type: String,
        trim: true,
      },
      previousSurgeries: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

patientSchema.path("dateOfBirth").validate(function (v) {
  if (v) {
    const today = new Date();
    return v < today;
  }
  return true;
}, "تاريخ الميلاد لا يمكن أن يكون في المستقبل");

export const Patient = mongoose.model("Patient", patientSchema);