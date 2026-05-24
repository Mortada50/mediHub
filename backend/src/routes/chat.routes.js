import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { uploadChatMedia } from "../config/cloudinary.js";
import {
  createConversation,
  getMyConversations,
  getConversation,
  deleteConversation,
  getMessages,
  sendTextMessage,
  sendMediaMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount,
} from "../controllers/chat.controller.js";

const router = express.Router();

const ALL = ["doctor", "patient", "pharmacy", "admin"];
const ADMIN = ["admin"];

// ──────────────────────────────────────────────
//  CONVERSATIONS
// ──────────────────────────────────────────────

// POST /api/chats/conversations          ← إنشاء محادثة
// GET  /api/chats/conversations          ← كل محادثاتي
router
  .route("/conversations")
  .post(...protect(...ALL), createConversation)
  .get(...protect(...ALL), getMyConversations);

// GET    /api/chats/conversations/:id    ← تفاصيل محادثة
// DELETE /api/chats/conversations/:id    ← حذف (أدمن فقط)
router
  .route("/conversations/:conversationId")
  .get(...protect(...ALL), getConversation)
  .delete(...protect(...ADMIN), deleteConversation);

// ──────────────────────────────────────────────
//  MESSAGES
// ──────────────────────────────────────────────

// GET  /api/chats/conversations/:id/messages   ← جلب الرسائل
// POST /api/chats/conversations/:id/messages   ← إرسال نص
router
  .route("/conversations/:conversationId/messages")
  .get(...protect(...ALL), getMessages)
  .post(...protect(...ALL), sendTextMessage);

// POST /api/chats/conversations/:id/messages/media  ← صورة / ملف
router.post(
  "/conversations/:conversationId/messages/media",
  ...protect(...ALL),
  uploadChatMedia.single("file"),
  sendMediaMessage,
);

// POST   /api/chats/conversations/:id/read          ← تعليم مقروء
router.post(
  "/conversations/:conversationId/read",
  ...protect(...ALL),
  markAsRead,
);

// GET    /api/chats/conversations/:id/unread-count
router.get(
  "/conversations/:conversationId/unread-count",
  ...protect(...ALL),
  getUnreadCount,
);

// PATCH  /api/chats/messages/:id                    ← تعديل رسالة
router.patch("/messages/:messageId", ...protect(...ALL), editMessage);

// DELETE /api/chats/messages/:id?for=me|all         ← حذف رسالة
router.delete("/messages/:messageId", ...protect(...ALL), deleteMessage);

export default router;
