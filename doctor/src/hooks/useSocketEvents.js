/**
 * useSocketEvents.js
 * يستمع لأحداث Socket.IO ويُحدّث TanStack Query cache مباشرة
 * بدلاً من useState منفصل — أنظف وأكثر اتساقاً مع TanStack
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useSocketEvents = ({ socket, activeConvId, myId }) => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    // ── رسالة جديدة ──────────────────────────────
    socket.on("new_message", (msg) => {
      const cid = msg.conversationId;

      // إضافة الرسالة لـ cache الرسائل
      qc.setQueryData(["messages", cid], (old) => {
        if (!old) return old;
        const pages = old.pages ?? [];
        const lastPage = pages[pages.length - 1];
        if (!lastPage) return old;

        // منع التكرار
        const exists = lastPage.data?.some((m) => m._id === msg._id);
        if (exists) return old;

        return {
          ...old,
          pages: [
            ...pages.slice(0, -1),
            { ...lastPage, data: [...(lastPage.data || []), msg] },
          ],
        };
      });

      // تحديث آخر رسالة في قائمة المحادثات
      qc.setQueryData(["conversations"], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((c) =>
            c._id === cid
              ? {
                  ...c,
                  lastMessage: msg,
                  lastMessageAt: msg.createdAt,
                  // زيادة العداد فقط إذا المحادثة مش مفتوحة
                  _unread: cid === activeConvId ? 0 : (c._unread || 0) + 1,
                }
              : c,
          ),
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
                if (m.sender?.userId === readerId) return m; // رسائل القارئ نفسه لا تُحدَّث
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

        // تصفير العداد
        if (readerId !== myId) return;
        qc.setQueryData(["conversations"], (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((c) =>
              c._id === conversationId ? { ...c, _unread: 0 } : c,
            ),
          };
        });
      },
    );

    return () => {
      socket.off("new_message");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("messages_read");
    };
  }, [socket, activeConvId, myId, qc]);
};
