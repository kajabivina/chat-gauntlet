"use client";

import { useState, useEffect, useCallback } from "react";
import { Difficulty, GameResult } from "@/lib/types";
import { canPlay, getSessionsRemaining, recordGameCompleted } from "@/lib/rateLimit";
import WelcomeScreen from "@/components/WelcomeScreen";
import GameScreen from "@/components/GameScreen";
import ResultsScreen from "@/components/ResultsScreen";

type Screen = "welcome" | "game" | "results";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [difficulty, setDifficulty] = useState<Difficulty>("rookie");
  const [result, setResult] = useState<GameResult | null>(null);
  const [sessionsRemaining, setSessionsRemaining] = useState(3);

  useEffect(() => {
    setSessionsRemaining(getSessionsRemaining());
  }, []);

  const handleStart = useCallback((d: Difficulty) => {
    if (!canPlay()) return;
    setDifficulty(d);
    setScreen("game");
  }, []);

  const handleGameEnd = useCallback((r: GameResult) => {
    recordGameCompleted();
    setResult(r);
    setSessionsRemaining(getSessionsRemaining());
    setScreen("results");
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (!canPlay()) return;
    setResult(null);
    setScreen("welcome");
  }, []);

  const handleHome = useCallback(() => {
    setResult(null);
    setScreen("welcome");
  }, []);

  if (screen === "game") {
    return <GameScreen difficulty={difficulty} onGameEnd={handleGameEnd} />;
  }

  if (screen === "results" && result) {
    return (
      <ResultsScreen
        result={result}
        sessionsRemaining={sessionsRemaining}
        onPlayAgain={handlePlayAgain}
        onHome={handleHome}
      />
    );
  }

  return (
    <WelcomeScreen sessionsRemaining={sessionsRemaining} onStart={handleStart} />
  );
}
