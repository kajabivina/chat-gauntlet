"use client";

import { useEffect, useRef, useState } from "react";

// "Bit Quest" by Kevin MacLeod — CC BY 4.0 — incompetech.com
// Swap this constant for any royalty-free MP3 URL if needed
const MUSIC_URL =
  "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Bit%20Quest.mp3";

const LS_MUTED = "cg_music_muted";
const LS_VOLUME = "cg_music_volume";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    const savedMuted = localStorage.getItem(LS_MUTED) === "true";
    const savedVolume = parseFloat(localStorage.getItem(LS_VOLUME) ?? "0.4");
    audio.volume = savedVolume;
    audio.muted = savedMuted;
    setMuted(savedMuted);
    setVolume(savedVolume);
    audioRef.current = audio;

    audio.play().then(() => setPlaying(true)).catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
    localStorage.setItem(LS_MUTED, String(next));
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.volume = v;
    setVolume(v);
    localStorage.setItem(LS_VOLUME, String(v));
  }

  return (
    <div
      className="relative flex items-center gap-1.5"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      {showSlider && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolume}
          className="w-16 accent-pink-500"
          title="Volume"
        />
      )}
      <button
        onClick={toggleMute}
        title={muted ? "Unmute" : "Mute"}
        className="text-sm text-arcade-dim hover:text-arcade-pink transition-colors leading-none"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <button
        onClick={togglePlay}
        title={playing ? "Pause music" : "Play music"}
        className="font-arcade text-[8px] text-arcade-dim hover:text-arcade-pink transition-colors"
      >
        {playing ? "■" : "▶"}
      </button>
    </div>
  );
}
