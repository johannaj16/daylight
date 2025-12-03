import type { Task, WorkSession } from './sessions';

export type JournalEntry = {
  timestamp: string;
  content: string;
};

export type DayData = {
  date: string;  // ISO date string YYYY-MM-DD
  dailyTodos: Task[];
  journalEntries: JournalEntry[];
  workSessions: WorkSession[];
};

type DayStorage = Record<string, DayData>;

const STORAGE_KEY = 'daylight:days';

export function getToday(): DayData {
  return getDayData(formatDateKey());
}

export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptyDay(date: string): DayData {
  return {
    date,
    dailyTodos: [],
    journalEntries: [],
    workSessions: [],
  };
}

export function getDayData(date: string): DayData {
  if (typeof window === 'undefined') return createEmptyDay(date);
  
  try {
    const allDays = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as DayStorage;
    return allDays[date] || createEmptyDay(date);
  } catch (err) {
    console.error('Failed to load day data:', err);
    return createEmptyDay(date);
  }
}

export function saveDayData(day: DayData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const allDays = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as DayStorage;
    allDays[day.date] = day;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDays));
  } catch (err) {
    console.error('Failed to save day data:', err);
  }
}

export function getDaysInRange(startDate: string, endDate: string): DayData[] {
  if (typeof window === 'undefined') return [];

  try {
    const allDays = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as DayStorage;
    return Object.values(allDays)
      .filter(day => day.date >= startDate && day.date <= endDate)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (err) {
    console.error('Failed to load days range:', err);
    return [];
  }
}

// Utility functions for specific data types
export function updateDayTodos(date: string, todos: Task[]): void {
  const day = getDayData(date);
  day.dailyTodos = todos;
  saveDayData(day);
}

export function addJournalEntry(date: string, content: string): void {
  const day = getDayData(date);
  day.journalEntries.push({
    timestamp: new Date().toISOString(),
    content,
  });
  saveDayData(day);
}

export function setJournalContent(date: string, content: string): void {
  const day = getDayData(date);
  // Replace any existing entries with a single new one
  day.journalEntries = [{
    timestamp: new Date().toISOString(),
    content,
  }];
  saveDayData(day);
}

export function getJournalContent(date: string): string {
  const day = getDayData(date);
  return day.journalEntries[0]?.content || '';
}

export function addWorkSession(session: WorkSession): void {
  const date = formatDateKey(new Date(session.startedAtISO));
  const day = getDayData(date);
  day.workSessions.unshift(session);
  saveDayData(day);
}
