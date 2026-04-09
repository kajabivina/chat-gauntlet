"use client";

import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  isCircle: boolean;
}

export default function Confetti() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2.5,
        size: 6 + Math.random() * 10,
        color: [
          "#FF2D78",
          "#FF2D78",
          "#FFFFFF",
          "#FFB3CC",
          "#FF69A0",
        ][Math.floor(Math.random() * 5)],
        isCircle: Math.random() > 0.5,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? "50%" : "2px",
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
