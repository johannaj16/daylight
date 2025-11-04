'use client';
import { useCallback, useMemo, useState } from 'react';

import Timer from "../components/Timer"
import TodoList from "../components/TodoList"
import VerticalNavbar from "../components/VerticalNavbar"
import LogSessionPopup from "../components/LogSessionPopup"

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

  const [timerVersion, setTimerVersion] = useState(0);

  function handleLogSession(data: any) {
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
      focusRating: data.focusRating,
      improvementNotes: data.improvementNotes,
      tasks: tasksForSession,
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

    // TIMER REST LOGIC HERE
    setTimerVersion(v => v + 1); // <- remount Timer
  }

  return (
    <div className="text-gray-500 min-h-screen bg-white flex">
      <VerticalNavbar />
      <div className="flex flex-col flex-1 max-w-4xl mx-auto overflow-y-auto py-6">
        <Timer key={timerVersion} onComplete={handleTimerComplete} />
        <div className="mt-2 h-0.5 bg-gray-200" />

        <div className="py-6">
          <h1 className="font-bold text-xl pt-6 pl-6">
            What are your goals for this work session?
          </h1>
          <p className="px-6 mb-6">
            Be as quantitative as possible, (e.g. finish [X] math problems, read [Y] pages)
          </p>
          <TodoList storageKey="WorkSessionTodos" onTasksChange={handleTasksChange} />
        </div>

        {/* Log session prompt */}
        {showPrompt && 
        <LogSessionPopup
          open={showPrompt}
          pendingDurationSec={pendingDurationSec}
          tasksSnapshot={tasksSnapshot}
          onSubmit={(data) => {
            if (!data.shouldLog) return;
            console.log(data.focusRating)
            console.log(data.improvementNotes)
            handleLogSession(data);
          }}
          onClose={() => setPendingDurationSec(null)}
        />
      }
      </div>
    </div>
  );
}