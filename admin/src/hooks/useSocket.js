/**
 * useSocket.js
 * يُنشئ اتصال Socket.IO ويحافظ عليه طوال عمر المكوّن
 * ✅ إصلاح: socket يُخزَّن في state لضمان تحديث الـ Hooks التي تعتمد عليه
 */
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

export const useSocket = (token, sessionId) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !sessionId) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token, sessionId },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));
    newSocket.on("connect_error", (e) => console.error("[socket]", e.message));

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token, sessionId]);

  return { socket, connected };
};
