"use client";

import { useEffect, useState, useRef } from 'react';

export function useWebSocket(url: string | null) {
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) {
      if(ws.current) {
        ws.current.close();
        ws.current = null;
        setIsConnected(false);
      }
      return;
    };

    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    }
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    }
    ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
    }
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (e) {
        console.error("Failed to parse websocket message:", e);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return { lastMessage, isConnected };
}
