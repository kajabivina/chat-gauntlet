"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Difficulty,
  DIFFICULTY_CONFIGS,
  ChatWindow,
  GameResult,
  ChatMessage,
} from "@/lib/types";
import { generateChats, calculateRating, calculatePoints, formatTime } from "@/lib/gameUtils";
import ChatWindowPanel from "./ChatWindowPanel";
import MusicPlayer from "./MusicPlayer";

interface GameScreenProps {
  difficulty: Difficulty;
  onGameEnd: (result: GameResult) => void;
}

const PERSONA_EMOJI: Record<string, string> = {
  frustrated_tech: "😤",
  confused_elderly: "😕",
  impatient_business: "⏱️",
  anxious_buyer: "😰",
  angry_billing: "😠",
};

export default function GameScreen({ difficulty, onGameEnd }: GameScreenProps) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const [chats, setChats] = useState<ChatWindow[]>(() => generateChats(config.chatCount));
  const [timeLeft, setTimeLeft] = useState(config.durationSeconds);
  const [score, setScore] = useState(0);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [floaters, setFloaters] = useState<{ id: number; points: number }[]>([]);
  const scoreRef = useRef(0);
  const gameEndedRef = useRef(false);
  const chatsRef = useRef<ChatWindow[]>([]);
  const responseTimes = useRef<number[]>([]);
  const lastMessageTime = useRef<Record<string, number>>({});
  const timeLeftRef = useRef(config.durationSeconds);
  const activeMobileTabRef = useRef(0);

  useEffect(() => { chatsRef.current = chats; }, [chats]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { activeMobileTabRef.current = activeMobileTab; }, [activeMobileTab]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Impatience ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setChats((prev) =>
        prev.map((c) => {
          if (c.resolved || c.isWaiting) return c;
          const lastMsg = c.messages[c.messages.length - 1];
          if (lastMsg?.role === "assistant") return { ...c, impatience: c.impatience + 1 };
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
      score: scoreRef.current,
      maxScore: total * 10,
      durationSeconds: config.durationSeconds - timeLeftRef.current,
      averageResponseTimeMs: avgMs,
      rating,
      ratingMessage: message,
    });
  }, [config.durationSeconds, difficulty, onGameEnd]);

  useEffect(() => { if (timeLeft === 0) triggerGameEnd(); }, [timeLeft, triggerGameEnd]);
  useEffect(() => {
    if (chats.length > 0 && chats.every((c) => c.resolved)) triggerGameEnd();
  }, [chats, triggerGameEnd]);

  const handleMobileTabChange = (idx: number) => {
    setActiveMobileTab(idx);
    const chatId = chatsRef.current[idx]?.id;
    if (chatId) setUnreadIds((prev) => { const s = new Set(prev); s.delete(chatId); return s; });
  };

  const sendMessage = useCallback(async (chatId: string, text: string) => {
    if (gameEndedRef.current) return;
    const now = Date.now();
    if (lastMessageTime.current[chatId]) {
      responseTimes.current.push(now - lastMessageTime.current[chatId]);
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, { role: "user" as const, content: text }], isWaiting: true, isTyping: false, impatience: 0 }
          : c
      )
    );

    await new Promise((r) => setTimeout(r, 500));
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, isTyping: true } : c)));

    try {
      const chat = chatsRef.current.find((c) => c.id === chatId);
      if (!chat) return;

      const apiMessages: ChatMessage[] = [
        ...chat.messages.filter((m) => m.role !== "user" || m.content !== text),
        { role: "user" as const, content: text },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, persona: chat.persona, problem: chat.problem, impatience: chat.impatience }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat error");
      lastMessageTime.current[chatId] = Date.now();

      // Mark unread if not the active mobile tab
      const chatIdx = chatsRef.current.findIndex((c) => c.id === chatId);
      if (chatIdx !== -1 && chatIdx !== activeMobileTabRef.current) {
        setUnreadIds((prev) => { const s = new Set(prev); s.add(chatId); return s; });
      }

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
        const agentMessages = apiMessages.filter((m) => m.role === "user").length;
        const points = calculatePoints(agentMessages);
        setScore((s) => s + points);
        const floaterId = Date.now();
        setFloaters((prev) => [...prev, { id: floaterId, points }]);
        setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== floaterId)), 900);
      }
    } catch {
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, isTyping: false, isWaiting: false, messages: [...c.messages, { role: "assistant" as const, content: "sorry give me a sec..." }] }
            : c
        )
      );
    }
  }, []);

  const timerPct = (timeLeft / config.durationSeconds) * 100;
  const isUrgent = timeLeft <= 30;
  const isWarning = timeLeft <= 60;
  const resolvedCount = chats.filter((c) => c.resolved).length;

  return (
    <div className="min-h-screen arcade-grid flex flex-col">
      {/* Top bar */}
      <div className="bg-arcade-dark/90 border-b border-arcade-border px-4 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
        {/* Difficulty label */}
        <div className="flex items-center gap-2">
          <span className="font-arcade text-[8px] text-arcade-dim hidden sm:block">
            {difficulty.toUpperCase()}
          </span>
          <div className="bg-arcade-card border border-arcade-border px-3 py-1.5 rounded-lg">
            <span className="font-body text-xs text-arcade-dim">Chats </span>
            <span className="font-arcade text-xs text-arcade-text">
              {resolvedCount}/{chats.length}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className={`font-arcade text-2xl sm:text-3xl tabular-nums transition-colors ${
          isUrgent ? "text-red-500 animate-timer-pulse" : isWarning ? "text-yellow-400" : "text-arcade-text"
        }`}>
          {formatTime(timeLeft)}
        </div>

        {/* Score + Music */}
        <div className="flex items-center gap-3">
          <MusicPlayer />
          <div className="relative">
            <div className="bg-arcade-card border border-arcade-pink/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="font-body text-xs text-arcade-dim">Score</span>
              <span className="font-arcade text-sm text-arcade-pink">{score}</span>
            </div>
            {floaters.map((f) => (
              <span key={f.id} className="score-floater font-arcade text-xs text-arcade-pink">
                +{f.points}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1 bg-arcade-border w-full">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? "bg-red-500 shadow-red-glow" : isWarning ? "bg-yellow-400" : "bg-arcade-pink"
          }`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Mobile tab bar */}
      <div className="flex sm:hidden border-b border-arcade-border bg-arcade-dark/80 sticky top-[57px] z-10">
        {chats.map((chat, idx) => (
          <button
            key={chat.id}
            onClick={() => handleMobileTabChange(idx)}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2.5 px-1 transition-colors ${
              activeMobileTab === idx
                ? "border-b-2 border-arcade-pink text-arcade-pink"
                : "text-arcade-dim border-b-2 border-transparent"
            }`}
          >
            <span className="text-base">{chat.resolved ? "✅" : PERSONA_EMOJI[chat.persona]}</span>
            <span className="font-body text-[9px] truncate max-w-full px-1">
              {chat.personaLabel.split(" ")[0]}
            </span>
            {unreadIds.has(chat.id) && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-arcade-pink rounded-full shadow-pink-glow" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile: single chat */}
      <div className="flex sm:hidden flex-1 p-3" style={{ minHeight: 0 }}>
        {chats[activeMobileTab] && (
          <ChatWindowPanel
            key={chats[activeMobileTab].id}
            chat={chats[activeMobileTab]}
            onSendMessage={sendMessage}
            isActive={true}
            onFocus={() => {}}
          />
        )}
      </div>

      {/* Desktop: chat grid */}
      <div
        className="hidden sm:grid flex-1 p-4 gap-4 grid-cols-2"
        style={{ gridAutoRows: "minmax(320px, 1fr)" }}
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
