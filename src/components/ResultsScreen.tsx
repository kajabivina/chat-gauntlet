"use client";

import { GameResult } from "@/lib/types";
import { getRatingColor } from "@/lib/gameUtils";
import { MAX_SESSIONS } from "@/lib/rateLimit";

interface ResultsScreenProps {
  result: GameResult;
  sessionsRemaining: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

const RATING_EMOJI: Record<GameResult["rating"], string> = {
  Legend: "🏆",
  Pro: "⭐",
  Agent: "👍",
  Rookie: "💪",
};

export default function ResultsScreen({
  result,
  sessionsRemaining,
  onPlayAgain,
  onHome,
}: ResultsScreenProps) {
  const pct = Math.round((result.resolved / result.total) * 100);
  const avgSec = Math.round(result.averageResponseTimeMs / 1000);
  const ratingColor = getRatingColor(result.rating);

  const handleShare = () => {
    const text = `I scored ${result.resolved}/${result.total} on ChatGauntlet (${result.rating} rating)! Train your customer support skills at ChatGauntlet.`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Score copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-bounce-in">
        {/* Rating badge */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{RATING_EMOJI[result.rating]}</div>
          <div
            className={`text-5xl font-black mb-2 ${ratingColor}`}
          >
            {result.rating}
          </div>
          <p className="text-gray-500 text-lg">{result.ratingMessage}</p>
        </div>

        {/* Stats card */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
            Session Summary
          </h2>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Chats Resolved</span>
            <span className="font-black text-2xl text-gray-800">
              {result.resolved}
              <span className="text-gray-300 font-normal text-lg">
                /{result.total}
              </span>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-pink-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Avg Response Time</span>
            <span className="font-bold text-gray-800">
              {avgSec > 0 ? `${avgSec}s` : "—"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Difficulty</span>
            <span className="font-bold text-gray-800 capitalize">
              {result.difficulty}
            </span>
          </div>
        </div>

        {/* Sessions remaining */}
        <div
          className={`text-center text-sm mb-6 px-4 py-2 rounded-full ${
            sessionsRemaining > 0
              ? "bg-pink-50 text-pink-500"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {sessionsRemaining > 0 ? (
            <>
              {sessionsRemaining} of {MAX_SESSIONS} training sessions left this
              week
            </>
          ) : (
            <>
              No sessions left this week. Come back Monday!
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {sessionsRemaining > 0 && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-lg shadow-pink-100"
            >
              Play Again
            </button>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 border-2 border-gray-200 hover:border-pink-300 text-gray-600 hover:text-pink-500 font-semibold py-3 rounded-2xl transition-all"
            >
              Share Score
            </button>
            <button
              onClick={onHome}
              className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-2xl transition-all"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
