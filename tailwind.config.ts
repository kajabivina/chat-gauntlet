import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          pink: "#FF2D78",
          dark: "#0D0D0D",
          card: "#1A1A1A",
          border: "#2A2A2A",
          text: "#E0E0E0",
          dim: "#888888",
        },
      },
      fontFamily: {
        arcade: ["var(--font-press-start)", "monospace"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "pink-glow": "0 0 15px rgba(255,45,120,0.5), 0 0 30px rgba(255,45,120,0.2)",
        "pink-glow-lg": "0 0 25px rgba(255,45,120,0.6), 0 0 50px rgba(255,45,120,0.3)",
        "red-glow": "0 0 15px rgba(255,50,50,0.6), 0 0 30px rgba(255,50,50,0.3)",
      },
      animation: {
        "glow-pulse": "glowPulse 1.5s ease-in-out infinite",
        "float-up": "floatUp 0.8s ease-out forwards",
        "bounce-in": "bounceIn 0.4s ease-out forwards",
        "border-flash": "borderFlash 0.6s ease-in-out infinite",
        "timer-pulse": "timerPulse 0.7s ease-in-out infinite",
        "slide-in": "slideIn 0.3s ease-out forwards",
        "resolve-pop": "resolvePop 0.5s ease-out forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": {
            boxShadow: "0 0 15px rgba(255,45,120,0.5), 0 0 30px rgba(255,45,120,0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(255,45,120,0.9), 0 0 60px rgba(255,45,120,0.5)",
          },
        },
        floatUp: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-48px) scale(1.4)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        borderFlash: {
          "0%, 100%": { borderColor: "#FF2D78", boxShadow: "0 0 8px rgba(255,45,120,0.4)" },
          "50%": { borderColor: "#FF4444", boxShadow: "0 0 16px rgba(255,68,68,0.7)" },
        },
        timerPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        resolvePop: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.8" },
          "100%": { transform: "scale(0.97)", opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
