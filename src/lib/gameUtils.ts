import { Persona, Problem, ChatWindow, GameResult, Difficulty } from "./types";

const PERSONAS: { value: Persona; label: string }[] = [
  { value: "frustrated_tech", label: "Frustrated Tech User" },
  { value: "confused_elderly", label: "Confused Customer" },
  { value: "impatient_business", label: "Impatient Business Owner" },
  { value: "anxious_buyer", label: "Anxious First-Time Buyer" },
  { value: "angry_billing", label: "Angry Billing Complaint" },
];

const PROBLEMS: { value: Problem; label: string; opening: string }[] = [
  {
    value: "login",
    label: "Can't Log In",
    opening: "hi i cant log into my account!! its been like an hour",
  },
  {
    value: "wrong_item",
    label: "Wrong Item Delivered",
    opening: "hello? i got the completely wrong thing in my order",
  },
  {
    value: "billing_error",
    label: "Billing Error",
    opening: "i was charged the wrong amount and i want to know why",
  },
  {
    value: "not_working",
    label: "Product Not Working",
    opening: "the product i bought isnt working at all, very frustrated",
  },
  {
    value: "refund",
    label: "Refund Request",
    opening: "i need a refund please, i changed my mind about my purchase",
  },
  {
    value: "kajabi",
    label: "Kajabi Platform Issue",
    opening: "hi i need help with my kajabi course, my students cant access the content at all",
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateChats(count: number): ChatWindow[] {
  const shuffledPersonas = shuffle(PERSONAS);
  const shuffledProblems = shuffle(PROBLEMS);

  return Array.from({ length: count }, (_, i) => {
    const persona = shuffledPersonas[i % shuffledPersonas.length];
    const problem = shuffledProblems[i % shuffledProblems.length];
    return {
      id: `chat-${i}-${Date.now()}`,
      persona: persona.value,
      problem: problem.value,
      personaLabel: persona.label,
      problemLabel: problem.label,
      messages: [{ role: "assistant" as const, content: problem.opening }],
      resolved: false,
      startedAt: Date.now(),
      impatience: 0,
      isTyping: false,
      isWaiting: false,
    };
  });
}

export function calculateRating(
  resolved: number,
  total: number,
  avgResponseMs: number
): { rating: GameResult["rating"]; message: string } {
  const pct = resolved / total;

  if (pct === 1 && avgResponseMs < 15000) {
    return {
      rating: "Legend",
      message: "Flawless. You were born for the support desk.",
    };
  }
  if (pct >= 0.75) {
    return {
      rating: "Pro",
      message: "Outstanding performance. The customers felt heard.",
    };
  }
  if (pct >= 0.5) {
    return {
      rating: "Agent",
      message: "Solid work. Keep practicing and you'll be unstoppable.",
    };
  }
  return {
    rating: "Rookie",
    message: "Every expert was once a beginner. You've got this.",
  };
}

export function getRatingColor(rating: GameResult["rating"]): string {
  switch (rating) {
    case "Legend":
      return "text-yellow-500";
    case "Pro":
      return "text-pink-500";
    case "Agent":
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case "rookie":
      return "bg-green-100 text-green-700 border-green-200";
    case "agent":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "gauntlet":
      return "bg-red-100 text-red-700 border-red-200";
  }
}
