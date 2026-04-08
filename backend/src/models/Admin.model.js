import mongoose from "mongoose";


const adminSchema = new mongoose.Schema(
  {
    // ── Clerk Auth ──
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ── Info ──
    name: {
      type: String,
      default: "ميدي هب",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: { type: String, default: null },


  },
  { timestamps: true },
);

export const Admin = mongoose.model("Admin", adminSchema);
