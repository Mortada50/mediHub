import mongoose from "mongoose";

// ─── Leave Schema ────────────────────────────────────────────
const leaveSchema = new mongoose.Schema(
  {
    // Doctor / User reference
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Leave type: single day OR date range
    leaveType: {
      type: String,
      enum: ["single", "range"],
      required: true,
      default: "single",
    },

    // For single-day leave
    date: {
      type: Date,
      default: null,
    },

    // For range leave
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },

    // Computed duration in days (virtual or stored)
    durationDays: {
      type: Number,
      default: 1,
    },

    // Optional reason / description (max 500 chars)
    reason: {
      type: String,
      maxlength: 500,
      default: "",
      trim: true,
    },

    // Status of the leave
    status: {
      type: String,
      enum: ["upcoming", "active", "ended", "cancelled"],
      default: "upcoming",
    },


  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Virtuals ────────────────────────────────────────────────

// Human-readable date label
leaveSchema.virtual("dateLabel").get(function () {
  if (this.leaveType === "single" && this.date) {
    return new Date(this.date).toLocaleDateString("ar-SA");
  }
  if (this.leaveType === "range" && this.startDate && this.endDate) {
    const s = new Date(this.startDate).toLocaleDateString("ar-SA");
    const e = new Date(this.endDate).toLocaleDateString("ar-SA");
    return `${s} — ${e}`;
  }
  return "";
});

// ─── Pre-save Hook ───────────────────────────────────────────
leaveSchema.pre("save", function (next) {
  // Auto-compute durationDays for range leaves
  if (this.leaveType === "range" && this.startDate && this.endDate) {
    const ms = new Date(this.endDate) - new Date(this.startDate);
    this.durationDays = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
  } else {
    this.durationDays = 1;
  }

  // Auto-update status based on current date
  const now = new Date();
  const effectiveEnd = this.leaveType === "single" ? this.date : this.endDate;
  const effectiveStart =
    this.leaveType === "single" ? this.date : this.startDate;

  if (effectiveEnd && new Date(effectiveEnd) < now) {
    this.status = "ended";
  } else if (
    effectiveStart &&
    effectiveEnd &&
    new Date(effectiveStart) <= now &&
    new Date(effectiveEnd) >= now
  ) {
    this.status = "active";
  }

  next();
});

// ─── Indexes ─────────────────────────────────────────────────
leaveSchema.index({ doctorId: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

// ─── Model ───────────────────────────────────────────────────
export const Leave = mongoose.model("Leave", leaveSchema);


/*
 ── Example Document ────────────────────────────────────────────

 // Single day leave
 {
   doctorId: ObjectId("..."),
   leaveType: "single",
   date: ISODate("2026-05-10"),
   durationDays: 1,
   reason: "يوم إجازة رسمية",
   status: "ended",
   category: "official"
 }

 // Range leave
 {
   doctorId: ObjectId("..."),
   leaveType: "range",
   startDate: ISODate("2026-05-20"),
   endDate: ISODate("2026-05-22"),
   durationDays: 3,
   reason: "مؤتمر طبي في الرياض",
   status: "upcoming",
   category: "conference"
 }

*/
