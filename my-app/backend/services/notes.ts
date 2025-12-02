import { supabase } from '../supabase/client';
import type { Note, NoteRow } from '../db/types';

/**
 * notes/journal service, CRUD operations for journal entries
 */

/**
 * get all notes for user
 */
export async function getNotes(userId?: string): Promise<Note[]> {
  let query = supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return (data || []).map((row: NoteRow) => ({
    id: row.id,
    dateKey: row.date_key,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * get a note by date key (2025-10-06)
 */
export async function getNoteByDateKey(dateKey: string, userId?: string): Promise<Note | null> {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('date_key', dateKey);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      // not found
      return null;
    }
    console.error('Error fetching note by date key:', error);
    throw error;
  }

  return {
    id: data.id,
    dateKey: data.date_key,
    content: data.content,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * create or update note (upsert by date_key)
 */
export async function upsertNote(
  dateKey: string,
  content: string,
  userId?: string
): Promise<Note> {
  // first try to find existing note
  const existing = await getNoteByDateKey(dateKey, userId);

  if (existing) {
    // update existing note
    const updateData = {
      content,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }

    return {
      id: data.id,
      dateKey: data.date_key,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } else {
    // create new note
    const noteRow: Omit<NoteRow, 'id' | 'created_at' | 'updated_at'> = {
      date_key: dateKey,
      content,
      user_id: userId || undefined,
    };

    const { data, error } = await supabase
      .from('notes')
      .insert(noteRow)
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return {
      id: data.id,
      dateKey: data.date_key,
      content: data.content,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

/**
 * delete a note
 */
export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * delete a note by date key
 */
export async function deleteNoteByDateKey(dateKey: string, userId?: string): Promise<void> {
  let query = supabase.from('notes').delete().eq('date_key', dateKey);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { error } = await query;

  if (error) {
    console.error('Error deleting note by date key:', error);
    throw error;
  }
}


