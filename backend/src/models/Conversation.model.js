import mongoose from "mongoose";

/**
 * Conversation Model — فردية فقط (private)
 *
 * كل محادثة بين طرفَين اثنَين فقط.
 * refPath → "Doctor" | "Patient" | "Pharmacy" | "Admin"  (PascalCase)
 */

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "participants.role",
    },
    role: {
      type: String,
      required: true,
      enum: ["Doctor", "Patient", "Pharmacy", "Admin"],
    },
    // هل كتم الإشعارات؟
    isMuted: { type: Boolean, default: false },
    // آخر وقت فتح المحادثة (لحساب غير المقروء)
    lastSeenAt: { type: Date, default: null },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    // دائماً "private" — نحتفظ بالحقل للتوسع المستقبلي
    type: {
      type: String,
      enum: ["private"],
      default: "private",
    },

    participants: {
      type: [participantSchema],
      validate: {
        validator: (arr) => arr.length === 2,
        message: "المحادثة الفردية تحتاج مشاركَين بالضبط",
      },
    },

    // آخر رسالة — للعرض السريع في قائمة المحادثات
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ── Indexes ──
conversationSchema.index({ "participants.userId": 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
