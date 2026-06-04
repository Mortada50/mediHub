/**
 * chatService.js
 * جميع طلبات API الخاصة بالمحادثات — تستخدم axios instance
 */
import api from "../lib/axios.js";

// ── Conversations ──────────────────────────────────────────

export const getConversations = () =>
  api.get("/chats/conversations");

export const getConversation = (conversationId) =>
  api.get(`/chats/conversations/${conversationId}`);

export const createConversation = ({ participantId, participantRole }) =>
  api.post("/chats/conversations", { participantId, participantRole });

// ── Messages ───────────────────────────────────────────────

export const getMessages = ({ conversationId, page = 1, limit = 30 }) =>
  api.get(`/chats/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });

export const sendTextMessage = ({ conversationId, text, replyTo }) =>
  api.post(`/chats/conversations/${conversationId}/messages`, {
    text,
    ...(replyTo && { replyTo }),
  });

export const sendMediaMessage = ({ conversationId, formData }) =>
  api.post(`/chats/conversations/${conversationId}/messages/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const markAsRead = (conversationId) =>
  api.post(`/chats/conversations/${conversationId}/read`);

export const getUnreadCount = (conversationId) =>
  api.get(`/chats/conversations/${conversationId}/unread-count`);

export const editMessage = ({ messageId, text }) =>
  api.patch(`/chats/messages/${messageId}`, { text });

export const deleteMessage = ({ messageId, forWho = "me" }) =>
  api.delete(`/chats/messages/${messageId}`, { params: { for: forWho } });
