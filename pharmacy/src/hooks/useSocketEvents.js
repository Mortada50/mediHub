/**
 * useSocketEvents.js
 * يستمع لأحداث Socket.IO ويُحدّث TanStack Query cache مباشرة
 * ✅ إصلاحات:
 *   - إضافة new_conversation لإضافة محادثة جديدة للقائمة فوراً
 *   - إضافة sort() بعد كل تحديث للمحادثات
 *   - إصلاح unread count ليعمل حتى للمحادثات غير المفتوحة
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

// دالة مساعدة لترتيب المحادثات (الأحدث أولاً)
const sortConversations = (conversations) =>
  [...conversations].sort((a, b) => {
    const dateA = a.lastMessageAt
      ? new Date(a.lastMessageAt)
      : new Date(a.createdAt);
    const dateB = b.lastMessageAt
      ? new Date(b.lastMessageAt)
      : new Date(b.createdAt);
    return dateB - dateA;
  });

export const useSocketEvents = ({ socket, activeConvId, myId }) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // ── محادثة جديدة (الطرف الآخر بدأ محادثة مع المستخدم) ──────
    socket.on("new_conversation", (conv) => {
      qc.setQueryData(["conversations"], (old) => {
        if (!old?.data) return old;

        // تجنب الإضافة المكررة
        const exists = old.data.some((c) => c._id === conv._id);
        if (exists) return old;

        return {
          ...old,
          data: sortConversations([conv, ...old.data]),
        };
      });
    });

    // ── رسالة جديدة ──────────────────────────────
    socket.on("new_message", (msg) => {
      const cid = msg.conversationId?.toString?.() ?? msg.conversationId;

      // إضافة الرسالة لـ cache الرسائل (إذا كانت المحادثة مفتوحة)
      qc.setQueryData(["messages", cid], (old) => {
        if (!old) return old;
        const pages = old.pages ?? [];
        const newestPage = pages[0];
        if (!newestPage) return old;

        const exists = pages.some((page) =>
          page.data?.some((m) => m._id === msg._id),
        );
        if (exists) return old;

        return {
          ...old,
          pages: [
            { ...newestPage, data: [...(newestPage.data || []), msg] },
            ...pages.slice(1),
          ],
        };
      });

      qc.setQueryData(["conversations"], (old) => {
        if (!old?.data) return old;

        const updatedData = old.data.map((c) =>
          c._id === cid
            ? {
                ...c,
                lastMessage: msg,
                lastMessageAt: msg.createdAt,
                // ✅ زيادة العداد فقط إذا المحادثة مش مفتوحة وأنا لست المرسل
                unread:
                  cid === activeConvId ||
                  msg.sender?.userId?.toString() === myId?.toString()
                    ? 0
                    : (c.unread || 0) + 1,
              }
            : c,
        );

        return {
          ...old,
          data: sortConversations(updatedData),
        };
      });
    });

    // ── رسالة معدَّلة ─────────────────────────────
    socket.on("message_edited", (updatedMsg) => {
      const cid = updatedMsg.conversationId;
      qc.setQueryData(["messages", cid], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data?.map((m) =>
              m._id === updatedMsg._id ? updatedMsg : m,
            ),
          })),
        };
      });

      qc.setQueryData(["conversations"], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((c) =>
            c._id === cid && c.lastMessage?._id === updatedMsg._id
              ? {
                  ...c,
                  lastMessage: updatedMsg,
                  lastMessageAt: updatedMsg.createdAt ?? c.lastMessageAt,
                }
              : c,
          ),
        };
      });
    });

    // ── رسالة محذوفة ──────────────────────────────
    socket.on("message_deleted", ({ messageId, conversationId, for: f }) => {
      qc.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data
              ?.map((m) =>
                m._id === messageId && f === "all"
                  ? {
                      ...m,
                      isDeleted: true,
                      content: { text: "تم حذف هذه الرسالة" },
                    }
                  : m,
              )
              .filter((m) => !(m._id === messageId && f === "me")),
          })),
        };
      });

      if (f === "all") {
        qc.setQueryData(["conversations"], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c) =>
              c._id === conversationId && c.lastMessage?._id === messageId
                ? {
                    ...c,
                    lastMessage: {
                      ...c.lastMessage,
                      isDeleted: true,
                      content: { text: "تم حذف هذه الرسالة" },
                    },
                  }
                : c,
            ),
          };
        });
      }
    });

    // ── تمت القراءة ───────────────────────────────
    socket.on(
      "messages_read",
      ({ conversationId, userId: readerId, readAt }) => {
        qc.setQueryData(["messages", conversationId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data?.map((m) => {
                if (m.sender?.userId === readerId) return m;
                const alreadyRead = m.readBy?.some(
                  (r) => r.userId === readerId,
                );
                if (alreadyRead) return m;
                return {
                  ...m,
                  readBy: [...(m.readBy || []), { userId: readerId, readAt }],
                };
              }),
            })),
          };
        });

        // ✅ تصفير العداد عندما يقرأ المستخدم الحالي (في أي جهاز)
        if (readerId === myId) {
          qc.setQueryData(["conversations"], (old) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((c) =>
                c._id === conversationId ? { ...c, unread: 0 } : c,
              ),
            };
          });
        }
      },
    );

    return () => {
      socket.off("new_conversation");
      socket.off("new_message");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("messages_read");
    };
  }, [socket, activeConvId, myId, qc]);
};
