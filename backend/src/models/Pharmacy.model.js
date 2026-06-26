import mongoose from "mongoose";
import { addressSchema, locationSchema } from "./shared.schema.js";
import { DAYS_OF_WEEK } from "../utils/constants.js";

// ───── Weekly Schedule ─────
const weeklyScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },

    dayNumber: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    is24Hours: {
      type: Boolean,
      default: false,
      validate: {
        validator: function (value) {
          return !(value && !this.isOpen);
        },
        message: "اليوم المغلق لا يمكن أن يكون 24 ساعة.",
      },
    },

    openTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: function () {
        return this.isOpen && !this.is24Hours;
      },
    },

    closeTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      required: function () {
        return this.isOpen && !this.is24Hours;
      },
      validate: {
        validator: function (value) {
          if (!this.isOpen || this.is24Hours) return true;
          const toMinutes = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
          };
          return toMinutes(value) > toMinutes(this.openTime);
        },
        message: "وقت الإغلاق يجب أن يكون بعد وقت الافتتاح.",
      },
    },
  },
  { _id: true },
);

// ───── Pharmacy Medicines () ─────
const pharmacyMedicineSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "السعر لا يمكن أن يكون سالب"],
    },


    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true },
);

// ───── Pharmacy Schema ─────
const pharmacySchema = new mongoose.Schema(
  {
    // ── Clerk Auth ──
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    }, // ── Personal Info ──

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
      match: [/^\S+@\S+\.\S+$/, "البريد الإلكتروني غير صالح"],
    },

    gender: {
      type: String,
      required: true,
      enum: ["ذكر", "أنثى"],
    },

    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      trim: true,
    }, // ── Pharmacy Info ──

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
      required: true,
    }, // ── تعمل 24/7 ──

    isOpen24Hours: {
      type: Boolean,
      default: false,
    }, // ── Weekly Schedule ──

    weeklySchedule: {
      type: [weeklyScheduleSchema],
      default: [],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr)) return true;

          const days = arr.map((d) => d.day);
          if (days.length !== new Set(days).size) return false;

          return arr.every((item) => DAYS_OF_WEEK[item.dayNumber] === item.day);
        },
        message: "الجدول يحتوي على بيانات غير صحيحة.",
      },
    },

    medicines: {
      type: [pharmacyMedicineSchema],
      default: [],
      validate: {
        validator: function (arr) {
          const ids = arr.map((m) => m.medicine?.toString());
          return ids.length === new Set(ids).size;
        },
        message: "لا يمكن تكرار نفس الدواء.",
      },
    }, // ── Status ──

    status: {
      type: String,
      enum: ["pending", "rejected", "active", "suspended"],
      default: "pending",
    },

    role: {
      type: String,
      enum: ["pharmacy"],
      default: "pharmacy",
      immutable: true,
    }, // ── Rating ──

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ───── Hooks ─────
pharmacySchema.pre("save", async function () {
  if (Array.isArray(this.weeklySchedule)) {
    this.weeklySchedule.sort((a, b) => a.dayNumber - b.dayNumber);
  }
});

// ───── Indexes ─────
pharmacySchema.index({ location: "2dsphere" });
pharmacySchema.index({ "address.city": 1 });

pharmacySchema.index({ "medicines.medicine": 1 });

pharmacySchema.virtual("latLng").get(function () {
  if (this.location && this.location.coordinates) {
    return {
      lat: this.location.coordinates[1],
      lng: this.location.coordinates[0],
    };
  }
  return null;
});

export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

// import mongoose from "mongoose";
// import {
//   addressSchema,
//   locationSchema,
// } from "./shared.schema.js";

// import { DAYS_OF_WEEK } from "../utils/constants.js";

// const weeklyScheduleSchema = new mongoose.Schema(
//   {
//     day: {
//       type: String,
//       enum: DAYS_OF_WEEK,
//       required: true,
//     },
//     dayNumber: {
//       type: Number,
//       min: 0,
//       max: 6,
//     },

//   },
//   { _id: true },
// );

// // todo: check the weekly schedule

// const pharmacySchema = new mongoose.Schema(
//   {
//     // ── Clerk Auth ──
//     clerkUserId: {
//       type: String,
//       required: true,
//       unique: true,
//       index: true,
//     },

//     // ── Personal Info ──
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: [2, "الاسم يجب أن يكون حرفين على الأقل"],
//       maxlength: [100, "الاسم يجب ألا يتجاوز 100 حرف"],
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     gender: {
//       type: String,
//       required: true,
//       enum: ["ذكر", "أنثى"],
//     },
//     avatar: { type: String, default: null },
//     bio: { type: String, trim: true },

//     // ── Pharmacy Info ──
//     pharmacyName: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: [2, "اسم الصيدلية يجب أن يكون حرفين على الأقل"],
//       maxlength: [100, "اسم الصيدلية يجب ألا يتجاوز 100 حرف"],
//     },
//     phone: {
//       type: String,
//       match: [/^(?:\+967|00967)?(77|71|78|73)\d{7}$/, "الرجاء إدخال رقم صالح"],
//     },
//     address: addressSchema,

//     location: locationSchema,
//     license: {
//       type: String,
//       required: true, // URL من Cloudinary
//     },

//     // ── Schedule ──
//     weeklySchedule: [weeklyScheduleSchema],

//     // ── Medicines ──
//     medicines: [
//       {
//         medicine: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Medicine",
//         },
//       },
//     ],

//     // ── Status ──
//     status: {
//       type: String,
//       enum: ["pending", "rejected", "active", "suspended"],
//       default: "pending",
//     },

//     role: {
//       type: String,
//       required: true,
//       default: "pharmacy",
//     },

//     // ── Stars ──
//     rating: {
//       average: { type: Number, default: 0, min: 0, max: 5 },
//       count: { type: Number, default: 0 },
//     },

//     // ── Opend & Closed Time ──
//     // هل الصيدلية تعمل 24 ساعة؟
//     isOpen24Hours: {
//       type: Boolean,
//       default: true,
//     },

//     // وقت العمل (في حالة ليست 24 ساعة)
//     workingHours: {
//       openTime: {
//         type: String,
//         required: function () {
//           return !this.isOpen24Hours;
//         },
//         match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm
//       },
//       closeTime: {
//         type: String,
//         required: function () {
//           return !this.isOpen24Hours;
//         },
//         match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
//       },
//     },
//   },
//   { timestamps: true },
// );

// // ───── Indexes ─────
// pharmacySchema.index({ location: "2dsphere" });
// pharmacySchema.index({ "address.city": 1 });

// export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
