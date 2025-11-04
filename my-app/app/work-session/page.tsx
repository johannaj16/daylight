'use client';
import { useCallback, useMemo, useState } from 'react';

import Timer from "../components/Timer"
import TodoList from "../components/TodoList"
import VerticalNavbar from "../components/VerticalNavbar"

import { addSession, updateSessionReflections, type Task, type WorkSession } from '@/lib/sessions';


// Task type from TodoList (with createdAt: Date)
type TodoListTask = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  isEditing?: boolean;
};

export default function WorkSessionPage() {
  const [tasksSnapshot, setTasksSnapshot] = useState<Task[]>([]);
  const [pendingDurationSec, setPendingDurationSec] = useState<number | null>(null);
  const [showReflections, setShowReflections] = useState(false);
  const [loggedSessionId, setLoggedSessionId] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const showPrompt = useMemo(() => pendingDurationSec !== null && !showReflections, [pendingDurationSec, showReflections]);

  const handleTasksChange = useCallback((tasks: TodoListTask[]) => {
    // Convert tasks from TodoList format (createdAt: Date) to sessions format (createdAt?: string)
    const convertedTasks: Task[] = tasks.map(t => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : undefined,
    }));
    setTasksSnapshot(convertedTasks);
  }, []);

  function handleTimerComplete(durationSec: number) {
    // Timer finished—let user confirm logging
    setPendingDurationSec(durationSec);
  }

  function handleLogSession() {
    if (pendingDurationSec == null) return;

    const completedIds = tasksSnapshot.filter(t => t.completed).map(t => t.id);
    const sessionId = crypto.randomUUID();
    // Tasks are already in the correct format from handleTasksChange
    const tasksForSession: Task[] = tasksSnapshot;
    const newSession: WorkSession = {
      id: sessionId,
      startedAtISO: new Date().toISOString(),
      durationSec: pendingDurationSec,
      completedTaskIds: completedIds,
      tasks: tasksForSession, // Store full task info for display
    };

    addSession(newSession);
    setLoggedSessionId(sessionId);
    setPendingDurationSec(null);
    setShowReflections(true);
    // Initialize reflections with empty strings for all tasks
    const initialReflections: Record<string, string> = {};
    tasksSnapshot.forEach(task => {
      initialReflections[task.id] = '';
    });
    setReflections(initialReflections);
  }

  function handleSaveReflections() {
    if (loggedSessionId) {
      updateSessionReflections(loggedSessionId, reflections);
      setShowReflections(false);
      setLoggedSessionId(null);
      setReflections({});
      // Reset tasks snapshot
      setTasksSnapshot([]);
    }
  }

  return (
    <div className="text-gray-500 min-h-screen bg-white flex">
      <VerticalNavbar />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto overflow-y-auto py-6">
        <Timer onComplete={handleTimerComplete} />
        <div className="mt-2 h-0.5 bg-gray-200" />

        <div className="py-6">
          <h1 className="font-bold text-xl pt-6 pl-6">
            What are your goals for this work session?
          </h1>
          <p className="px-6 mb-6">
            Be as quantitative as possible, (e.g. finish [X] math problems, read [Y] pages)
          </p>
          <TodoList onTasksChange={handleTasksChange} />
        </div>

        {/* Log session prompt */}
        {showPrompt && (
          <div className="sticky bottom-4 self-center w-[min(100%,32rem)] rounded-xl border border-gray-400 bg-white shadow-md p-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-bold text-gray-600">Timer completed</div>
              <div className="text-sm text-gray-500">
                Log session with {Math.floor((pendingDurationSec ?? 0) / 60)} min and{' '}
                {tasksSnapshot.filter(t => t.completed).length} completed task(s)?
              </div>
            </div>
            <button
              className="cursor-pointer px-3 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
              onClick={handleLogSession}
            >
              Log session
            </button>
            <button
              className="cursor-pointer px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              onClick={() => setPendingDurationSec(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Reflections interface */}
        {showReflections && (
          <div className="px-6 py-6">
            <div className="rounded-xl border border-gray-300 bg-white shadow-sm">
              <div className="px-4 py-3 border-b border-gray-300">
                <h2 className="font-semibold text-gray-500">Reflections</h2>
                <p className="text-sm text-gray-400 mt-1">Write your reflections for each task from this work session</p>
              </div>
              <div className="p-4 space-y-4">
                {tasksSnapshot.map((task) => (
                  <div key={task.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      {task.text}
                    </label>
                    <textarea
                      value={reflections[task.id] || ''}
                      onChange={(e) => setReflections({ ...reflections, [task.id]: e.target.value })}
                      placeholder="Write your reflection here..."
                      className="w-full min-h-[100px] resize-y leading-6 outline-none text-gray-800 placeholder:text-gray-400 border border-gray-300 rounded-lg p-3 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    />
                  </div>
                ))}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    className="cursor-pointer px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={() => {
                      setShowReflections(false);
                      setLoggedSessionId(null);
                      setReflections({});
                    }}
                  >
                    Skip
                  </button>
                  <button
                    className="cursor-pointer px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                    onClick={handleSaveReflections}
                  >
                    Save Reflections
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}