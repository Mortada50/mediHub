import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useSession } from "@clerk/clerk-react";
import { useSocket } from "../hooks/useSocket.js";
import { useTyping } from "../hooks/useTyping.js";
import { useSocketEvents } from "../hooks/useSocketEvents.js";
import ConversationList from "../components/chat/ConversationList.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import { getConversations } from "../services/chatService.js";
import { useOutletContext, useLocation, useNavigate } from "react-router";

export default function ChatsPage() {
  const { getToken } = useAuth();
  const { session } = useSession();

  const [token, setToken] = useState(null);
  const [activeConvId, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { isSidebarOpen } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  // mongoId من publicMetadata
  const myId = session?.user?.publicMetadata?.mongoId;
  const sessionId = session?.id;

  // جلب Clerk token مرة واحدة
  useEffect(() => {
    getToken().then(setToken);
  }, [getToken]);

  // ── Socket ──────────────────────────────────────
  const { socket, connected } = useSocket(token, sessionId);

  // online / offline
  useEffect(() => {
    if (!socket) return;
    socket.on("user_online", ({ userId }) =>
      setOnlineUsers((s) => new Set([...s, userId])),
    );
    socket.on("user_offline", ({ userId }) =>
      setOnlineUsers((s) => {
        const n = new Set(s);
        n.delete(userId);
        return n;
      }),
    );
    return () => {
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket]);

  // انضمام / مغادرة غرفة المحادثة
  useEffect(() => {
    if (!socket || !activeConvId) return;
    socket.emit("join_conversation", { conversationId: activeConvId });
    return () =>
      socket.emit("leave_conversation", { conversationId: activeConvId });
  }, [socket, activeConvId]);

  // ── Typing ──────────────────────────────────────
  const { typingMap, handleTypingEvent, emitTyping } = useTyping({
    socket,
    activeConvId,
  });

  useEffect(() => {
    if (!socket) return;
    socket.on("typing", handleTypingEvent);
    return () => socket.off("typing");
  }, [socket, handleTypingEvent]);

  // ── TanStack Query: قائمة المحادثات ─────────────
  const { data: convData, isLoading: loadingConvs } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!token,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  });

  const conversations = convData ?? [];

  // ── Socket events → يُحدِّث TanStack cache ──────
  useSocketEvents({ socket, activeConvId, myId });

  const activeConv = conversations.find((c) => c._id === activeConvId);

  useEffect(() => {
    const openId = location.state?.openConversationId;

    if (!openId || conversations.length === 0) return;

    const exists = conversations.some((conv) => conv._id === openId);

    if (exists) {
      setActive(openId);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, convData]);

  return (
    <div
      className={`flex overflow-hidden bg-background fixed pr-3 ${isSidebarOpen ? "mr-[230px]" : "mr-[80px]"} transation-all duration-300`}
      style={{ height: "calc(100vh - 81px)", left: 0, right: 0 }}>
      {/* ── قائمة المحادثات ── */}
      <div className="w-[300px] shrink-0 flex flex-col border-l border-[#E8E8E8]">
        {/* شريط حالة الاتصال */}
        <div
          className={`h-0.5 w-full transition-colors duration-500
            ${connected ? "bg-primary" : "bg-[#E8E8E8]"}`}
        />

        <ConversationList
          conversations={conversations}
          activeConvId={activeConvId}
          myId={myId}
          onlineUsers={onlineUsers}
          typingMap={typingMap}
          loading={loadingConvs}
          search={search}
          onSearchChange={setSearch}
          onSelect={(id) => {
            if (id !== activeConvId) {
              setActive(id);
              setReplyTo(null);
            }
          }}
        />
      </div>

      {/* ── نافذة المحادثة ── */}
      <ChatWindow
        myId={myId}
        activeConvId={activeConvId}
        conversation={activeConv}
        typingMap={typingMap}
        onlineUsers={onlineUsers}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        onTyping={emitTyping}
      />
    </div>
  );
}
