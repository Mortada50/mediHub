
import mongoose from "mongoose";
const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },

    itemType: {
      type: String,
      required: true,
      enum: ["Medicine", "Doctor", "Pharmacy", "Article"],
    },
  },
  {
    timestamps: true,
  }
);

// يمنع تكرار نفس العنصر لنفس المستخدم
favoriteSchema.index(
  { user: 1, item: 1, itemType: 1 },
  { unique: true }
);

export const Favorite = mongoose.model("Favorite", favoriteSchema);