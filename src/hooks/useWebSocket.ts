"use client";

import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string | null, pollId: string) {
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    ws.current = new WebSocket(url);
    ws.current.onopen = () => setIsConnected(true);
    ws.current.onmessage = (event) => {
      setLastMessage(JSON.parse(event.data));
    };
    ws.current.onclose = () => setIsConnected(false);
    ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
    }
    
    // MOCK: Simulate server sending updates for this specific poll
    const interval = setInterval(() => {
        const mockUpdate = {
            type: "vote_update",
            poll_id: pollId,
            results: [
                { id: "opt1", vote_count: 15 + Math.floor(Math.random() * 5) },
                { id: "opt2", vote_count: 32 + Math.floor(Math.random() * 5) },
                { id: "opt3", vote_count: 8 + Math.floor(Math.random() * 5) },
                { id: "opt4", vote_count: 12 + Math.floor(Math.random() * 5) },
            ]
        };
        if(ws.current?.readyState === WebSocket.OPEN) {
            // Directly set message to simulate receiving it
            setLastMessage(mockUpdate);
        }
    }, 3000);

    return () => {
      clearInterval(interval);
      ws.current?.close();
    };
  }, [url, pollId]);

  return { lastMessage, isConnected };
}
