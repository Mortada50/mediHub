import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Paperclip, X, Camera, File } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendTextMessage,
  sendMediaMessage,
  editMessage,
} from "../../services/chatService.js";

export default function ChatInput({
  activeConvId,
  myId,
  replyTo,
  onClearReply,
  onTyping,
  editingMsg,
  onCancelEdit,
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null); // { file, url, name, isImage }
  const fileRef = useRef(null);
  const typingRef = useRef(null);
  const textareaRef = useRef(null);

  // ✅ التعديل هنا: تحديث الواجهة فوراً بمجرد الرد الناجح من السيرفر وبدون انتظار السوكيت
  const updateCacheWithNewMessage = useCallback(
    (res) => {
      const newMessage = res?.data;
      if (!newMessage) return;

      // 1. تحديث قائمة الرسائل للمحادثة الحالية
      qc.setQueryData(["messages", activeConvId], (old) => {
        if (!old) return old;
        const pages = old.pages ?? [];
        if (pages.length === 0) return old;

        // منع التكرار إذا كانت السوكيت قد أضافتها بالفعل
        const exists = pages.some((p) =>
          p.data?.some((m) => m._id === newMessage._id),
        );
        if (exists) return old;

        return {
          ...old,
          pages: [
            { ...pages[0], data: [...(pages[0].data || []), newMessage] },
            ...pages.slice(1),
          ],
        };
      });

      // 2. تحديث قائمة المحادثات (الجانبية) لتصعد للأعلى مع إظهار آخر رسالة
      qc.setQueryData(["conversations"], (old) => {
        if (!old?.data) return old;
        const updatedData = old.data.map((c) =>
          c._id === activeConvId
            ? {
                ...c,
                lastMessage: newMessage,
                lastMessageAt: newMessage.createdAt,
              }
            : c,
        );
        return {
          ...old,
          data: updatedData.sort(
            (a, b) =>
              new Date(b.lastMessageAt || b.createdAt) -
              new Date(a.lastMessageAt || a.createdAt),
          ),
        };
      });
    },
    [qc, activeConvId],
  );

  // ── Mutations ───────────────────────────────────
  const sendText = useMutation({
    mutationFn: (vars) => sendTextMessage(vars),
    onSuccess: (res) => {
      updateCacheWithNewMessage(res);
    },
  });

  const sendMedia = useMutation({
    mutationFn: (vars) => sendMediaMessage(vars),
    onSuccess: (res) => {
      updateCacheWithNewMessage(res);
    },
  });

  const editMsg = useMutation({
    mutationFn: (vars) => editMessage(vars),
    onSuccess: (res) => {
      qc.setQueryData(["messages", activeConvId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data?.map((m) =>
              m._id === res.data._id ? res.data : m,
            ),
          })),
        };
      });
      onCancelEdit();
    },
  });

  const isSending =
    sendText.isPending || sendMedia.isPending || editMsg.isPending;

  // ── File ────────────────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
      isImage: f.type.startsWith("image/"),
    });
    e.target.value = "";
  };

  const clearPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    };
  }, [preview?.url]);

  // ── Typing ──────────────────────────────────────
  const handleChange = (e) => {
    setText(e.target.value);
    onTyping();
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // ── Send ────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (isSending || !activeConvId) return;

    if (editingMsg) {
      if (!text.trim()) return;
      editMsg.mutate(
        { messageId: editingMsg._id, text: text.trim() },
        {
          onSuccess: () => {
            setText("");
            resetTextareaHeight();
          },
        },
      );
      return;
    }

    if (preview) {
      const fd = new FormData();
      fd.append("file", preview.file);
      if (text.trim()) fd.append("text", text.trim());
      if (replyTo) fd.append("replyTo", replyTo._id);
      sendMedia.mutate(
        { conversationId: activeConvId, formData: fd },
        {
          onSuccess: () => {
            setText("");
            resetTextareaHeight();
            clearPreview();
            onClearReply?.();
          },
        },
      );
      return;
    }

    if (!text.trim()) return;
    sendText.mutate(
      {
        conversationId: activeConvId,
        text: text.trim(),
        replyTo: replyTo?._id,
      },
      {
        onSuccess: () => {
          setText("");
          resetTextareaHeight();
          onClearReply?.();
        },
      },
    );
  }, [isSending, activeConvId, text, preview, editingMsg, replyTo]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  React.useEffect(() => {
    if (editingMsg) setText(editingMsg.content?.text ?? "");
    else setText("");
  }, [editingMsg]);

  return (
    <div className="bg-white border-t border-[#E8E8E8] px-4 py-3 shrink-0">
      {replyTo && !editingMsg && (
        <div
          className="flex items-center justify-between mb-2 px-3 py-2
                        bg-background-primary rounded-lg border-r-2 border-primary">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary font-bold mb-0.5">
              ردًّا على
            </p>
            <p className="text-xs text-text-secondary truncate">
              {replyTo.content?.text ??
                (replyTo.type === "image" ? (
                  <span className="flex items-center gap-1">
                    <Camera size={12} /> صورة
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <File size={12} /> ملف
                  </span>
                ))}
            </p>
          </div>
          <button
            onClick={onClearReply}
            className="mr-2 text-text-secondary hover:text-accent-red">
            <X className="size-4" />
          </button>
        </div>
      )}

      {editingMsg && (
        <div
          className="flex items-center justify-between mb-2 px-3 py-2
                        bg-yellow-50 rounded-lg border-r-2 border-yellow-400">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-yellow-600 font-bold mb-0.5">
              تعديل الرسالة
            </p>
            <p className="text-xs text-text-secondary truncate">
              {editingMsg.content?.text}
            </p>
          </div>
          <button
            onClick={onCancelEdit}
            className="mr-2 text-text-secondary hover:text-accent-red">
            <X className="size-4" />
          </button>
        </div>
      )}

      {preview && (
        <div className="mb-2 relative inline-block">
          {preview.isImage ? (
            <img
              src={preview.url}
              alt=""
              className="h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-background-primary rounded-lg text-sm text-primary">
              <Paperclip className="size-4" />
              <span className="truncate max-w-[200px]">{preview.name}</span>
            </div>
          )}
          <button
            onClick={clearPreview}
            className="absolute -top-1.5 -left-1.5 size-5 bg-accent-red text-white
                       rounded-full flex items-center justify-center">
            <X className="size-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={editingMsg ? "عدِّل الرسالة..." : "اكتب رسالة..."}
          className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm
                     bg-background border border-[#E8E8E8] text-text
                     placeholder:text-text-secondary/60
                     focus:border-primary focus:outline-none transition-colors
                     max-h-28 leading-relaxed no-scrollbar"
          style={{ height: "auto" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 112) + "px";
          }}
        />
        {!editingMsg && (
          <>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleFile}
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="size-10 shrink-0 flex items-center justify-center rounded-xl
                         bg-background border border-[#E8E8E8]
                         text-text-secondary hover:text-primary hover:bg-background-primary
                         transition-colors"
              title="إرفاق ملف">
              <Paperclip className="size-4" />
            </button>
          </>
        )}
        <button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !preview)}
          className="size-10 shrink-0 flex items-center justify-center rounded-xl
                     bg-primary text-white
                     disabled:opacity-40 hover:bg-background-secondary
                     active:scale-95 transition-all shadow-sm"
          title="إرسال">
          {isSending ? (
            <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="size-4 rotate" />
          )}
        </button>
      </div>
    </div>
  );
}
