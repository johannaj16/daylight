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
  tasks?: Task[]; // Store full task info for display
  taskReflections?: Record<string, string>; // taskId -> reflection text
};

const STORAGE_KEY = 'workSessions';

export function loadSessions(): WorkSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: WorkSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

export function addSession(newSession: WorkSession) {
  const all = loadSessions();
  all.unshift(newSession);
  saveSessions(all);
}

export function updateSessionReflections(sessionId: string, reflections: Record<string, string>) {
  const all = loadSessions();
  const session = all.find(s => s.id === sessionId);
  if (session) {
    session.taskReflections = reflections;
    saveSessions(all);
  }
}
