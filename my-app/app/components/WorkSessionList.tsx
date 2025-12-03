'use client';

import { useEffect, useState } from 'react';
import type { WorkSession } from '@/lib/sessions';

const STORAGE_KEY = 'workSessions';

export default function WorkSessionList() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr: WorkSession[] = raw ? JSON.parse(raw) : [];
      arr.sort(
        (a, b) =>
          new Date(b.startedAtISO).getTime() - new Date(a.startedAtISO).getTime()
      );
      setSessions(arr);
    } catch {
      setSessions([]);
    }
  }, []);

  const fmtWhen = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const fmtDur = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s ? `${m}m ${s}s` : `${m}m`;
  };

  if (sessions.length === 0) {
    return (
      <div className="rounded-3xl border border-[color:var(--muted-border)] bg-white/90 px-6 py-8 text-center shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--brand-500)]">
          Recent sessions
        </p>
        <p className="mt-2 text-sm text-gray-500">
          No completed sessions yet. Start a sprint to see the streak build.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-3xl border border-[color:var(--muted-border)] bg-white/90 px-6 py-6 shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--brand-500)]">
            Recent sessions
          </p>
          <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
            Logged sprints at a glance
          </h2>
        </div>
        <span className="rounded-full bg-white px-4 py-1 text-xs font-medium text-[color:var(--brand-600)] shadow-inner">
          {sessions.length} captured
        </span>
      </div>

      <ul className="space-y-3">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--muted-border)] bg-white/90 px-4 py-4 shadow-[0_25px_40px_-35px_rgba(212,79,0,0.8)]"
          >
            <div>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {fmtWhen(s.startedAtISO)}
              </p>
              <p className="text-xs text-gray-500">
                {s.completedTaskIds.length} task
                {s.completedTaskIds.length === 1 ? '' : 's'} completed
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--brand-600)]">
              <span className="rounded-full bg-[color:var(--brand-100)] px-3 py-1 text-xs uppercase tracking-[0.3em]">
                {fmtDur(s.durationSec)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
