export type Persona =
  | "frustrated_tech"
  | "confused_elderly"
  | "impatient_business"
  | "anxious_buyer"
  | "angry_billing";

export type Problem =
  | "login"
  | "wrong_item"
  | "billing_error"
  | "not_working"
  | "refund";

export type Difficulty = "rookie" | "agent" | "gauntlet";

export interface DifficultyConfig {
  label: string;
  chatCount: number;
  durationSeconds: number;
  description: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  rookie: {
    label: "Rookie",
    chatCount: 2,
    durationSeconds: 180,
    description: "2 chats · 3 minutes",
  },
  agent: {
    label: "Agent",
    chatCount: 2,
    durationSeconds: 150,
    description: "2 chats · 2.5 minutes",
  },
  gauntlet: {
    label: "Gauntlet",
    chatCount: 2,
    durationSeconds: 120,
    description: "2 chats · 2 minutes",
  },
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatWindow {
  id: string;
  persona: Persona;
  problem: Problem;
  personaLabel: string;
  problemLabel: string;
  messages: ChatMessage[];
  resolved: boolean;
  resolvedAt?: number;
  startedAt: number;
  impatience: number;
  isTyping: boolean;
  isWaiting: boolean;
}

export interface GameResult {
  difficulty: Difficulty;
  resolved: number;
  total: number;
  durationSeconds: number;
  averageResponseTimeMs: number;
  rating: "Rookie" | "Agent" | "Pro" | "Legend";
  ratingMessage: string;
}
