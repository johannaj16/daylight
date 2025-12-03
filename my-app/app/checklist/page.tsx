"use client";

import TodoList from "../components/TodoList";
import Journal from "../components/Journal";
import WorkSessionList from "../components/WorkSessionList";
import PageShell from "../components/PageShell";
import { formatDateKey } from "@/lib/days";

export default function ChecklistPage() {
  const todayKey = `journal:${formatDateKey()}`;
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const description =
    "Anchor the day with a single list. Capture todos, jot reflections, and glance at recent sessions without leaving this screen.";

  return (
    <PageShell title="Daily Flow" description={description}>
      <section className="rounded-3xl border border-[color:var(--muted-border)] bg-white/80 px-6 py-6 shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <p className="text-3xl font-semibold text-[color:var(--foreground)]">
            {formattedDate}
          </p>
          <span className="rounded-full bg-[color:var(--brand-100)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--brand-600)] mb-1">
            In Progress
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-gray-500">
          What does a great day look like? Use the blocks below to keep score
          and capture the story as you go.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <section className="rounded-3xl border border-[color:var(--muted-border)] bg-white/90 shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
          <div className="border-b border-[color:var(--muted-border)] px-6 py-5">
            <h2 className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">
              Today's tasks
            </h2>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <TodoList useDayStorage />
          </div>
        </section>

        <Journal storageKey={todayKey} className="h-full" />
      </div>

      <WorkSessionList />
    </PageShell>
  );
}
