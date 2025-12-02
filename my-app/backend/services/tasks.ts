import { supabase } from '../supabase/client';
import type { Task, TaskRow } from '../db/types';

/**
 * tasks service, CRUD operations for tasks
 */

/**
 * get all tasks for a user   (optional user_id filter for future auth)
 */
export async function getTasks(userId?: string): Promise<Task[]> {
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return (data || []).map((row: TaskRow) => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }));
}

/**
 * get tasks for a specific date (by created_at date)
 */
export async function getTasksByDate(date: Date, userId?: string): Promise<Task[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let query = supabase
    .from('tasks')
    .select('*')
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks by date:', error);
    throw error;
  }

  return (data || []).map((row: TaskRow) => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  }));
}

/**
 * create a new task
 */
export async function createTask(task: Omit<Task, 'id' | 'createdAt'>, userId?: string): Promise<Task> {
  const taskRow: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'> = {
    text: task.text,
    completed: task.completed || false,
    user_id: userId || null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskRow)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return {
    id: data.id,
    text: data.text,
    completed: data.completed,
    createdAt: data.created_at,
  };
}

/**
 * update a task
 */
export async function updateTask(taskId: string, updates: Partial<Pick<Task, 'text' | 'completed'>>): Promise<Task> {
  const updateData: Partial<TaskRow> = {};

  if (updates.text !== undefined) {
    updateData.text = updates.text;
  }
  if (updates.completed !== undefined) {
    updateData.completed = updates.completed;
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return {
    id: data.id,
    text: data.text,
    completed: data.completed,
    createdAt: data.created_at,
  };
}

/**
 * delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * toggle task completion
 */
export async function toggleTask(taskId: string): Promise<Task> {
  // First get current task
  const { data: currentTask, error: fetchError } = await supabase
    .from('tasks')
    .select('completed')
    .eq('id', taskId)
    .single();

  if (fetchError) {
    console.error('Error fetching task for toggle:', fetchError);
    throw fetchError;
  }

  return updateTask(taskId, { completed: !currentTask.completed });
}


