import React, { useState, useRef, useEffect } from "react";
import {
  Reply,
  Pencil,
  Trash2,
  MoreVertical,
  Check,
  CheckCheck,
  Camera,
  File
} from "lucide-react";

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString("ar", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function MessageBubble({
  msg,
  isMe,
  myId,
  onReply,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const deleted = msg.isDeleted;
  const isRead = msg.readBy?.some(
    (r) => r.userId?.toString() !== myId?.toString(),
  );

  return (
    <div
      className={`flex items-end gap-2 group
      ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      {/* ── Bubble ── */}
      <div
        className={`relative max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm
        ${
          isMe
            ? "bg-primary text-white rounded-tl-2xl rounded-bl-sm"
            : "bg-white text-text rounded-tr-2xl rounded-br-sm border border-[#E8E8E8]"
        }
        ${deleted ? "opacity-55 italic" : ""}`}>
        {/* Reply preview */}
        {msg.replyTo && !deleted && (
          <div
            className={`mb-1.5 px-2 py-1 rounded-lg text-xs border-r-2 break-words whitespace-pre-wrap
            ${
              isMe
                ? "border-white/50 bg-white/10 text-white/80"
                : "border-primary bg-background-primary text-text-secondary"
            }`}>
            {msg.replyTo.content?.text ??
              (msg.replyTo.type === "image" ? (
                <span className="flex items-center gap-1">
                  <Camera size={12} /> صورة
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <File size={12} /> ملف
                </span>
              ))}
          </div>
        )}

        {/* Image */}
        {msg.type === "image" && !deleted && (
          <img
            src={msg.content?.media?.url}
            alt="صورة"
             onClick={() => {
              const rawUrl = msg.content?.media?.url;
              if (!rawUrl) return;
              try {
                const parsed = new URL(rawUrl, window.location.origin);
                if (!["http:", "https:"].includes(parsed.protocol)) return;
                window.open(parsed.toString(), "_blank", "noopener,noreferrer");
              } catch {
                // ignore invalid URLs
              }
            }}
            className="rounded-xl max-w-full mb-1.5 max-h-56 object-cover cursor-pointer"
          />
        )}

        {/* File */}
        {msg.type === "file" && !deleted && (
          <a
            href={msg.content?.media?.url}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-lg
              ${isMe ? "bg-white/10 text-white" : "bg-background-primary text-primary"}`}>
            <span className="text-lg"><File size={16} /></span>
            <span className="text-xs underline truncate max-w-[150px]">
              {msg.content?.media?.fileName ?? "ملف"}
            </span>
          </a>
        )}

        {/* Text */}
        <p className="leading-relaxed break-words whitespace-pre-wrap">
          {msg.content?.text}
        </p>

        {/* Time + ticks */}
        <div
          className={`flex items-center justify-end gap-1 mt-1
          ${isMe ? "text-white/65" : "text-text-secondary"}`}>
          {msg.isEdited && <span className="text-[10px]">معدَّل</span>}
          <span className="text-[10px]">{fmtTime(msg.createdAt)}</span>
          {isMe &&
            !deleted &&
            (isRead ? (
              <CheckCheck className="size-3" />
            ) : (
              <Check className="size-3 opacity-60" />
            ))}
        </div>
      </div>

      {/* ── Actions (تظهر عند hover) ── */}
      {!deleted && (
        <div
          className={`flex items-center gap-1 transition-opacity
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          {/* رد */}
          <button
            onClick={() => onReply(msg)}
            className="size-7 flex items-center justify-center rounded-full
                       hover:bg-background-primary text-text-secondary
                       hover:text-primary transition-colors"
            title="رد">
            <Reply className="size-3.5" />
          </button>

          {/* المزيد — للمُرسِل فقط */}
          {isMe && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="size-7 flex items-center justify-center rounded-full
                           hover:bg-background-primary text-text-secondary
                           hover:text-primary transition-colors">
                <MoreVertical className="size-3.5" />
              </button>

              {open && (
                <div
                  className="absolute bottom-9 left-0 z-50 min-w-[140px] py-1
                                bg-white rounded-xl shadow-lg border border-[#E8E8E8]
                                text-sm overflow-hidden">
                  {msg.type === "text" && (
                    <button
                      onClick={() => {
                        onEdit(msg);
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2
                                 hover:bg-background-primary text-text transition-colors">
                      <Pencil className="size-3.5 text-primary" />
                      تعديل
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(msg._id, "all");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2
                               hover:bg-red-50 text-accent-red transition-colors">
                    <Trash2 className="size-3.5" />
                    حذف للجميع
                  </button>
                  <button
                    onClick={() => {
                      onDelete(msg._id, "me");
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2
                               hover:bg-background-primary text-text-secondary transition-colors">
                    <Trash2 className="size-3.5" />
                    حذف لي فقط
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
