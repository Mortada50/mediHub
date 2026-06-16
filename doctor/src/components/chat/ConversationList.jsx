import React from "react";
import { Search, MessageCircle, LoaderIcon, Camera, File } from "lucide-react";

const ROLE_LABEL = {
  Doctor: "طبيب",
  Patient: "مريض",
  Pharmacy: "صيدلية",
  Admin: "أدمن",
};

const getOther = (conv, myId) => {
  return (
    conv.participants?.find((p) => String(p.userId._id) !== String(myId)) ?? {}
  );
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d) / 86400000;
  if (diff < 1)
    return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  if (diff < 2) return "أمس";
  if (diff < 7) return d.toLocaleDateString("ar", { weekday: "short" });
  return d.toLocaleDateString("ar", { day: "numeric", month: "short" });
};

const lastPreview = (conv) => {
  const m = conv.lastMessage;
  if (!m) return "لا توجد رسائل";
  if (m.isDeleted) return "تم حذف الرسالة";
  if (m.type === "image")
    return (
      <span className="flex items-center gap-1">
        <Camera size={12} /> صورة
      </span>
    );
  if (m.type === "file")
    return (
      <span className="flex items-center gap-1">
        <File size={12} /> ملف
      </span>
    );
  return m.content?.text ?? "";
};

export default function ConversationList({
  conversations = [],
  activeConvId,
  myId,
  onlineUsers,
  typingMap,
  loading,
  search,
  onSearchChange,
  onSelect,
}) {
  const adminCnv = conversations.filter(
    (c) => getOther(c, myId)?.role === "Admin",
  );
  const usersConv = conversations.filter(
    (c) => getOther(c, myId)?.role !== "Admin",
  );

  const filtered = [...adminCnv, ...usersConv].filter((c) => {
    if (!search.trim()) return true;
    const o = getOther(c, myId);
    const q = search.toLowerCase();
    const fullName = o?.userId?.fullName?.toLowerCase() ?? "";
    const roleLabel = ROLE_LABEL[o?.role] ?? "";
    return fullName.includes(q) || roleLabel.includes(search);
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#E8E8E8]">
        <h2 className="text-[#2F3541] font-bold text-lg mb-3">الرسائل</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث عن محادثة..."
            className="w-full h-9 pr-9 pl-3 rounded-lg bg-background text-sm
                       text-text placeholder:text-text-secondary/60
                       border border-[#E8E8E8] focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          /* Skeleton */
          <div className="flex flex-col gap-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 animate-pulse">
                <div className="size-11 rounded-full bg-background-primary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-background-primary rounded w-3/5" />
                  <div className="h-2 bg-background-primary rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-text-secondary">
            <MessageCircle className="size-9 opacity-25" />
            <p className="text-sm">لا توجد محادثات</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const other = getOther(conv, myId);
            const isActive = conv._id === activeConvId;
            const otherUserId = String(
              other?.userId?._id ?? other?.userId ?? "",
            );
            const isOnline = onlineUsers?.has(otherUserId);
            const isTyping = typingMap?.[conv._id];
            const unread = conv.unread ?? 0;

            return (
              <button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                className={`border-b-1 border-primary/10 w-full flex items-center gap-3 px-4 py-3 text-right transition-colors 
                  hover:bg-background
                  ${isActive ? "bg-background rounded-sm" : ""}`}>
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className="size-11 rounded-full bg-background-primary
                                  flex items-center justify-center
                                  text-primary font-bold text-base">
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
                      className="absolute bottom-0 left-0 size-3 rounded-full
                                     bg-accent border-2 border-white"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-sm truncate
                      ${isActive ? "font-bold text-primary" : "font-normal text-text"}`}>
                      {other?.userId?.fullName ?? "مستخدم"}
                    </span>
                    <span className="text-[10px] text-text-secondary shrink-0">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs text-text-secondary truncate">
                      {isTyping ? (
                        <span className="text-primary">يكتب...</span>
                      ) : (
                        lastPreview(conv)
                      )}
                    </span>
                    {unread > 0 && (
                      <span
                        className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full
                                       bg-primary text-white text-[10px] font-bold
                                       flex items-center justify-center">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-primary/70 mt-0.5 block">
                    {ROLE_LABEL[other?.role] ?? other?.role}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
