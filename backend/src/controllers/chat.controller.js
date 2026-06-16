import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { canChat, chatDeniedMsg } from "../utils/chatPermissions.js";

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const buildSender = (req) => ({
  userId: req.mongoId,
  role: cap(req.userRole),
});

/**
 * POST /api/chats/conversations
 * إنشاء محادثة فردية
 *
 * body: {
 *   participantId:   string   ← mongoId الطرف الآخر
 *   participantRole: string   ← "doctor" | "patient" | "pharmacy" | "admin"
 * }
 */
export const createConversation = async (req, res) => {
  try {
    const { participantId, participantRole } = req.body;
    const meId = req.mongoId;
    const meRole = req.userRole; // lowercase

    // ── validation ──
    if (!participantId || !participantRole) {
      return sendError(res, "participantId و participantRole مطلوبان", 400);
    }

    if (participantId.toString() === meId.toString()) {
      return sendError(res, "لا يمكنك مراسلة نفسك", 400);
    }

    // ── هل الزوج مسموح؟ ──
    if (!canChat(meRole, participantRole)) {
      return sendError(res, chatDeniedMsg(meRole, participantRole), 403);
    }

    // ── منع تكرار المحادثة الفردية ──
    const existing = await Conversation.findOne({
      isActive: true,
      "participants.userId": { $all: [meId, participantId] },
    });

    if (existing) {
      return sendSuccess(res, existing, "المحادثة موجودة مسبقاً");
    }

    const conversation = await Conversation.create({
      type: "private",
      participants: [
        { userId: meId, role: cap(meRole) },
        { userId: participantId, role: cap(participantRole) },
      ],
    });

    sendSuccess(res, conversation, "تم إنشاء المحادثة", 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/chats/conversations
 *
 */
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.mongoId;

    const myConversations = await Conversation.find({
      "participants.userId": userId,
      isActive: true,
    })
      .populate("participants.userId", "fullName avatar")
      .populate("lastMessage", "content type sender createdAt isDeleted")
      .sort({ lastMessageAt: -1 })
      .lean();

    const conversations = await Promise.all(
      myConversations.map(async (conv) => {
        const unread = await Message.countDocuments({
          conversationId: conv._id,
          isDeleted: false,
          "sender.userId": { $ne: userId },
          "readBy.userId": { $ne: userId },
        });
        return { ...conv, unread };
      }),
    );

    sendSuccess(res, conversations);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/chats/conversations/:conversationId
 *
 */
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.mongoId;

    const conv = await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    }).populate("lastMessage", "content type sender createdAt");

    if (!conv) {
      return sendError(res, "المحادثة غير موجودة أو غير مصرح لك", 404);
    }

    sendSuccess(res, conv);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/chats/conversations/:conversationId
 *
 */
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conv = await Conversation.findByIdAndUpdate(
      conversationId,
      { isActive: false },
      { new: true },
    );

    if (!conv) return sendError(res, "المحادثة غير موجودة", 404);

    sendSuccess(res, {}, "تم حذف المحادثة");
  } catch (error) {
    sendError(res, error.message);
  }
};

// ─────────────────────────────────────────────
//  MESSAGES
// ─────────────────────────────────────────────

/**
 * GET /api/chats/conversations/:conversationId/messages
 * جلب الرسائل مع pagination (الأحدث أولاً ثم نعكسها)
 * query: page=1 & limit=30
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.mongoId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);

    // التحقق أن المستخدم طرف في هذه المحادثة
    const inConv = await Conversation.exists({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });
    if (!inConv) {
      return sendError(res, "المحادثة غير موجودة أو غير مصرح لك", 404);
    }

    const filter = {
      conversationId,
      isDeleted: false,
      deletedFor: { $ne: userId },
    };

    const [total, messages] = await Promise.all([
      Message.countDocuments(filter),
      Message.find(filter)
        .populate("replyTo", "content.text content.media type sender")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    // تحديث lastSeenAt لهذا المستخدم
    await Conversation.updateOne(
      { _id: conversationId, "participants.userId": userId },
      { $set: { "participants.$.lastSeenAt": new Date() } },
    );

    // نعكس الترتيب ليأتي الأقدم أولاً (الصحيح لواجهة الشات)
    sendPaginated(res, messages.reverse(), total, page, limit);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/chats/conversations/:conversationId/messages
 *
 * body: { text, replyTo? }
 */
export const sendTextMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;
    const sender = buildSender(req);

    if (!text?.trim()) {
      return sendError(res, "نص الرسالة مطلوب", 400);
    }

    const conv = await Conversation.exists({
      _id: conversationId,
      "participants.userId": sender.userId,
      isActive: true,
    });
    if (!conv) {
      return sendError(res, "المحادثة غير موجودة أو غير مصرح لك", 404);
    }

    const message = await Message.create({
      conversationId,
      sender,
      type: "text",
      content: { text: text.trim() },
      replyTo: replyTo || null,
    });

    // تحديث آخر رسالة في المحادثة
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    // بث الرسالة لجميع المتصلين بالغرفة عبر Socket.IO
    req.app.get("io")?.to(conversationId).emit("new_message", message);

    sendSuccess(res, message, "تم إرسال الرسالة", 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/chats/conversations/:conversationId/messages/media
 * إرسال صورة أو ملف  — multipart/form-data
 * fields: file (required), text? (caption), replyTo?
 */
export const sendMediaMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;
    const sender = buildSender(req);

    if (!req.file) {
      return sendError(res, "لم يتم رفع أي ملف", 400);
    }

    const conv = await Conversation.exists({
      _id: conversationId,
      "participants.userId": sender.userId,
      isActive: true,
    });
    if (!conv) {
      return sendError(res, "المحادثة غير موجودة أو غير مصرح لك", 404);
    }

    const isImage = req.file.mimetype?.startsWith("image/");

    const message = await Message.create({
      conversationId,
      sender,
      type: isImage ? "image" : "file",
      content: {
        text: text?.trim() || null,
        media: {
          url: req.file.path,
          publicId: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          fileName: req.file.originalname,
        },
      },
      replyTo: replyTo || null,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    req.app.get("io")?.to(conversationId).emit("new_message", message);

    sendSuccess(res, message, "تم إرسال الملف", 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * PATCH /api/chats/messages/:messageId
 * تعديل رسالة نصية — المُرسِل فقط
 * body: { text }
 */
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.mongoId;

    if (!text?.trim()) return sendError(res, "النص مطلوب", 400);

    const msg = await Message.findOne({
      _id: messageId,
      "sender.userId": userId,
      type: "text",
      isDeleted: false,
    });

    if (!msg) {
      return sendError(
        res,
        "الرسالة غير موجودة أو لا تملك صلاحية التعديل",
        404,
      );
    }

    msg.content.text = text.trim();
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    req.app
      .get("io")
      ?.to(msg.conversationId.toString())
      .emit("message_edited", msg);

    sendSuccess(res, msg, "تم تعديل الرسالة");
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/chats/messages/:messageId?for=me|all
 * حذف رسالة
 *   for=me  → يختفي للحاذف فقط
 *   for=all → يُحذف للجميع (المُرسِل أو الأدمن فقط)
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deleteFor = req.query.for || "me";
    const userId = req.mongoId;
    const userRole = req.userRole;

    const msg = await Message.findById(messageId);
    if (!msg || msg.isDeleted) {
      return sendError(res, "الرسالة غير موجودة", 404);
    }

    if (deleteFor === "all") {
      const isSender = msg.sender.userId.toString() === userId.toString();
      const isAdmin = userRole === "admin";

      if (!isSender && !isAdmin) {
        return sendError(res, "لا تملك صلاحية الحذف للجميع", 403);
      }

      // حذف الميديا من Cloudinary إن وُجدت
      if (msg.content?.media?.publicId) {
        await deleteFromCloudinary(msg.content.media.url);
      }

      msg.isDeleted = true;
      msg.deletedAt = new Date();
      msg.content = { text: "تم حذف هذه الرسالة" };
      await msg.save();

      req.app
        .get("io")
        ?.to(msg.conversationId.toString())
        .emit("message_deleted", {
          messageId,
          conversationId: msg.conversationId,
          for: "all",
        });
    } else {
      // حذف للمستخدم فقط
      const alreadyDeleted = msg.deletedFor
        .map(String)
        .includes(userId.toString());
      if (!alreadyDeleted) {
        msg.deletedFor.push(userId);
        await msg.save();
      }
    }

    sendSuccess(res, {}, "تم حذف الرسالة");
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/chats/conversations/:conversationId/read
 *
 */
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.mongoId;

    const inConv = await Conversation.exists({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });
    if (!inConv) {
      return sendError(res, "المحادثة غير موجودة أو غير مصرح لك", 404);
    }

    await Message.updateMany(
      {
        conversationId,
        isDeleted: false,
        "sender.userId": { $ne: userId },
        "readBy.userId": { $ne: userId },
      },
      {
        $push: { readBy: { userId, readAt: new Date() } },
      },
    );

    // تحديث lastSeenAt
    await Conversation.updateOne(
      { _id: conversationId, "participants.userId": userId },
      { $set: { "participants.$.lastSeenAt": new Date() } },
    );

    req.app.get("io")?.to(conversationId).emit("messages_read", {
      conversationId,
      userId,
      readAt: new Date(),
    });

    sendSuccess(res, {}, "تم تعليم الرسائل كمقروءة");
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/chats/conversations/:conversationId/unread-count
 *
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.mongoId;

    const inConv = await Conversation.exists({
      _id: conversationId,
      "participants.userId": userId,
      isActive: true,
    });
    if (!inConv) {
      return sendError(res, "المحادثة غير موجودة أو غير مصرح لك", 404);
    }

    const count = await Message.countDocuments({
      conversationId,
      isDeleted: false,
      "sender.userId": { $ne: userId },
      "readBy.userId": { $ne: userId },
    });

    sendSuccess(res, { unreadCount: count });
  } catch (error) {
    sendError(res, error.message);
  }
};
