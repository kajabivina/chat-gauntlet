"use client";

import { useState } from "react";
import { Difficulty, DIFFICULTY_CONFIGS } from "@/lib/types";
import { MAX_SESSIONS } from "@/lib/rateLimit";

interface WelcomeScreenProps {
  sessionsRemaining: number;
  onStart: (difficulty: Difficulty) => void;
}

export default function WelcomeScreen({
  sessionsRemaining,
  onStart,
}: WelcomeScreenProps) {
  const [selected, setSelected] = useState<Difficulty>("rookie");

  const canPlay = sessionsRemaining > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10 animate-bounce-in">
        <div className="inline-block bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
          Training Simulator
        </div>
        <h1 className="text-5xl sm:text-7xl font-black text-pink-500 leading-none mb-3">
          Chat
          <br />
          Gauntlet
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl font-medium">
          Train before the real thing.
        </p>
      </div>

      {/* Sessions remaining */}
      <div
        className={`mb-8 px-5 py-3 rounded-full border-2 text-sm font-semibold ${
          canPlay
            ? "border-pink-200 bg-pink-50 text-pink-600"
            : "border-red-200 bg-red-50 text-red-600"
        }`}
      >
        {canPlay ? (
          <>
            {sessionsRemaining} of {MAX_SESSIONS} training sessions left this
            week
          </>
        ) : (
          <>
            You&apos;ve used your {MAX_SESSIONS} training sessions this week.
            Come back Monday to keep practicing!
          </>
        )}
      </div>

      {/* Difficulty selector */}
      {canPlay && (
        <div className="w-full max-w-md mb-8">
          <p className="text-center text-gray-400 text-sm uppercase tracking-widest font-semibold mb-4">
            Choose difficulty
          </p>
          <div className="flex flex-col gap-3">
            {(Object.entries(DIFFICULTY_CONFIGS) as [Difficulty, typeof DIFFICULTY_CONFIGS[Difficulty]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-semibold text-left ${
                    selected === key
                      ? "border-pink-500 bg-pink-500 text-white shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50"
                  }`}
                >
                  <span className="text-lg">{cfg.label}</span>
                  <span
                    className={`text-sm font-normal ${
                      selected === key ? "text-pink-100" : "text-gray-400"
                    }`}
                  >
                    {cfg.description}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Start button */}
      {canPlay && (
        <button
          onClick={() => onStart(selected)}
          className="animate-pulse-pink bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-black text-xl px-12 py-5 rounded-2xl transition-all shadow-xl shadow-pink-200"
        >
          Start Training →
        </button>
      )}

      {/* Footer note */}
      <p className="mt-10 text-gray-300 text-xs text-center">
        AI customers powered by Claude · Sessions reset every Monday
      </p>
    </div>
  );
}
