
'use client'

import { useState, useEffect } from 'react';
import type { Task as LibTask } from '@/lib/sessions';

type Props = {
  // keep this flexible so existing callers (which expect createdAt as Date) remain compatible
  onTasksChange?: (tasks: any[]) => void;
  // key to use in localStorage so multiple TodoList instances don't overwrite each other
  storageKey?: string;
};

// Local task type extends the persisted Task type with an optional UI-only flag
type Task = LibTask & { isEditing?: boolean };

export default function TodoList({ onTasksChange, storageKey = 'DailyJournalTodos' }: Props) {
  const STORAGE_KEY = storageKey;

  const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [editingText, setEditingText] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // Load tasks from localStorage once on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Task[];
      setTasks(parsed);
    } catch (e) {
      // ignore parse errors
      console.error('Failed to load todos from localStorage', e);
    }
    // mark hydrated regardless so we don't block persisting forever
    setHydrated(true);
  }, [STORAGE_KEY]);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    // don't persist until we've loaded the initial value from storage
    if (!hydrated) return;

    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save todos to localStorage', e);
    }

    // Convert createdAt (ISO string) to Date objects for callers that expect Date
    try {
      const exported = tasks.map((t) => ({
        ...t,
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
      }));
      onTasksChange?.(exported as any[]);
    } catch (e) {
      onTasksChange?.(tasks as any[]);
    }
  }, [tasks, onTasksChange, STORAGE_KEY, hydrated]);

    const addTask = () => {
      if (newTaskText.trim()) {
        const newTask: Task = {
          id: Date.now().toString(),
          text: newTaskText.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        setTasks([...tasks, newTask]);
        setNewTaskText('');
      }
    };

    const toggleTask = (id: string) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    };

    const deleteTask = (id: string) => {
      setTasks(tasks.filter(task => task.id !== id));
    };

    const startEditing = (id: string, currentText: string) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, isEditing: true } : { ...task, isEditing: false }
      ));
      setEditingText(currentText);
    };

    const saveEdit = (id: string) => {
      if (editingText.trim()) {
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, text: editingText.trim(), isEditing: false } : task
        ));
      } else {
        // If empty, cancel the edit
        cancelEdit(id);
      }
    };

    const cancelEdit = (id: string) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, isEditing: false } : task
      ));
      setEditingText('');
    };

    const handleEditKeyPress = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') {
        saveEdit(id);
      } else if (e.key === 'Escape') {
        cancelEdit(id);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        addTask();
      }
    };

    return (
        <div className="">
            <div className="mx-auto px-6">
            {/* Add New Task */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-sm flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new task..."
                    className="flex-1 text-lg font-normal text-gray-800 placeholder-gray-400 border-none outline-none bg-transparent"
                />
                <button
                    onClick={addTask}
                    disabled={!newTaskText.trim()}
                    className="px-4 py-2 bg-gray-500 cursor-pointer text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Add
                </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
                {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    </div>
                    <p className="text-lg">No tasks yet</p>
                    <p className="text-sm">Add your first task above to get started</p>
                </div>
                ) : (
                tasks.map((task) => (
                    <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors group"
                    >
                    <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 border-2 rounded-sm flex items-center justify-center transition-colors ${
                        task.completed
                            ? 'bg-gray-600 border-gray-600 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                    >
                        {task.completed && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        )}
                    </button>
                    
                    {task.isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => handleEditKeyPress(e, task.id)}
                            className="flex-1 text-lg font-normal text-gray-800 border-none outline-none bg-transparent"
                            autoFocus
                        />
                        <button
                            onClick={() => saveEdit(task.id)}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                            title="Save (Enter)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => cancelEdit(task.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Cancel (Escape)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        </div>
                    ) : (
                        <span
                        className={`flex-1 text-lg font-normal transition-all cursor-pointer ${
                            task.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-800'
                        }`}
                        onDoubleClick={() => startEditing(task.id, task.text)}
                        title="Double-click to edit"
                        >
                        {task.text}
                        </span>
                    )}
                    
                    {!task.isEditing && (
                        <div className="flex items-center gap-1">
                        <button
                            onClick={() => startEditing(task.id, task.text)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
                            title="Edit task"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            title="Delete task"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        </div>
                    )}
                    </div>
                ))
                )}
            </div>
            </div>
        </div>
    )
}