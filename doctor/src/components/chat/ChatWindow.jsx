import React, { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
// ✅ التعديل 1: استيراد ArrowRight لزر الرجوع
import {
  MessageCircle,
  VideoIcon,
  Phone,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import ChatInput from "./ChatInput.jsx";
import {
  getMessages,
  markAsRead,
  deleteMessage,
} from "../../services/chatService.js";
import emptyChatWindowLogo from "../../assets/emptyChatPage.png";
const ROLE_LABEL = {
  Doctor: "طبيب",
  Patient: "مريض",
  Pharmacy: "صيدلية",
  Admin: "أدمن",
};

const getOther = (conv, myId) =>
  conv?.participants?.find(
    (p) => p.userId._id?.toString() !== myId?.toString(),
  ) ?? {};

export default function ChatWindow({
  myId,
  activeConvId,
  conversation,
  typingMap,
  onlineUsers,
  replyTo,
  setReplyTo,
  onTyping,
  onBack, // ✅ استقبال الـ prop الجديد
}) {
  const qc = useQueryClient();
  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const [editingMsg, setEditingMsg] = useState(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["messages", activeConvId],
      queryFn: ({ pageParam = 1 }) =>
        getMessages({ conversationId: activeConvId, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        const total = lastPage?.pagination?.total ?? 0;
        const fetched = pages.flatMap((p) => p.data ?? []).length;
        return fetched < total ? pages.length + 1 : undefined;
      },
      enabled: !!activeConvId,
      staleTime: 0,
    });

  const messages = [...(data?.pages ?? [])]
    .reverse()
    .flatMap((p) => p.data ?? []);

  useEffect(() => {
    if (!activeConvId) return;

    markAsRead(activeConvId).catch(() => {});

    qc.setQueryData(["conversations"], (old) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map((c) =>
          c._id === activeConvId ? { ...c, unread: 0 } : c,
        ),
      };
    });
  }, [activeConvId, messages.length, qc]);

  useEffect(() => {
    if (isFetchingNextPage) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvId, messages.length, isFetchingNextPage]);

  useEffect(() => {
    if (!topRef.current || !hasNextPage) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    obs.observe(topRef.current);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    setEditingMsg(null);
  }, [activeConvId]);

  const delMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: (_, { messageId, forWho, conversationId }) => {
      qc.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data:
              forWho === "all"
                ? page.data?.map((m) =>
                    m._id === messageId
                      ? {
                          ...m,
                          isDeleted: true,
                          content: { text: "تم حذف هذه الرسالة" },
                        }
                      : m,
                  )
                : page.data?.filter((m) => m._id !== messageId),
          })),
        };
      });
    },
  });

  const other = getOther(conversation, myId);
  const isOnline = onlineUsers?.has(other?.userId?._id?.toString());
  const isTyping = typingMap?.[activeConvId];

  // ── حالة فارغة ──
  if (!activeConvId) {
    return (
      <div className="flex-1 flex-col items-center justify-center bg-white gap-4 hidden md:flex">
        <div className="rounded-full size-35 bg-background-primary flex items-center justify-center">
          <img
            src={emptyChatWindowLogo}
            alt="Empty chat window"
            className="w-full h-full object-contain opacity-60"
          />
        </div>
        <div className="text-center">
          <p className="text-text font-bold text-lg">اختر محادثة</p>
          <p className="text-text-secondary text-sm mt-1">
            اختر محادثة من القائمة للبدء
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <div className="flex justify-between border border-[#E8E8E8] ">
        <div
          className="h-[65px] px-3 md:px-5 flex items-center gap-2 md:gap-3
                      bg-background shrink-0">
          <button
            onClick={onBack}
            className="md:hidden size-8 flex items-center justify-center rounded-full
                       hover:bg-background-primary text-text-secondary
                       hover:text-primary transition-colors">
            <ArrowRight className="size-5" />
          </button>

          <div className="relative">
            <div
              className="size-10 rounded-full bg-background-primary
                          flex items-center justify-center
                          text-primary font-bold">
              {other?.userId?.avatar ? (
                <img
                  src={other.userId.avatar}
                  alt={other.userId.fullName}
                  className="size-full object-cover rounded-full"
                />
              ) : (
                (other?.userId?.fullName?.[0]?.toUpperCase() ?? "؟")
              )}
            </div>
            {isOnline && (
              <span
                className="absolute bottom-0 left-0 size-2.5 rounded-full
                             bg-accent bg-primary"
              />
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-text leading-tight">
              {other?.userId?.fullName ?? "مستخدم"}
            </p>
            <p className="text-[11px] text-text-secondary">
              {isTyping ? (
                <span className="text-primary">يكتب...</span>
              ) : isOnline ? (
                <span className="text-accent">متصل الآن</span>
              ) : (
                (ROLE_LABEL[other?.role] ?? other?.role)
              )}
            </p>
          </div>
        </div>
        <div
          className="h-[65px] px-3 md:px-5 flex items-center gap-1 md:gap-3
                    bg-background shrink-0">
          <button
            className="size-8 flex items-center justify-center rounded-full
                       hover:bg-background-primary text-text-secondary
                       hover:text-primary transition-colors">
            <Phone className="size-3.5" />
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-full
                       hover:bg-background-primary text-text-secondary
                       hover:text-primary transition-colors">
            <VideoIcon className="size-3.5" />
          </button>
          <button
            className="size-8 flex items-center justify-center rounded-full
                       hover:bg-background-primary text-text-secondary
                       hover:text-primary transition-colors">
            <MoreVertical className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 no-scrollbar bg-white">
        <div ref={topRef} />

        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <span className="size-5 border-2 border-[#E8E8E8] border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="size-8 border-2 border-[#E8E8E8] border-t-primary rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
            لا توجد رسائل — ابدأ المحادثة
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={msg.sender?.userId?.toString() === myId?.toString()}
              myId={myId}
              onReply={() => {
                setReplyTo(msg);
                setEditingMsg(null);
              }}
              onEdit={(m) => {
                setEditingMsg(m);
                setReplyTo(null);
              }}
              onDelete={(id, fw) =>
                delMutation.mutate({
                  messageId: id,
                  forWho: fw,
                  conversationId: activeConvId,
                })
              }
            />
          ))
        )}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div
              className="px-4 py-3 bg-white rounded-2xl rounded-br-sm
                            border border-[#E8E8E8] shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        activeConvId={activeConvId}
        myId={myId}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        onTyping={onTyping}
        editingMsg={editingMsg}
        onCancelEdit={() => setEditingMsg(null)}
      />
    </div>
  );
}
