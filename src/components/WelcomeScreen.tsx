"use client";

import { useState } from "react";
import { Difficulty, DIFFICULTY_CONFIGS } from "@/lib/types";
import { MAX_SESSIONS } from "@/lib/rateLimit";

const DIFFICULTY_ICONS: Record<string, string> = {
  rookie: "🌱",
  agent: "⚡",
  gauntlet: "🔥",
};

interface WelcomeScreenProps {
  sessionsRemaining: number;
  onStart: (difficulty: Difficulty) => void;
}

export default function WelcomeScreen({ sessionsRemaining, onStart }: WelcomeScreenProps) {
  const [selected, setSelected] = useState<Difficulty>("rookie");
  const canPlay = sessionsRemaining > 0;

  return (
    <div className="min-h-screen arcade-grid flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-arcade-pink opacity-[0.04] blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-10 animate-bounce-in">
        <div className="font-arcade text-[11px] text-arcade-pink tracking-widest mb-6 opacity-70">
          ── KAJABI SUPPORT TRAINING ──
        </div>
        <h1 className="font-arcade text-3xl sm:text-5xl text-arcade-pink leading-tight mb-5 text-glow-pink">
          CHAT<br />GAUNTLET
        </h1>
        <p className="font-body text-arcade-dim text-base sm:text-lg tracking-wide">
          Handle real Kajabi customer scenarios
        </p>
      </div>

      {/* Session hearts */}
      <div className="flex items-center gap-3 mb-8">
        {Array.from({ length: MAX_SESSIONS }, (_, i) => (
          <span
            key={i}
            className={`text-3xl transition-all duration-300 ${
              i < sessionsRemaining
                ? "text-arcade-pink drop-shadow-[0_0_8px_rgba(255,45,120,0.9)]"
                : "text-arcade-border opacity-30"
            }`}
          >
            ♥
          </span>
        ))}
        <span className="font-body text-arcade-dim text-xs ml-1">
          {canPlay
            ? `${sessionsRemaining} of ${MAX_SESSIONS} this week`
            : "Come back Monday"}
        </span>
      </div>

      {/* Difficulty selector */}
      {canPlay && (
        <div className="w-full max-w-md mb-8">
          <p className="font-arcade text-[9px] text-arcade-dim text-center mb-5 tracking-widest">
            SELECT LEVEL
          </p>
          <div className="flex flex-col gap-3">
            {(
              Object.entries(DIFFICULTY_CONFIGS) as [
                Difficulty,
                (typeof DIFFICULTY_CONFIGS)[Difficulty]
              ][]
            ).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all text-left active:scale-[0.97] ${
                  selected === key
                    ? "border-arcade-pink bg-arcade-card shadow-pink-glow scale-[1.02]"
                    : "border-arcade-border bg-arcade-card hover:border-arcade-pink/40 hover:scale-[1.01]"
                }`}
              >
                <span className="text-2xl shrink-0">{DIFFICULTY_ICONS[key]}</span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-arcade text-xs mb-1 ${
                      selected === key ? "text-arcade-pink" : "text-arcade-text"
                    }`}
                  >
                    {cfg.label.toUpperCase()}
                  </p>
                  <p className="font-body text-xs text-arcade-dim">{cfg.description}</p>
                </div>
                <span
                  className={`text-arcade-pink text-lg transition-opacity ${
                    selected === key ? "opacity-100" : "opacity-0"
                  }`}
                >
                  ▶
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Start button */}
      {canPlay && (
        <button
          onClick={() => onStart(selected)}
          className="font-arcade text-xs sm:text-sm text-white bg-arcade-pink px-10 py-4 rounded-xl border-2 border-arcade-pink animate-glow-pulse active:scale-[0.97] transition-all hover:brightness-110 shadow-pink-glow-lg"
        >
          START TRAINING
        </button>
      )}

      {/* No sessions locked state */}
      {!canPlay && (
        <div className="text-center border-2 border-arcade-border bg-arcade-card rounded-2xl p-10 max-w-sm animate-bounce-in">
          <div className="text-6xl mb-5">🔒</div>
          <p className="font-arcade text-xs text-arcade-pink mb-4">LOCKED</p>
          <p className="font-body text-arcade-dim text-sm leading-relaxed">
            You&apos;ve used all {MAX_SESSIONS} training sessions this week.
            <br />
            <span className="text-arcade-text font-semibold">Come back Monday</span> to keep
            practicing!
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="mt-12 font-body text-xs text-arcade-border text-center">
        AI Kajabi customers powered by GPT-4o mini · Sessions reset every Monday
      </p>
    </div>
  );
}
