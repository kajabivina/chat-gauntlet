"use client";

import { GameResult } from "@/lib/types";
import { MAX_SESSIONS } from "@/lib/rateLimit";
import Confetti from "./Confetti";

interface ResultsScreenProps {
  result: GameResult;
  sessionsRemaining: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

const RATING_CONFIG: Record<
  GameResult["rating"],
  { emoji: string; color: string; bg: string; border: string }
> = {
  Legend: { emoji: "🏆", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/40" },
  Pro:    { emoji: "⭐", color: "text-arcade-pink", bg: "bg-arcade-pink/10", border: "border-arcade-pink/40" },
  Agent:  { emoji: "👍", color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/40"  },
  Rookie: { emoji: "💪", color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/40"    },
};

export default function ResultsScreen({
  result,
  sessionsRemaining,
  onPlayAgain,
  onHome,
}: ResultsScreenProps) {
  const pct = Math.round((result.resolved / result.total) * 100);
  const avgSec = Math.round(result.averageResponseTimeMs / 1000);
  const cfg = RATING_CONFIG[result.rating];
  const showConfetti = result.rating === "Legend" || result.rating === "Pro";

  const handleShare = () => {
    const text = `I scored ${result.resolved}/${result.total} on ChatGauntlet — ${result.rating} rating! Can you handle the chaos?`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen arcade-grid flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {showConfetti && <Confetti />}

      {/* Ambient glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-[0.06] ${
        result.rating === "Legend" ? "bg-yellow-400" : "bg-arcade-pink"
      }`} />

      <div className="w-full max-w-md animate-bounce-in relative z-10">
        {/* Achievement badge */}
        <div className={`text-center mb-8 border-2 ${cfg.border} ${cfg.bg} rounded-2xl p-8`}>
          <div className="text-7xl mb-4">{cfg.emoji}</div>
          <div className="font-arcade text-[10px] text-arcade-dim mb-3 tracking-widest">
            ACHIEVEMENT UNLOCKED
          </div>
          <div className={`font-arcade text-2xl sm:text-3xl mb-3 ${cfg.color}`}>
            {result.rating.toUpperCase()}
          </div>
          <p className="font-body text-arcade-dim text-sm">{result.ratingMessage}</p>
        </div>

        {/* Scoreboard */}
        <div className="bg-arcade-card border border-arcade-border rounded-2xl overflow-hidden mb-5">
          <div className="px-5 py-3 border-b border-arcade-border bg-arcade-dark/50">
            <p className="font-arcade text-[9px] text-arcade-dim tracking-widest text-center">
              SCOREBOARD
            </p>
          </div>
          <div className="divide-y divide-arcade-border">
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="font-body text-sm text-arcade-dim">Chats Resolved</span>
              <span className="font-arcade text-sm text-arcade-text">
                {result.resolved}
                <span className="text-arcade-border">/{result.total}</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-3">
              <div className="w-full bg-arcade-border rounded-full h-2">
                <div
                  className="bg-arcade-pink h-2 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="font-body text-[10px] text-arcade-dim mt-1.5 text-right">{pct}%</p>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="font-body text-sm text-arcade-dim">Avg Response Time</span>
              <span className="font-arcade text-sm text-arcade-text">
                {avgSec > 0 ? `${avgSec}s` : "—"}
              </span>
            </div>

            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="font-body text-sm text-arcade-dim">Difficulty</span>
              <span className="font-arcade text-xs text-arcade-text uppercase">
                {result.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Sessions remaining or locked */}
        {sessionsRemaining > 0 ? (
          <div className="flex justify-center gap-1.5 items-center mb-5">
            {Array.from({ length: MAX_SESSIONS }, (_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < sessionsRemaining
                    ? "text-arcade-pink drop-shadow-[0_0_6px_rgba(255,45,120,0.8)]"
                    : "text-arcade-border opacity-30"
                }`}
              >
                ♥
              </span>
            ))}
            <span className="font-body text-xs text-arcade-dim ml-1">
              {sessionsRemaining} session{sessionsRemaining !== 1 ? "s" : ""} left
            </span>
          </div>
        ) : (
          <div className="text-center border border-arcade-border bg-arcade-card rounded-xl p-4 mb-5">
            <span className="text-2xl">🔒</span>
            <p className="font-body text-xs text-arcade-dim mt-2">
              No sessions left — <span className="text-arcade-text font-semibold">come back Monday!</span>
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {sessionsRemaining > 0 && (
            <button
              onClick={onPlayAgain}
              className="w-full font-arcade text-xs text-white bg-arcade-pink py-4 rounded-xl border-2 border-arcade-pink animate-glow-pulse active:scale-[0.97] transition-all hover:brightness-110 shadow-pink-glow"
            >
              PLAY AGAIN
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 font-body text-sm font-semibold text-arcade-pink border-2 border-arcade-pink/40 hover:border-arcade-pink bg-arcade-card py-3 rounded-xl transition-all active:scale-[0.97]"
            >
              Share Score
            </button>
            <button
              onClick={onHome}
              className="flex-1 font-body text-sm font-semibold text-arcade-dim border-2 border-arcade-border hover:border-arcade-dim bg-arcade-card py-3 rounded-xl transition-all active:scale-[0.97]"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
