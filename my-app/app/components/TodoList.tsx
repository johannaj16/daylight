"use client";

import { useState, useEffect } from "react";
import type { Task as LibTask } from "@/lib/sessions";
import { getDayData, saveDayData, formatDateKey } from "@/lib/days";

type Props = {
  // keep this flexible so existing callers (which expect createdAt as Date) remain compatible
  onTasksChange?: (tasks: any[]) => void;
  // key to use in localStorage for transient todos (like work session todos)
  storageKey?: string;
  // if true, uses day-based storage instead of direct localStorage
  useDayStorage?: boolean;
};

// Local task type extends the persisted Task type with an optional UI-only flag
type Task = LibTask & { isEditing?: boolean };

export default function TodoList({
  onTasksChange,
  storageKey = "WorkSessionTodos",
  useDayStorage = false,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [editingText, setEditingText] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Load tasks from appropriate storage once on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      if (useDayStorage) {
        // Load from day-based storage
        const day = getDayData(formatDateKey());
        setTasks(day.dailyTodos.map((t) => ({ ...t, isEditing: false })));
      } else {
        // Load from direct localStorage (for work session todos)
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Task[];
          setTasks(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load todos:", e);
    }
    setHydrated(true);
  }, [storageKey, useDayStorage]);

  // Persist tasks whenever they change
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;

    try {
      if (useDayStorage) {
        // Save to day-based storage
        const day = getDayData(formatDateKey());
        day.dailyTodos = tasks.map(({ isEditing, ...t }) => t); // Remove UI-only field
        saveDayData(day);
      } else {
        // Save to direct localStorage (for work session todos)
        localStorage.setItem(storageKey, JSON.stringify(tasks));
      }

      // Convert createdAt for callers that expect Date objects
      const exported = tasks.map((t) => ({
        ...t,
        createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
      }));
      onTasksChange?.(exported as any[]);
    } catch (e) {
      console.error("Failed to save todos:", e);
      onTasksChange?.(tasks as any[]);
    }
  }, [tasks, onTasksChange, storageKey, hydrated, useDayStorage]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
      setNewTaskText("");
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const startEditing = (id: string, currentText: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, isEditing: true }
          : { ...task, isEditing: false }
      )
    );
    setEditingText(currentText);
  };

  const saveEdit = (id: string) => {
    if (editingText.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === id
            ? { ...task, text: editingText.trim(), isEditing: false }
            : task
        )
      );
    } else {
      // If empty, cancel the edit
      cancelEdit(id);
    }
  };

  const cancelEdit = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, isEditing: false } : task
      )
    );
    setEditingText("");
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      saveEdit(id);
    } else if (e.key === "Escape") {
      cancelEdit(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  return (
    <div className="space-y-5">
      {/* Add Task */}
      <div className="rounded-2xl border border-[color:var(--muted-border)] bg-[color:var(--surface-muted)]/70 p-4 shadow-inner">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-1 min-w-0 items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-3 py-2 shadow-[0_10px_35px_-25px_rgba(209,73,8,0.9)]">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a task..."
              className="flex-1 border-none bg-transparent text-base text-[color:var(--foreground)] placeholder:text-[color:var(--brand-300)] focus:outline-none"
            />
          </div>
          <button
            onClick={addTask}
            disabled={!newTaskText.trim()}
            className="w-full rounded-2xl bg-[color:var(--brand-600)] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_35px_-25px_rgba(230,88,12,0.9)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-700)] disabled:cursor-not-allowed disabled:bg-[color:var(--brand-300)] disabled:text-white sm:w-auto sm:flex-shrink-0"
          >
            Add task
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[color:var(--muted-border)] bg-white/80 px-6 py-10 text-center text-[color:var(--brand-400)]">
            <p className="text-lg font-semibold">No tasks yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Capture 1–3 tangible wins for today.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="group rounded-2xl border border-[color:var(--muted-border)] bg-white/90 px-4 py-3 shadow-[0_25px_40px_-35px_rgba(212,79,0,0.8)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 flex h-7 w-7 items-center justify-center rounded-xl border-2 transition ${
                    task.completed
                      ? "border-[color:var(--brand-600)] bg-[color:var(--brand-600)] text-white"
                      : "border-[color:var(--brand-300)] text-[color:var(--brand-300)] hover:border-[color:var(--brand-600)]"
                  }`}
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed && (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  {task.isEditing ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => handleEditKeyPress(e, task.id)}
                        className="flex-1 rounded-xl border border-[color:var(--muted-border)] bg-white/80 px-3 py-2 text-base text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-200)]"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => saveEdit(task.id)}
                          className="rounded-xl bg-[color:var(--brand-600)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => cancelEdit(task.id)}
                          className="rounded-xl border border-[color:var(--muted-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={`w-full text-left text-base font-medium transition ${
                        task.completed
                          ? "text-[color:var(--brand-300)] line-through"
                          : "text-[color:var(--foreground)]"
                      }`}
                      onDoubleClick={() => startEditing(task.id, task.text)}
                    >
                      {task.text}
                    </button>
                  )}
                </div>

                {!task.isEditing && (
                  <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => startEditing(task.id, task.text)}
                      className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:border-[color:var(--muted-border)] hover:text-[color:var(--brand-500)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-xl border border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:border-red-100 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
