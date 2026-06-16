import { Conversation } from "../models/Conversation.model.js";
import { Message } from "../models/Message.model.js";
import { sendSuccess, sendError, sendPaginated } from "../utils/response.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { canChat, chatDeniedMsg } from "../utils/chatPermissions.js";
import { emitToUser } from "../socket/socket.handler.js";
import mongoose from "mongoose";

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const buildSender = (req) => ({
  userId: req.mongoId,
  role: cap(req.userRole),
});

/**
 * POST /api/chats/conversations
 */
export const createConversation = async (req, res) => {
  try {
    const { participantId, participantRole } = req.body;
    const meId = req.mongoId;
    const meRole = req.userRole;

    if (!participantId || !participantRole) {
      return sendError(res, "participantId و participantRole مطلوبان", 400);
    }

    if (participantId.toString() === meId.toString()) {
      return sendError(res, "لا يمكنك مراسلة نفسك", 400);
    }

    if (!canChat(meRole, participantRole)) {
      return sendError(res, chatDeniedMsg(meRole, participantRole), 403);
    }

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

    const io = req.app.get("io");
    emitToUser(io, participantId, "new_conversation", conversation);

    sendSuccess(res, conversation, "تم إنشاء المحادثة", 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/chats/conversations
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

    const unreadRows = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: myConversations.map((conv) => conv._id) },
          isDeleted: false,
          deletedFor: { $ne: new mongoose.Types.ObjectId(userId) },
          "sender.userId": { $ne: new mongoose.Types.ObjectId(userId) },
          "readBy.userId": { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      { $group: { _id: "$conversationId", unread: { $sum: 1 } } },
    ]);

    const unreadByConversationId = new Map(
      unreadRows.map(({ _id, unread }) => [_id.toString(), unread]),
    );

    const conversations = myConversations.map((conv) => ({
      ...conv,
      unread: unreadByConversationId.get(conv._id.toString()) ?? 0,
    }));

    sendSuccess(res, conversations);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/chats/conversations/:conversationId
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
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.mongoId;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);

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

    await Conversation.updateOne(
      { _id: conversationId, "participants.userId": userId },
      { $set: { "participants.$.lastSeenAt": new Date() } },
    );

    sendPaginated(res, messages.reverse(), total, page, limit);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/chats/conversations/:conversationId/messages
 */
export const sendTextMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;
    const sender = buildSender(req);

    if (!text?.trim()) {
      return sendError(res, "نص الرسالة مطلوب", 400);
    }

    const conv = await Conversation.findOne({
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

    if (message.replyTo) {
      await message.populate(
        "replyTo",
        "content.text content.media type sender",
      );
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    const io = req.app.get("io");

    io?.to(conversationId).emit("new_message", message);

    conv.participants.forEach((p) => {
      const pId = p.userId.toString();
      if (pId !== sender.userId.toString()) {
        emitToUser(io, pId, "new_message", message);
      }
    });

    sendSuccess(res, message, "تم إرسال الرسالة", 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/chats/conversations/:conversationId/messages/media
 */
export const sendMediaMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;
    const sender = buildSender(req);

    if (!req.file) {
      return sendError(res, "لم يتم رفع أي ملف", 400);
    }

    const conv = await Conversation.findOne({
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

    if (message.replyTo) {
      await message.populate(
        "replyTo",
        "content.text content.media type sender",
      );
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    const io = req.app.get("io");

    io?.to(conversationId).emit("new_message", message);

    conv.participants.forEach((p) => {
      const pId = p.userId.toString();
      if (pId !== sender.userId.toString()) {
        emitToUser(io, pId, "new_message", message);
      }
    });

    sendSuccess(res, message, "تم إرسال الملف", 201);
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * PATCH /api/chats/messages/:messageId
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

    const io = req.app.get("io");
    io?.to(msg.conversationId.toString()).emit("message_edited", msg);

    // ✅ تحديث قائمة المحادثات: إرسال حدث التعديل لجميع الغرف الشخصية للمشاركين
    const conv = await Conversation.findById(msg.conversationId);
    if (conv) {
      conv.participants.forEach((p) => {
        const pId = p.userId.toString();
        if (pId !== userId.toString()) {
          emitToUser(io, pId, "message_edited", msg);
        }
      });
    }

    sendSuccess(res, msg, "تم تعديل الرسالة");
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * DELETE /api/chats/messages/:messageId?for=me|all
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

    const io = req.app.get("io");

    if (deleteFor === "all") {
      const isSender = msg.sender.userId.toString() === userId.toString();
      const isAdmin = userRole === "admin";

      if (!isSender && !isAdmin) {
        return sendError(res, "لا تملك صلاحية الحذف للجميع", 403);
      }

      if (msg.content?.media?.publicId) {
        await deleteFromCloudinary(msg.content.media.url);
      }

      // إبقاء الرسالة وجعل نصها (محذوف)
      msg.isDeleted = true;
      msg.deletedAt = new Date();
      msg.content = { text: "تم حذف هذه الرسالة" };
      await msg.save();

      const conv = await Conversation.findById(msg.conversationId);

      io?.to(msg.conversationId.toString()).emit("message_deleted", {
        messageId,
        conversationId: msg.conversationId,
        for: "all",
      });

      // ✅ حل المشكلة: إرسال حدث الحذف لجميع الغرف الشخصية لكي تصل للطرف الآخر حتى وإن كان يتصفح قائمة المحادثات فقط
      if (conv) {
        conv.participants.forEach((p) => {
          const pId = p.userId.toString();
          if (pId !== userId.toString()) {
            emitToUser(io, pId, "message_deleted", {
              messageId,
              conversationId: msg.conversationId,
              for: "all",
            });
          }
        });
      }
    } else {
      const alreadyDeleted = msg.deletedFor
        .map(String)
        .includes(userId.toString());
      if (!alreadyDeleted) {
        msg.deletedFor.push(userId);
        await msg.save();
      }

      emitToUser(io, userId, "message_deleted", {
        messageId,
        conversationId: msg.conversationId,
        for: "me",
      });
    }

    sendSuccess(res, {}, "تم حذف الرسالة");
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * POST /api/chats/conversations/:conversationId/read
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

    await Conversation.updateOne(
      { _id: conversationId, "participants.userId": userId },
      { $set: { "participants.$.lastSeenAt": new Date() } },
    );

    const io = req.app.get("io");
    const readPayload = {
      conversationId,
      userId,
      readAt: new Date(),
    };

    io?.to(conversationId).emit("messages_read", readPayload);

    emitToUser(io, userId, "messages_read", readPayload);

    sendSuccess(res, {}, "تم تعليم الرسائل كمقروءة");
  } catch (error) {
    sendError(res, error.message);
  }
};

/**
 * GET /api/chats/conversations/:conversationId/unread-count
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
