import { supabase } from '../supabase/client';
import type { WorkSession, WorkSessionRow, SessionTaskRow } from '../db/types';
import { getTasks } from './tasks';

/**
 * work sessions service, CRUD operations for work sessions
 */

/**
 * get all work sessions for  user
 */
export async function getWorkSessions(userId?: string): Promise<WorkSession[]> {
  let query = supabase
    .from('work_sessions')
    .select('*')
    .order('started_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching work sessions:', error);
    throw error;
  }

  const sessions = data || [];

  // fetch related data for each session
  const sessionsWithDetails = await Promise.all(
    sessions.map(async (session: WorkSessionRow) => {
      // get session tasks
      const { data: sessionTasks, error: sessionTasksError } = await supabase
        .from('session_tasks')
        .select('*')
        .eq('session_id', session.id);

      if (sessionTasksError) {
        console.error('Error fetching session tasks:', sessionTasksError);
        throw sessionTasksError;
      }

      const completedTaskIds = (sessionTasks || [])
        .filter((st: SessionTaskRow) => st.completed)
        .map((st: SessionTaskRow) => st.task_id);

      // get task details
      const taskIds = (sessionTasks || []).map((st: SessionTaskRow) => st.task_id);
      const tasks = taskIds.length > 0 ? await getTasksByIds(taskIds) : [];

      // get reflections
      const { data: reflections, error: reflectionsError } = await supabase
        .from('reflections')
        .select('*')
        .eq('session_id', session.id);

      if (reflectionsError) {
        console.error('Error fetching reflections:', reflectionsError);
        throw reflectionsError;
      }

      const taskReflections: Record<string, string> = {};
      (reflections || []).forEach((reflection) => {
        taskReflections[reflection.task_id] = reflection.content;
      });

      return {
        id: session.id,
        startedAtISO: session.started_at,
        durationSec: session.duration_sec,
        completedTaskIds,
        tasks,
        taskReflections,
      };
    })
  );

  return sessionsWithDetails;
}

/**
 * get a single work session by id
 */
export async function getWorkSession(sessionId: string, userId?: string): Promise<WorkSession | null> {
  let query = supabase
    .from('work_sessions')
    .select('*')
    .eq('id', sessionId);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      // not found
      return null;
    }
    console.error('Error fetching work session:', error);
    throw error;
  }

  // get session tasks
  const { data: sessionTasks, error: sessionTasksError } = await supabase
    .from('session_tasks')
    .select('*')
    .eq('session_id', sessionId);

  if (sessionTasksError) {
    console.error('Error fetching session tasks:', sessionTasksError);
    throw sessionTasksError;
  }

  const completedTaskIds = (sessionTasks || [])
    .filter((st: SessionTaskRow) => st.completed)
    .map((st: SessionTaskRow) => st.task_id);

  // get task details
  const taskIds = (sessionTasks || []).map((st: SessionTaskRow) => st.task_id);
  const tasks = taskIds.length > 0 ? await getTasksByIds(taskIds) : [];

  // get reflections
  const { data: reflections, error: reflectionsError } = await supabase
    .from('reflections')
    .select('*')
    .eq('session_id', sessionId);

  if (reflectionsError) {
    console.error('Error fetching reflections:', reflectionsError);
    throw reflectionsError;
  }

  const taskReflections: Record<string, string> = {};
  (reflections || []).forEach((reflection) => {
    taskReflections[reflection.task_id] = reflection.content;
  });

  return {
    id: data.id,
    startedAtISO: data.started_at,
    durationSec: data.duration_sec,
    completedTaskIds,
    tasks,
    taskReflections,
  };
}

/**
 * create a new work session w tasks
 */
export async function createWorkSession(
  session: Omit<WorkSession, 'id'>,
  userId?: string
): Promise<WorkSession> {
  // create the work session
  const sessionRow: Omit<WorkSessionRow, 'id' | 'created_at' | 'updated_at'> = {
    started_at: session.startedAtISO,
    duration_sec: session.durationSec,
    user_id: userId || undefined,
  };

  const { data: sessionData, error: sessionError } = await supabase
    .from('work_sessions')
    .insert(sessionRow)
    .select()
    .single();

  if (sessionError) {
    console.error('Error creating work session:', sessionError);
    throw sessionError;
  }

  // link tasks to session
  if (session.tasks && session.tasks.length > 0) {
    const sessionTaskRows: Omit<SessionTaskRow, 'id' | 'created_at'>[] = session.tasks.map((task) => ({
      session_id: sessionData.id,
      task_id: task.id,
      completed: session.completedTaskIds.includes(task.id),
    }));

    const { error: sessionTasksError } = await supabase
      .from('session_tasks')
      .insert(sessionTaskRows);

    if (sessionTasksError) {
      console.error('Error linking tasks to session:', sessionTasksError);
      // optionally rollback session creation but for now just log
      throw sessionTasksError;
    }
  }

  return {
    id: sessionData.id,
    startedAtISO: sessionData.started_at,
    durationSec: sessionData.duration_sec,
    completedTaskIds: session.completedTaskIds,
    tasks: session.tasks,
    taskReflections: session.taskReflections || {},
  };
}

/**
 * delete a work session (cascades to session_tasks and reflections via foreignkey)
 */
export async function deleteWorkSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('work_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting work session:', error);
    throw error;
  }
}

/**
 * helper function to get tasks by ids
 */
async function getTasksByIds(taskIds: string[]) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('id', taskIds);

  if (error) {
    console.error('Error fetching tasks by IDs:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }));
}


