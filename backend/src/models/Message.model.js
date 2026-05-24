import mongoose from "mongoose";

/**
 * Message Model
 * أنواع: text | image | file
 */
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "sender.role",
      },
      role: {
        type: String,
        required: true,
        enum: ["Doctor", "Patient", "Pharmacy", "Admin"],
      },
    },

    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    content: {
      // نص الرسالة — مطلوب لـ text، اختياري كـ caption للصور
      text: {
        type: String,
        trim: true,
        maxlength: [2000, "الرسالة لا تتجاوز 2000 حرف"],
      },

      // الصورة / الملف — بعد الرفع على Cloudinary
      media: {
        url:      { type: String },
        publicId: { type: String }, // لحذفه من Cloudinary لاحقاً
        mimeType: { type: String }, // image/jpeg | application/pdf ...
        size:     { type: Number }, // بالبايت
        fileName: { type: String }, // الاسم الأصلي
        width:    { type: Number }, // للصور فقط
        height:   { type: Number }, // للصور فقط
      },
    },

    // الرد على رسالة سابقة
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // من قرأ الرسالة
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId },
        readAt: { type: Date, default: Date.now },
        _id:    false,
      },
    ],

    // حذف للجميع (المرسِل أو الأدمن)
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date,    default: null  },

    // حذف جزئي — يختفي فقط للحاذف
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId }],

    // تعديل
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date,    default: null  },
  },
  { timestamps: true },
);

// ── Indexes ──
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ "sender.userId": 1 });

export const Message = mongoose.model("Message", messageSchema);
