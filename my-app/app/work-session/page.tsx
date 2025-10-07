'use client';
import { useMemo, useState } from 'react';

import Timer from "../components/Timer"
import TodoList from "../components/TodoList"
import VerticalNavbar from "../components/VerticalNavbar"

import { addSession, type Task, type WorkSession } from '@/lib/sessions';


export default function WorkSessionPage() {
  const [tasksSnapshot, setTasksSnapshot] = useState<Task[]>([]);
  const [pendingDurationSec, setPendingDurationSec] = useState<number | null>(null);
  const showPrompt = useMemo(() => pendingDurationSec !== null, [pendingDurationSec]);

  function handleTimerComplete(durationSec: number) {
    // Timer finished—let user confirm logging
    setPendingDurationSec(durationSec);
  }

  function handleLogSession() {
    if (pendingDurationSec == null) return;

    const completedIds = tasksSnapshot.filter(t => t.completed).map(t => t.id);
    const newSession: WorkSession = {
      id: crypto.randomUUID(),
      startedAtISO: new Date().toISOString(),
      durationSec: pendingDurationSec,
      completedTaskIds: completedIds,
    };

    addSession(newSession);
    setPendingDurationSec(null);
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
          <TodoList onTasksChange={setTasksSnapshot} />
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
      </div>
    </div>
  );
}