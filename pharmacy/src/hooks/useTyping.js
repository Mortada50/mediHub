import { useState, useRef, useCallback, useEffect } from "react";

export const useTyping = ({ socket, activeConvId, myId, receiverId }) => {
  const [typingMap, setTypingMap] = useState({});
  const remoteTypingTimers = useRef(new Map());
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);
  const lastEmitTime = useRef(0);
  const typingConvRef = useRef(null);

  useEffect(() => {
    const prevConv = typingConvRef.current;
    if (
      prevConv &&
      prevConv !== activeConvId &&
      isTypingRef.current &&
      socket
    ) {
      socket.emit("typing_stop", { conversationId: prevConv, receiverId });
      isTypingRef.current = false;
      clearTimeout(typingTimer.current);
    }
    typingConvRef.current = activeConvId ?? null;
    return () => clearTimeout(typingTimer.current);
  }, [activeConvId, socket, receiverId]);

  const handleTypingEvent = useCallback(
    ({ conversationId, userId, isTyping }) => {
      if (userId && myId && userId.toString() === myId.toString()) return;

      setTypingMap((prev) => ({ ...prev, [conversationId]: isTyping }));

      const prevTimer = remoteTypingTimers.current.get(conversationId);
      if (prevTimer) {
        clearTimeout(prevTimer);
        remoteTypingTimers.current.delete(conversationId);
      }

      if (isTyping) {
        // ✅ حل المشكلة 4: تمديد وقت إخفاء المؤشر طالما أن المستخدم يستمر بالكتابة
        const timer = setTimeout(() => {
          setTypingMap((prev) => ({ ...prev, [conversationId]: false }));
          remoteTypingTimers.current.delete(conversationId);
        }, 3000);
        remoteTypingTimers.current.set(conversationId, timer);
      }
    },
    [myId],
  );

  useEffect(() => {
    return () => {
      remoteTypingTimers.current.forEach(clearTimeout);
      remoteTypingTimers.current.clear();
    };
  }, []);

  const emitTyping = useCallback(() => {
    if (!socket || !activeConvId) return;

    const now = Date.now();
    // ✅ حل المشكلة 4: إرسال الإشعار كل ثانيتين للحفاظ على المؤشر ظاهراً
    if (!isTypingRef.current || now - lastEmitTime.current > 2000) {
      socket.emit("typing_start", { conversationId: activeConvId, receiverId });
      isTypingRef.current = true;
      lastEmitTime.current = now;
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: activeConvId, receiverId });
      isTypingRef.current = false;
      typingConvRef.current = null;
    }, 2000);
  }, [socket, activeConvId, receiverId]);

  return { typingMap, handleTypingEvent, emitTyping };
};
