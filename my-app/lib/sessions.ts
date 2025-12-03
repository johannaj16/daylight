import { formatDateKey } from './days';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
};

export type WorkSession = {
  id: string;
  startedAtISO: string;
  durationSec: number;
  completedTaskIds: string[];
  focusRating?: number;
  improvementNotes?: string;
  // optional full task info and per-task reflections (added to support journaling and display)
  tasks?: Task[];
  taskReflections?: Record<string, string>;
};

const DAYS_KEY = 'daylight:days';

export function loadSessions(): WorkSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DAYS_KEY);
    if (!raw) return [];
    const days = JSON.parse(raw) as Record<string, { workSessions?: WorkSession[] }>;
    const sessions: WorkSession[] = [];
    Object.values(days).forEach((d) => {
      if (d.workSessions && Array.isArray(d.workSessions)) {
        sessions.push(...d.workSessions);
      }
    });
    // sort newest first
    sessions.sort((a, b) => b.startedAtISO.localeCompare(a.startedAtISO));
    return sessions;
  } catch {
    return [];
  }
}

export function saveSessions(_sessions: WorkSession[]) {
  // Deprecated: sessions are now stored inside `daylight:days` by date.
  // Keep a no-op to avoid breaking callers.
}

export function addSession(newSession: WorkSession) {
  // Store the new session inside daylight:days under the day's workSessions array
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(DAYS_KEY) || '{}';
    const days = JSON.parse(raw) as Record<string, any>;
    const date = formatDateKey(new Date(newSession.startedAtISO));
    if (!days[date]) days[date] = { date, dailyTodos: [], journalEntries: [], workSessions: [] };
    days[date].workSessions = days[date].workSessions || [];
    days[date].workSessions.unshift(newSession);
    localStorage.setItem(DAYS_KEY, JSON.stringify(days));
  } catch (e) {
    console.error('Failed to save work session into days storage', e);
  }
}

export function updateSessionReflections(sessionId: string, reflections: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(DAYS_KEY) || '{}';
    const days = JSON.parse(raw) as Record<string, any>;
    let changed = false;
    for (const dateKey of Object.keys(days)) {
      const day = days[dateKey];
      if (!day?.workSessions) continue;
      const session = day.workSessions.find((s: WorkSession) => s.id === sessionId);
      if (session) {
        session.taskReflections = reflections;
        changed = true;
        break;
      }
    }
    if (changed) {
      localStorage.setItem(DAYS_KEY, JSON.stringify(days));
    }
  } catch (e) {
    console.error('Failed to update session reflections in days storage', e);
  }
}
