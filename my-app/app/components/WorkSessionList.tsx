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
      // newest first
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
      <div className="px-6 py-6 text-sm text-gray-500">
        No completed sessions yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-6 py-6 text-gray-300">
      <h2 className="text-md font-semibold text-gray-500">Completed Sessions</h2>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border bg-white p-3 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-500">{fmtWhen(s.startedAtISO)}</div>
              <div className="text-sm text-gray-400">
                {s.completedTaskIds.length} task
                {s.completedTaskIds.length === 1 ? '' : 's'} completed
              </div>
            </div>
            <div className="text-sm text-gray-400">{fmtDur(s.durationSec)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
