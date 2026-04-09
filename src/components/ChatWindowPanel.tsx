"use client";

import { useRef, useEffect, useState } from "react";
import { ChatWindow } from "@/lib/types";

interface ChatWindowPanelProps {
  chat: ChatWindow;
  onSendMessage: (chatId: string, message: string) => void;
  isActive: boolean;
  onFocus: (chatId: string) => void;
}

const PERSONA_EMOJI: Record<string, string> = {
  frustrated_tech: "😤",
  confused_elderly: "😕",
  impatient_business: "⏱️",
  anxious_buyer: "😰",
  angry_billing: "😠",
};

export default function ChatWindowPanel({
  chat,
  onSendMessage,
  isActive,
  onFocus,
}: ChatWindowPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.isTyping]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || chat.resolved || chat.isWaiting) return;
    onSendMessage(chat.id, trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isImpatient = !chat.resolved && chat.impatience > 1;

  return (
    <div
      onClick={() => onFocus(chat.id)}
      className={`flex flex-col rounded-xl border-2 overflow-hidden h-full transition-all duration-200 ${
        chat.resolved
          ? "border-green-500/40 bg-arcade-card opacity-70 animate-resolve-pop"
          : isImpatient
          ? "border-red-500 bg-arcade-card animate-border-flash"
          : isActive
          ? "border-arcade-pink bg-arcade-card shadow-pink-glow"
          : "border-arcade-border bg-arcade-card hover:border-arcade-pink/30"
      }`}
    >
      {/* Pink top accent bar */}
      <div
        className={`h-0.5 w-full transition-colors ${
          chat.resolved
            ? "bg-green-500"
            : isImpatient
            ? "bg-red-500"
            : "bg-arcade-pink"
        }`}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-arcade-border bg-arcade-dark/50">
        <div className="relative shrink-0">
          <span className="text-xl">{PERSONA_EMOJI[chat.persona]}</span>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-arcade-card ${
              chat.resolved
                ? "bg-green-500"
                : chat.isWaiting || chat.isTyping
                ? "bg-yellow-400"
                : "bg-green-400"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-xs font-bold text-arcade-text truncate">
            {chat.personaLabel}
          </p>
          <p className="font-body text-[10px] text-arcade-dim truncate">{chat.problemLabel}</p>
        </div>
        {chat.resolved && (
          <span className="font-body text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full shrink-0">
            RESOLVED ✓
          </span>
        )}
        {isImpatient && (
          <span className="font-body text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full shrink-0 animate-timer-pulse">
            IMPATIENT!
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-hide">
        {chat.messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl font-body text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-arcade-pink text-white rounded-br-sm"
                  : "bg-[#2A2A2A] text-arcade-text rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chat.isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#2A2A2A] px-4 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5 items-center h-4">
                <span className="w-1.5 h-1.5 bg-arcade-dim rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-arcade-dim rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-arcade-dim rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!chat.resolved && (
        <div className="border-t border-arcade-border p-2.5 flex gap-2 items-end bg-arcade-dark/30">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={chat.isWaiting ? "Waiting for customer..." : "Type a reply..."}
            disabled={chat.isWaiting}
            rows={2}
            className="flex-1 resize-none font-body text-sm px-3 py-2 rounded-lg bg-arcade-card border border-arcade-border text-arcade-text placeholder-arcade-dim/50 focus:outline-none focus:border-arcade-pink disabled:opacity-40 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chat.isWaiting}
            className="bg-arcade-pink hover:brightness-110 disabled:opacity-30 text-white px-4 py-2 rounded-lg transition-all text-sm font-body font-bold shrink-0 active:scale-95"
          >
            SEND
          </button>
        </div>
      )}

      {chat.resolved && (
        <div className="border-t border-green-500/20 p-3 text-center font-body text-xs font-bold text-green-400 bg-green-500/5">
          ✓ Chat resolved — great work!
        </div>
      )}
    </div>
  );
}
