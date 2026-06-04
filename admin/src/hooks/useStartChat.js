/**
 * useStartChat.js
 *
 * Hook مخصص لبدء محادثة مع أي مستخدم من أي صفحة.
 *
 * الاستخدام:
 *   const { startChat, isLoading } = useStartChat();
 *   <button onClick={() => startChat({ participantId: doctor._id, participantRole: "doctor" })}>
 *     <MessageCircle />
 *   </button>
 *
 * ما يفعله:
 *   1. يستدعي POST /api/chats/conversations
 *   2. إذا المحادثة موجودة مسبقاً — Backend يرجعها مباشرة
 *   3. ينتقل لـ /chats مع state يحتوي conversationId
 *      → ChatsPage تقرأ الـ state وتفتح المحادثة مباشرة
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { createConversation } from "../services/chatService.js";

export const useStartChat = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ participantId, participantRole }) =>
      createConversation({ participantId, participantRole }),

    onSuccess: (res) => {
      const conversationId = res?.data?.data?._id;
      if (!conversationId) return;

      // تحديث cache قائمة المحادثات إن كانت موجودة
      qc.invalidateQueries({ queryKey: ["conversations"] });

      // الانتقال لصفحة الشات مع conversationId
      navigate("/chats", {
        state: { openConversationId: conversationId },
      });
    },

    onError: (err) => {
      console.error("[useStartChat]", err.message);
    },
  });

  return {
    startChat: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
