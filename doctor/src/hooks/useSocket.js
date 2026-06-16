/**
 * useSocket.js
 * يُنشئ اتصال Socket.IO ويحافظ عليه طوال عمر المكوّن
 */
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

export const useSocket = (token, sessionId) => {
  const socketRef    = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !sessionId) return;
    
    const socket = io(SOCKET_URL, {
      auth: { token, sessionId },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect",       () => setConnected(true));
    socket.on("disconnect",    () => setConnected(false));
    socket.on("connect_error", (e) => console.error("[socket]", e.message));

    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token, sessionId]);

  return { socket: socketRef.current, connected };
};
