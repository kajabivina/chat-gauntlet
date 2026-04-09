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
  const [resolving, setResolving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.isTyping]);

  useEffect(() => {
    if (chat.resolved && !resolving) {
      setResolving(true);
    }
  }, [chat.resolved, resolving]);

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

  return (
    <div
      onClick={() => onFocus(chat.id)}
      className={`flex flex-col rounded-2xl border-2 transition-all duration-200 overflow-hidden h-full ${
        chat.resolved
          ? "border-green-300 bg-green-50 opacity-75"
          : isActive
          ? "border-pink-400 bg-white shadow-lg shadow-pink-100"
          : "border-gray-200 bg-white shadow-sm hover:border-pink-200"
      } ${resolving ? "animate-resolve" : ""}`}
    >
      {/* Header */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b ${
          chat.resolved
            ? "bg-green-100 border-green-200"
            : isActive
            ? "bg-pink-500 border-pink-500"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <span className="text-lg">
          {chat.resolved ? "✅" : PERSONA_EMOJI[chat.persona]}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold truncate ${
              chat.resolved
                ? "text-green-700"
                : isActive
                ? "text-white"
                : "text-gray-700"
            }`}
          >
            {chat.personaLabel}
          </p>
          <p
            className={`text-xs truncate ${
              chat.resolved
                ? "text-green-500"
                : isActive
                ? "text-pink-100"
                : "text-gray-400"
            }`}
          >
            {chat.problemLabel}
          </p>
        </div>
        {chat.resolved && (
          <span className="text-xs font-bold text-green-600 bg-green-200 px-2 py-0.5 rounded-full">
            Resolved ✓
          </span>
        )}
        {!chat.resolved && chat.impatience > 1 && (
          <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
            Impatient!
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {chat.messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-pink-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chat.isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!chat.resolved && (
        <div className="border-t border-gray-100 p-2 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              chat.isWaiting ? "Waiting for customer..." : "Type a reply..."
            }
            disabled={chat.isWaiting}
            rows={2}
            className="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-400 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chat.isWaiting}
            className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 text-white disabled:text-gray-400 px-3 py-2 rounded-xl transition-colors text-sm font-bold shrink-0"
          >
            Send
          </button>
        </div>
      )}

      {chat.resolved && (
        <div className="border-t border-green-200 p-3 text-center text-sm font-semibold text-green-600">
          Chat resolved! Great work ✓
        </div>
      )}
    </div>
  );
}
