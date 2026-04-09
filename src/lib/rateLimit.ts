const STORAGE_KEY = "chatgauntlet_sessions";
const MAX_SESSIONS = 3;

interface SessionData {
  weekStart: string; // ISO date string of most recent Monday
  count: number;
}

function getMostRecentMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

function getSessionData(): SessionData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { weekStart: getMostRecentMonday(new Date()), count: 0 };
    return JSON.parse(raw) as SessionData;
  } catch {
    return { weekStart: getMostRecentMonday(new Date()), count: 0 };
  }
}

function saveSessionData(data: SessionData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getSessionsRemaining(): number {
  const currentWeekStart = getMostRecentMonday(new Date());
  const data = getSessionData();
  if (data.weekStart !== currentWeekStart) {
    // New week — reset
    saveSessionData({ weekStart: currentWeekStart, count: 0 });
    return MAX_SESSIONS;
  }
  return Math.max(0, MAX_SESSIONS - data.count);
}

export function canPlay(): boolean {
  return getSessionsRemaining() > 0;
}

export function recordGameCompleted(): void {
  const currentWeekStart = getMostRecentMonday(new Date());
  const data = getSessionData();
  if (data.weekStart !== currentWeekStart) {
    saveSessionData({ weekStart: currentWeekStart, count: 1 });
  } else {
    saveSessionData({ weekStart: data.weekStart, count: data.count + 1 });
  }
}

export { MAX_SESSIONS };
