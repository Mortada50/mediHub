import { clerkClient } from "@clerk/clerk-sdk-node";
import { verifyToken } from "@clerk/backend";
import { ENV } from "../config/env.js";

const onlineUsers = new Map();

export const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const { token, sessionId } = socket.handshake.auth ?? {};
      if (!token || !sessionId) {
        return next(new Error("AUTH_MISSING"));
      }

      const payload = await verifyToken(token, {
        secretKey: ENV.CLERK_SECRET_KEY,
      });

      if (!payload || payload.sts !== "active") {
        return next(new Error("AUTH_INVALID"));
      }

      const clerkUser = await clerkClient.users.getUser(payload.sub);
      const meta = clerkUser.publicMetadata
        ? clerkUser.publicMetadata
        : (clerkUser.unsafeMetadata ?? {});

      if (meta.status && ["pending", "rejected"].includes(meta.status)) {
        return next(new Error("الحساب معلق او موقوف"));
      }

      socket.mongoId = meta.mongoId;
      socket.userRole = meta.role;

      next();
    } catch (err) {
      next(new Error("خطاء تحقق: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.mongoId;

    console.log(`🟢 [socket] +++ userId=${userId}  role=${socket.userRole}`);

    onlineUsers.set(userId, socket.id);
    socket.join(userId.toString());

    socket.broadcast.emit("user_online", { userId });

    // ✅ حل مشكلة 3: إرسال القائمة الحالية للمتصلين للمستخدم الذي اتصل للتو
    socket.emit("online_users", Array.from(onlineUsers.keys()));

    socket.on("join_conversation", ({ conversationId } = {}) => {
      if (conversationId) socket.join(conversationId.toString());
    });

    socket.on("leave_conversation", ({ conversationId } = {}) => {
      if (conversationId) socket.leave(conversationId.toString());
    });

    // ✅ حل مشكلة 1: إرسال مؤشر الكتابة للغرفة الشخصية للطرف الآخر مباشرة
    socket.on("typing_start", ({ conversationId, receiverId } = {}) => {
      if (!conversationId) return;
      if (receiverId) {
        io.to(receiverId.toString()).emit("typing", {
          conversationId,
          userId,
          isTyping: true,
        });
      } else {
        socket.to(conversationId.toString()).emit("typing", {
          conversationId,
          userId,
          isTyping: true,
        });
      }
    });

    socket.on("typing_stop", ({ conversationId, receiverId } = {}) => {
      if (!conversationId) return;
      if (receiverId) {
        io.to(receiverId.toString()).emit("typing", {
          conversationId,
          userId,
          isTyping: false,
        });
      } else {
        socket.to(conversationId.toString()).emit("typing", {
          conversationId,
          userId,
          isTyping: false,
        });
      }
    });

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

export const isUserOnline = (mongoId) => onlineUsers.has(mongoId?.toString());

export const emitToUser = (io, mongoId, event, data) => {
  if (!mongoId) return;
  io.to(mongoId.toString()).emit(event, data);
};

export { onlineUsers };
