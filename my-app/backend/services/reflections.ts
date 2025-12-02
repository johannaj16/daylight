import { supabase } from '../supabase/client';
import type { Reflection, ReflectionRow } from '../db/types';

/**
 * reflections service, CRUD operations for task reflections
 */

/**
 * get all reflections for a work session
 */
export async function getReflectionsBySession(sessionId: string): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching reflections:', error);
    throw error;
  }

  return (data || []).map((row: ReflectionRow) => ({
    id: row.id,
    sessionId: row.session_id,
    taskId: row.task_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * get reflection for a specific task in a session
 */
export async function getReflection(sessionId: string, taskId: string): Promise<Reflection | null> {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('session_id', sessionId)
    .eq('task_id', taskId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // not found
      return null;
    }
    console.error('Error fetching reflection:', error);
    throw error;
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    taskId: data.task_id,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * create or update reflections for a session
 * this replaces all reflections for the session w the provided ones
 */
export async function upsertReflections(
  sessionId: string,
  reflections: Record<string, string> // taskId -> content
): Promise<void> {
  // delete existing reflections for this session
  const { error: deleteError } = await supabase
    .from('reflections')
    .delete()
    .eq('session_id', sessionId);

  if (deleteError) {
    console.error('Error deleting existing reflections:', deleteError);
    throw deleteError;
  }

  // insert new reflections (only non empty ones)
  const reflectionRows: Omit<ReflectionRow, 'id' | 'created_at' | 'updated_at'>[] = Object.entries(
    reflections
  )
    .filter(([_, content]) => content.trim().length > 0)
    .map(([taskId, content]) => ({
      session_id: sessionId,
      task_id: taskId,
      content: content.trim(),
    }));

  if (reflectionRows.length > 0) {
    const { error: insertError } = await supabase.from('reflections').insert(reflectionRows);

    if (insertError) {
      console.error('Error inserting reflections:', insertError);
      throw insertError;
    }
  }
}

/**
 * update single reflection
 */
export async function updateReflection(
  sessionId: string,
  taskId: string,
  content: string
): Promise<Reflection> {
  const updateData = {
    content: content.trim(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('reflections')
    .update(updateData)
    .eq('session_id', sessionId)
    .eq('task_id', taskId)
    .select()
    .single();

  if (error) {
    // if reflection doesn't exist, create it
    if (error.code === 'PGRST116') {
      const { data: newData, error: insertError } = await supabase
        .from('reflections')
        .insert({
          session_id: sessionId,
          task_id: taskId,
          content: content.trim(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating reflection:', insertError);
        throw insertError;
      }

      return {
        id: newData.id,
        sessionId: newData.session_id,
        taskId: newData.task_id,
        content: newData.content,
        createdAt: newData.created_at,
        updatedAt: newData.updated_at,
      };
    }

    console.error('Error updating reflection:', error);
    throw error;
  }

  return {
    id: data.id,
    sessionId: data.session_id,
    taskId: data.task_id,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * delete reflection
 */
export async function deleteReflection(sessionId: string, taskId: string): Promise<void> {
  const { error } = await supabase
    .from('reflections')
    .delete()
    .eq('session_id', sessionId)
    .eq('task_id', taskId);

  if (error) {
    console.error('Error deleting reflection:', error);
    throw error;
  }
}


