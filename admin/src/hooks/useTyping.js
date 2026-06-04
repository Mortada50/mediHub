/**
 * useTyping.js
 * يدير حالة "يكتب..." للطرف الآخر ويبث أحداث الكتابة
 */
import { useState, useRef, useCallback } from "react";

export const useTyping = ({ socket, activeConvId }) => {
  // { [convId]: bool } — هل الطرف الآخر يكتب في هذه المحادثة؟
  const [typingMap, setTypingMap] = useState({});
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  // الاستماع لأحداث الكتابة القادمة
  const handleTypingEvent = useCallback(({ conversationId, isTyping }) => {
    setTypingMap((prev) => ({ ...prev, [conversationId]: isTyping }));

    // إيقاف تلقائي بعد 3 ثوانٍ كـ fallback
    if (isTyping) {
      setTimeout(() => {
        setTypingMap((prev) => ({ ...prev, [conversationId]: false }));
      }, 3000);
    }
  }, []);

  // إرسال حدث الكتابة (مع debounce)
  const emitTyping = useCallback(() => {
    if (!socket || !activeConvId) return;

    if (!isTypingRef.current) {
      socket.emit("typing_start", { conversationId: activeConvId });
      isTypingRef.current = true;
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: activeConvId });
      isTypingRef.current = false;
    }, 1500);
  }, [socket, activeConvId]);

  return { typingMap, handleTypingEvent, emitTyping };
};
