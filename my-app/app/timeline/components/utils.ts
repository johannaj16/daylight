import type { WorkSession } from '@/lib/sessions';

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
};

export const getTimelineRange = (sessions: WorkSession[]) => {
  if (sessions.length === 0) return { min: Date.now(), max: Date.now() };
  
  const dates = sessions.map(s => new Date(s.startedAtISO).getTime());
  const min = Math.min(...dates);
  const max = Math.max(...dates);
  
  // Add padding (10% on each side)
  const range = max - min;
  return {
    min: min - range * 0.1,
    max: max + range * 0.1,
  };
};

export const getPositionOnTimeline = (iso: string, sessions: WorkSession[]) => {
  const { min, max } = getTimelineRange(sessions);
  const date = new Date(iso).getTime();
  return ((date - min) / (max - min)) * 100;
};

export const completedTasks = (session: WorkSession) => {
  if (!session.tasks) return [];
  return session.tasks.filter(task => session.completedTaskIds.includes(task.id));
};

