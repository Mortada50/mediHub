import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * Socket.IO Handler — MediHub
 *
 * ─── Client → Server ──────────────────────────────
 *   join_conversation    { conversationId }
 *   leave_conversation   { conversationId }
 *   typing_start         { conversationId }
 *   typing_stop          { conversationId }
 *
 * ─── Server → Client ──────────────────────────────
 *   new_message          Message
 *   message_edited       Message
 *   message_deleted      { messageId, conversationId, for }
 *   messages_read        { conversationId, userId, readAt }
 *   typing               { conversationId, userId, isTyping }
 *   user_online          { userId }
 *   user_offline         { userId, lastSeen }
 */

// mongoId  →  socketId  (للمستخدمين المتصلين حالياً)
const onlineUsers = new Map();

export const initSocket = (io) => {
  // ── Middleware: التحقق من Clerk session ──

  io.use(async (socket, next) => {
    try {
    //   todo: check the user sessionId and token sent from the client
      const { token, sessionId } = socket.handshake.auth ?? {};

      if (!token || !sessionId) {

        return next(new Error("AUTH_MISSING"));
      }

      const session = await clerkClient.sessions.verifySession(
        sessionId,
        token,
      );

      if (!session || session.status !== "active") {
        return next(new Error("AUTH_INVALID"));
      }

      const clerkUser = await clerkClient.users.getUser(session.userId);
      const meta = clerkUser.publicMetadata ?? {};

      if (meta.status && meta.status === "pending" || meta.status === "suspended") {
        return next(new Error("ACCOUNT_INACTIVE"));
      }

      // نُرفق البيانات بالسوكيت لاستخدامها لاحقاً
      socket.mongoId = meta.mongoId;
      socket.userRole = meta.role; // lowercase

      next();
    } catch (err) {
      next(new Error("AUTH_ERROR: " + err.message));
    }
  });

  // ── Connection ──
  io.on("connection", (socket) => {
    const userId = socket.mongoId;

    console.log(`🟢 [socket] +++ userId=${userId}  role=${socket.userRole}`);

    // تسجيل المستخدم كـ online وإبلاغ الباقين
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("user_online", { userId });

    // ── ROOMS ─────────────────────────────────

    socket.on("join_conversation", ({ conversationId } = {}) => {
      if (conversationId) socket.join(conversationId.toString());
    });

    socket.on("leave_conversation", ({ conversationId } = {}) => {
      if (conversationId) socket.leave(conversationId.toString());
    });

    // ── TYPING ────────────────────────────────

    socket.on("typing_start", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(conversationId.toString()).emit("typing", {
        conversationId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing_stop", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(conversationId.toString()).emit("typing", {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // ── DISCONNECT ────────────────────────────

    socket.on("disconnect", (reason) => {
      onlineUsers.delete(userId);
      console.log(`🔴 [socket] --- userId=${userId}  reason=${reason}`);
      socket.broadcast.emit("user_offline", {
        userId,
        lastSeen: new Date(),
      });
    });

    socket.on("error", (err) => {
      console.error(`[socket] error userId=${userId}:`, err.message);
    });
  });

  return io;
};

/** هل المستخدم متصل حالياً؟ */
export const isUserOnline = (mongoId) => onlineUsers.has(mongoId?.toString());

/** إرسال event لمستخدم محدد حتى لو مش في الغرفة */
export const emitToUser = (io, mongoId, event, data) => {
  const sid = onlineUsers.get(mongoId?.toString());
  if (sid) io.to(sid).emit(event, data);
};

export { onlineUsers };
