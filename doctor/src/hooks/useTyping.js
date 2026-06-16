/**
 * useTyping.js
 * يدير حالة "يكتب..." للطرف الآخر ويبث أحداث الكتابة
 */
import { useState, useRef, useCallback, useEffect } from "react";

export const useTyping = ({ socket, activeConvId }) => {
  // { [convId]: bool } — هل الطرف الآخر يكتب في هذه المحادثة؟
  const [typingMap, setTypingMap] = useState({});
  const remoteTypingTimers = useRef(new Map());
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);
  const typingConvRef = useRef(null);

  useEffect(() => {
    const prevConv = typingConvRef.current;
    if (
      prevConv &&
      prevConv !== activeConvId &&
      isTypingRef.current &&
      socket
    ) {
      socket.emit("typing_stop", { conversationId: prevConv });
      isTypingRef.current = false;
      clearTimeout(typingTimer.current);
    }
    typingConvRef.current = activeConvId ?? null;
    return () => clearTimeout(typingTimer.current);
  }, [activeConvId, socket]);

  // الاستماع لأحداث الكتابة القادمة
  const handleTypingEvent = useCallback(({ conversationId, isTyping }) => {
    setTypingMap((prev) => ({ ...prev, [conversationId]: isTyping }));

    // إيقاف تلقائي بعد 3 ثوانٍ كـ fallback
    const prevTimer = remoteTypingTimers.current.get(conversationId);
     if (prevTimer) {
      clearTimeout(prevTimer);
      remoteTypingTimers.current.delete(conversationId);
    }
    if (isTyping) {
      const timer = setTimeout(() => {
        setTypingMap((prev) => ({ ...prev, [conversationId]: false }));
        remoteTypingTimers.current.delete(conversationId);
      }, 3000);
      remoteTypingTimers.current.set(conversationId, timer);
    }
  }, []);

  useEffect(() => {
    return () => {
      remoteTypingTimers.current.forEach(clearTimeout);
      remoteTypingTimers.current.clear();
    };
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
      typingConvRef.current = null;
    }, 1500);
  }, [socket, activeConvId]);

  return { typingMap, handleTypingEvent, emitTyping };
};
