import { Persona, Problem, ChatWindow, CustomerAccount, GameResult, Difficulty } from "./types";

const ACCOUNT_POOL: Omit<CustomerAccount, "accountId">[] = [
  { name: "Sarah Mitchell", email: "sarah@mitchellcoaching.com", plan: "Growth", product: "Mindful Leadership Masterclass", joinDate: "March 2023" },
  { name: "James Okafor", email: "james@okafordigital.com", plan: "Pro", product: "Financial Freedom Blueprint", joinDate: "August 2022" },
  { name: "Linda Reyes", email: "linda.reyes@wellnesswithlinda.com", plan: "Basic", product: "30-Day Gut Health Reset", joinDate: "January 2024" },
  { name: "Tom Hargreaves", email: "tom@hargreavesconsulting.com", plan: "Growth", product: "B2B Sales Accelerator", joinDate: "June 2023" },
  { name: "Priya Nair", email: "priya@priyateaches.com", plan: "Kickstarter", product: "Beginner Watercolour Workshop", joinDate: "November 2023" },
  { name: "David Chu", email: "david@chuproductions.com", plan: "Pro", product: "YouTube Mastery for Creators", joinDate: "April 2022" },
  { name: "Margaret Olsen", email: "margaret@olsenacademy.net", plan: "Basic", product: "Backyard Beekeeping 101", joinDate: "September 2023" },
  { name: "Carlos Vega", email: "carlos@vegafitpro.com", plan: "Growth", product: "Elite Strength Program", joinDate: "February 2023" },
];

const PROBLEM_CONTEXT: Record<string, (account: CustomerAccount) => string> = {
  course_access: (a) =>
    `Your product is called "${a.product}". You have 63 students enrolled. They are getting a "Content not available" error when trying to access lessons. You already tried logging out and back in on your end and asking a student to do the same — nothing worked. This started about 2 hours ago with no changes made on your side.`,
  billing: (a) =>
    `You are on the ${a.plan} plan. You were charged $199 this month but expected to be on a discounted rate of $149 from a promotion you signed up for. The charge came through today. You have your bank statement ready if needed. Your billing email is ${a.email}.`,
  login: (a) =>
    `Your account email is ${a.email}. You have tried resetting your password twice — the reset email is not arriving even in spam. You last logged in about 3 days ago with no issues. You have tried Chrome and Safari. Your account has been active since ${a.joinDate}.`,
  product_issue: (a) =>
    `Your product is called "${a.product}". Two of your lesson pages are showing completely blank — the video and text content have disappeared. This happened sometime in the last 24 hours. You have not made any edits recently. Other pages look fine.`,
  email_issue: (a) =>
    `You sent a broadcast email to your full list of 2,847 subscribers about 90 minutes ago promoting "${a.product}". The broadcast shows "Sent" in Kajabi but you have zero opens and several students have messaged saying they got nothing. You have checked your own inbox — not there either.`,
  cancellation: (a) =>
    `You have been a Kajabi member since ${a.joinDate} on the ${a.plan} plan. You want to cancel because you are pausing your business for personal reasons — it is not a product complaint. You want to know if there is a pause option, and if not, how to cancel and whether you will get a prorated refund.`,
};

function generateAccountId(): string {
  return "KAJ-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PERSONAS: { value: Persona; label: string }[] = [
  { value: "frustrated_tech", label: "Frustrated Tech User" },
  { value: "confused_elderly", label: "Confused Customer" },
  { value: "impatient_business", label: "Impatient Business Owner" },
  { value: "anxious_buyer", label: "Anxious First-Time Buyer" },
  { value: "angry_billing", label: "Angry Billing Complaint" },
];

const PROBLEMS: { value: Problem; label: string; opening: string }[] = [
  {
    value: "course_access",
    label: "Course Access Issue",
    opening: "hi my students are saying they cant access my course content at all, this is a disaster",
  },
  {
    value: "billing",
    label: "Billing Question",
    opening: "i was just charged and i dont understand why, can someone explain this to me",
  },
  {
    value: "login",
    label: "Can't Log In",
    opening: "hi i cant log into my kajabi account, ive tried resetting my password twice already",
  },
  {
    value: "product_issue",
    label: "Product Builder Issue",
    opening: "my product pages arent showing up correctly, some of my content is just gone",
  },
  {
    value: "email_issue",
    label: "Emails Not Sending",
    opening: "i sent a broadcast to my list an hour ago and nobody received it, whats going on",
  },
  {
    value: "cancellation",
    label: "Cancel Subscription",
    opening: "i want to cancel my kajabi plan and i need help doing that",
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
  const shuffledAccounts = shuffle(ACCOUNT_POOL);

  return Array.from({ length: count }, (_, i) => {
    const persona = shuffledPersonas[i % shuffledPersonas.length];
    const problem = shuffledProblems[i % shuffledProblems.length];
    const baseAccount = shuffledAccounts[i % shuffledAccounts.length];
    const account: CustomerAccount = { ...baseAccount, accountId: generateAccountId() };
    return {
      id: `chat-${i}-${Date.now()}`,
      persona: persona.value,
      problem: problem.value,
      personaLabel: persona.label,
      problemLabel: problem.label,
      account,
      messages: [{ role: "assistant" as const, content: problem.opening }],
      resolved: false,
      startedAt: Date.now(),
      impatience: 0,
      isTyping: false,
      isWaiting: false,
    };
  });
}

export { PROBLEM_CONTEXT };

export function calculatePoints(agentMessageCount: number): number {
  if (agentMessageCount <= 2) return 10;
  if (agentMessageCount <= 4) return 8;
  if (agentMessageCount <= 6) return 6;
  if (agentMessageCount <= 8) return 4;
  if (agentMessageCount <= 10) return 2;
  return 1;
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
