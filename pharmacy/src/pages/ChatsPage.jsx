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

  const myId = session?.user?.publicMetadata?.mongoId;
  const sessionId = session?.id;

  useEffect(() => {
    let cancelled = false;

    getToken()
      .then((value) => {
        if (!cancelled) setToken(value);
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("[chat] failed to fetch Clerk token", error);
          setToken(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const { socket, connected } = useSocket(token, sessionId);

  useEffect(() => {
    if (!socket) return;

    socket.on("online_users", (usersArray) => {
      setOnlineUsers(new Set(usersArray));
    });

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
      socket.off("online_users");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !activeConvId) return;
    const joinActiveConversation = () => {
      socket.emit("join_conversation", { conversationId: activeConvId });
    };

    joinActiveConversation();
    socket.on("connect", joinActiveConversation);

    return () => {
      socket.off("connect", joinActiveConversation);
      socket.emit("leave_conversation", { conversationId: activeConvId });
    };
  }, [socket, activeConvId]);

  const { data: convData, isLoading: loadingConvs } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: !!token,
    staleTime: 30_000,
    select: (res) => res.data ?? [],
  });

  const conversations = convData ?? [];
  const activeConv = conversations.find((c) => c._id === activeConvId);
  const receiverId = activeConv?.participants?.find(
    (p) => p.userId?._id?.toString() !== myId?.toString(),
  )?.userId?._id;

  const { typingMap, handleTypingEvent, emitTyping } = useTyping({
    socket,
    activeConvId,
    myId,
    receiverId,
  });

  useEffect(() => {
    if (!socket) return;
    socket.on("typing", handleTypingEvent);
    return () => socket.off("typing", handleTypingEvent);
  }, [socket, handleTypingEvent]);

  useSocketEvents({ socket, activeConvId, myId });

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
      className={`flex overflow-hidden bg-background fixed pr-3 max-md:pr-0 ${isSidebarOpen ? "mr-[230px] max-md:mr-0" : "mr-[80px] max-md:mr-0"} transition-all duration-300`}
      style={{ top: "81px", bottom: 0, left: 0, right: 0 }}>
      {/* ── قائمة المحادثات ── */}
      <div
        className={`shrink-0 flex-col border-l border-[#E8E8E8] transition-all duration-300
          ${activeConvId ? "hidden md:flex md:w-[300px]" : "flex w-full md:w-[300px]"}
        `}>
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
        // ✅ التعديل 3: تمرير دالة رجوع للاستخدام في الموبايل
        onBack={() => {
          setActive(null);
          setReplyTo(null);
        }}
      />
    </div>
  );
}
