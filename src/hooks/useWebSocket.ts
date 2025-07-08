"use client";

import { useEffect, useState } from 'react';

export function useWebSocket(url: string | null, pollId: string) {
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!url) return;

    // MOCK: Simulate connection and server sending updates for this specific poll
    setIsConnected(true);
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
        // Directly set message to simulate receiving it
        setLastMessage(mockUpdate);
    }, 3000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [url, pollId]);

  return { lastMessage, isConnected };
}
