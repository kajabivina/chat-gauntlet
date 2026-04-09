export type Persona =
  | "frustrated_tech"
  | "confused_elderly"
  | "impatient_business"
  | "anxious_buyer"
  | "angry_billing";

export type Problem =
  | "course_access"
  | "billing"
  | "login"
  | "product_issue"
  | "email_issue"
  | "cancellation";

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
    durationSeconds: 300,
    description: "2 chats · 5 minutes",
  },
  agent: {
    label: "Agent",
    chatCount: 2,
    durationSeconds: 600,
    description: "2 chats · 10 minutes",
  },
  gauntlet: {
    label: "Gauntlet",
    chatCount: 2,
    durationSeconds: 900,
    description: "2 chats · 15 minutes",
  },
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CustomerAccount {
  name: string;
  email: string;
  plan: string;
  product: string;
  joinDate: string;
  accountId: string;
}

export interface ChatWindow {
  id: string;
  persona: Persona;
  problem: Problem;
  personaLabel: string;
  problemLabel: string;
  account: CustomerAccount;
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
  score: number;
  maxScore: number;
  durationSeconds: number;
  averageResponseTimeMs: number;
  rating: "Rookie" | "Agent" | "Pro" | "Legend";
  ratingMessage: string;
}
