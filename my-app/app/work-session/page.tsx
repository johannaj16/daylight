"use client";
import { useCallback, useState } from "react";

import Timer from "../components/Timer";
import TodoList from "../components/TodoList";
import LogSessionPopup from "../components/LogSessionPopup";
import PageShell from "../components/PageShell";

import {
  addSession,
  updateSessionReflections,
  type Task,
  type WorkSession,
} from "@/lib/sessions";

// Task type from TodoList (with createdAt: Date)
type TodoListTask = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  isEditing?: boolean;
};

const rituals = [
  {
    title: "Prime the space",
    detail: "Silence notifications, clear your desk, water nearby.",
  },
  {
    title: "Define success",
    detail: "Write down the smallest win that would feel meaningful.",
  },
  {
    title: "Review reflections",
    detail: "Skim yesterday’s notes to avoid repeating friction.",
  },
];

export default function WorkSessionPage() {
  const [tasksSnapshot, setTasksSnapshot] = useState<Task[]>([]);
  const [pendingDurationSec, setPendingDurationSec] = useState<number | null>(
    null
  );
  const [showReflections, setShowReflections] = useState(false);
  const [loggedSessionId, setLoggedSessionId] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const showPrompt = pendingDurationSec !== null;

  const handleTasksChange = useCallback((tasks: TodoListTask[]) => {
    // Convert tasks from TodoList format (createdAt: Date) to sessions format (createdAt?: string)
    const convertedTasks: Task[] = tasks.map((t) => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      createdAt:
        t.createdAt instanceof Date ? t.createdAt.toISOString() : undefined,
    }));
    setTasksSnapshot(convertedTasks);
  }, []);

  function handleTimerComplete(durationSec: number) {
    // Timer finished—let user confirm logging
    setPendingDurationSec(durationSec);
    // bump promptVersion so the popup remounts reliably on repeated completes
    setPromptVersion((v) => v + 1);
  }

  const [timerVersion, setTimerVersion] = useState(0);
  const [promptVersion, setPromptVersion] = useState(0);

  function handleLogSession(data: any) {
    if (pendingDurationSec == null) return;

    const completedIds = tasksSnapshot
      .filter((t) => t.completed)
      .map((t) => t.id);
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
    tasksSnapshot.forEach((task) => {
      initialReflections[task.id] = "";
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
    setTimerVersion((v) => v + 1); // <- remount Timer
  }

  const description =
    "Drop into a focused sprint. Set intentional goals, run the timer, then capture the reflections that move tomorrow faster.";

  return (
    <PageShell title="Work Sprint" description={description}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <section className="rounded-3xl border border-[color:var(--muted-border)] bg-white/90 px-6 py-6 shadow-[0_40px_60px_-50px_rgba(230,88,12,0.9)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
            </div>
          </div>
          <Timer key={timerVersion} onComplete={handleTimerComplete} />
        </section>

        {/* <section className="rounded-3xl border border-[color:var(--muted-border)] bg-[color:var(--surface-muted)]/80 px-6 py-6">
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">
            Before you press start
          </h2>
          <ul className="mt-5 space-y-4">
            {rituals.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-gray-600 shadow-[0_15px_35px_-25px_rgba(209,73,8,0.9)]"
              >
                <p className="font-semibold text-[color:var(--foreground)]">
                  {step.title}
                </p>
                <p className="mt-1 text-gray-500">{step.detail}</p>
              </li>
            ))}
          </ul>
        </section> */}
              <section className="rounded-3xl border border-[color:var(--muted-border)] bg-white/90 shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
        <div className="border-b border-[color:var(--muted-border)] px-6 py-6">
          <h2 className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">
            What will you finish this session?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Be specific and measurable. “Outline intro + 2 body paragraphs” is
            easier to check off than “write essay”.
          </p>
        </div>
        <div className="px-4 py-4 sm:px-6">
          <TodoList
            storageKey="WorkSessionTodos"
            onTasksChange={handleTasksChange}
          />
        </div>
      </section>
      </div>

      {/* Log session prompt */}
      {showPrompt && (
        <LogSessionPopup
          key={promptVersion}
          open={showPrompt}
          pendingDurationSec={pendingDurationSec}
          tasksSnapshot={tasksSnapshot}
          onSubmit={(data) => {
            if (!data.shouldLog) return;
            handleLogSession(data);
          }}
          onClose={() => setPendingDurationSec(null)}
        />
      )}
    </PageShell>
  );
}
