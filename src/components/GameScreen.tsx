"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Difficulty, DIFFICULTY_CONFIGS, ChatWindow, GameResult, ChatMessage } from "@/lib/types";
import { generateChats, calculateRating, formatTime } from "@/lib/gameUtils";
import ChatWindowPanel from "./ChatWindowPanel";

interface GameScreenProps {
  difficulty: Difficulty;
  onGameEnd: (result: GameResult) => void;
}

export default function GameScreen({ difficulty, onGameEnd }: GameScreenProps) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const [chats, setChats] = useState<ChatWindow[]>(() => generateChats(config.chatCount));
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds);
  const [score, setScore] = useState(0);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const gameEndedRef = useRef(false);
  const chatsRef = useRef<ChatWindow[]>([]);
  const responseTimes = useRef<number[]>([]);
  const lastMessageTime = useRef<Record<string, number>>({});
  const timeLeftRef = useRef(config.durationSeconds);

  // Keep ref in sync
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Impatience ticker — every 30s, customers waiting for a reply get more impatient
  useEffect(() => {
    const interval = setInterval(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.resolved || c.isWaiting) return c;
          const lastMsg = c.messages[c.messages.length - 1];
          if (lastMsg?.role === "assistant") {
            return { ...c, impatience: c.impatience + 1 };
          }
          return c;
        })
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const triggerGameEnd = useCallback(() => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;

    const current = chatsRef.current;
    const resolved = current.filter((c) => c.resolved).length;
    const total = current.length;
    const avgMs =
      responseTimes.current.length > 0
        ? responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length
        : 30000;

    const { rating, message } = calculateRating(resolved, total, avgMs);
    onGameEnd({
      difficulty,
      resolved,
      total,
      durationSeconds: config.durationSeconds - timeLeftRef.current,
      averageResponseTimeMs: avgMs,
      rating,
      ratingMessage: message,
    });
  }, [config.durationSeconds, difficulty, onGameEnd]);

  // End on time up
  useEffect(() => {
    if (timeLeft === 0) triggerGameEnd();
  }, [timeLeft, triggerGameEnd]);

  // End when all resolved
  useEffect(() => {
    if (chats.length > 0 && chats.every((c) => c.resolved)) {
      triggerGameEnd();
    }
  }, [chats, triggerGameEnd]);

  const sendMessage = useCallback(async (chatId: string, text: string) => {
    if (gameEndedRef.current) return;

    const now = Date.now();
    if (lastMessageTime.current[chatId]) {
      responseTimes.current.push(now - lastMessageTime.current[chatId]);
    }

    // Add player message, mark waiting
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, { role: "user" as const, content: text }], isWaiting: true, isTyping: false, impatience: 0 }
          : c
      )
    );

    await new Promise((r) => setTimeout(r, 500));

    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, isTyping: true } : c))
    );

    try {
      // Read current messages from ref to avoid stale closure
      const chat = chatsRef.current.find((c) => c.id === chatId);
      if (!chat) return;

      // Build the full message history including the just-sent message
      const apiMessages: ChatMessage[] = [
        ...chat.messages.filter((m) => m.role !== "user" || m.content !== text), // avoid duplication if already set
        { role: "user" as const, content: text },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          persona: chat.persona,
          problem: chat.problem,
          impatience: chat.impatience,
        }),
      });

      const data = await res.json();
      lastMessageTime.current[chatId] = Date.now();

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          return {
            ...c,
            messages: [...c.messages, { role: "assistant" as const, content: data.message }],
            isTyping: false,
            isWaiting: false,
            resolved: data.resolved ?? false,
            resolvedAt: data.resolved ? Date.now() : undefined,
          };
        })
      );

      if (data.resolved) {
        setScore((s) => s + 1);
      }
    } catch {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                isTyping: false,
                isWaiting: false,
                messages: [...c.messages, { role: "assistant" as const, content: "sorry give me a sec..." }],
              }
            : c
        )
      );
    }
  }, []);

  const timerColor =
    timeLeft > 60 ? "text-gray-800" : timeLeft > 30 ? "text-yellow-600" : "text-red-500";
  const resolvedCount = chats.filter((c) => c.resolved).length;

  const gridClass =
    chats.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : chats.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-2";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-pink-500 font-black text-lg hidden sm:block">ChatGauntlet</span>
          <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-full">
            <span className="text-pink-400 text-xs">Score</span>
            <span className="text-pink-600 font-black text-sm">{score}</span>
          </div>
        </div>

        <div className={`font-black text-2xl tabular-nums ${timerColor}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
          <span className="text-gray-400 text-xs">Chats</span>
          <span className="text-gray-700 font-black text-sm">
            {resolvedCount}/{chats.length}
          </span>
        </div>
      </div>

      {/* Chat grid */}
      <div
        className={`flex-1 p-3 sm:p-4 grid gap-3 sm:gap-4 ${gridClass}`}
        style={{ gridAutoRows: "minmax(300px, 1fr)" }}
      >
        {chats.map((chat) => (
          <ChatWindowPanel
            key={chat.id}
            chat={chat}
            onSendMessage={sendMessage}
            isActive={activeChat === chat.id}
            onFocus={setActiveChat}
          />
        ))}
      </div>
    </div>
  );
}
