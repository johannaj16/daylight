/**
 * db types matching Supabase schema
 */

export interface TaskRow {
  id: string;
  user_id?: string;
  text: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkSessionRow {
  id: string;
  user_id?: string;
  started_at: string;
  duration_sec: number;
  created_at: string;
  updated_at: string;
}

export interface SessionTaskRow {
  id: string;
  session_id: string;
  task_id: string;
  completed: boolean;
  created_at: string;
}

export interface ReflectionRow {
  id: string;
  session_id: string;
  task_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface NoteRow {
  id: string;
  user_id?: string;
  date_key: string; 
  content: string; 
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoalRow {
  id: string;
  user_id?: string;
  month: string; 
  year: number;
  goals: string; 
  created_at: string;
  updated_at: string;
}

/**
 * frontend friendly types
 */
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
}

export interface WorkSession {
  id: string;
  startedAtISO: string;
  durationSec: number;
  completedTaskIds: string[];
  tasks?: Task[];
  taskReflections?: Record<string, string>;
}

export interface Note {
  id: string;
  dateKey: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  sessionId: string;
  taskId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}


