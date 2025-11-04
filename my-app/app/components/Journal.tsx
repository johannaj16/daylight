'use client';

import { useEffect, useState } from 'react';
import { loadSessions, type WorkSession } from '@/lib/sessions';

type Props = {
  className?: string;
  storageKey?: string;          // e.g. "journal:2025-10-06"
  placeholder?: string;
  autosaveMs?: number;          // e.g. 800 (debounced autosave)
};

export default function Journal({
  storageKey = 'journal:today',
  placeholder = 'Write freely about your day…',
  autosaveMs = 800,
}: Props) {
  const [text, setText] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setText(saved);
    } catch {}
  }, [storageKey]);

  // Debounced autosave
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, text);
        setSavedAt(new Date());
      } catch {}
    }, autosaveMs);
    return () => clearTimeout(id);
  }, [text, storageKey, autosaveMs]);

  // Set mounted flag to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load work sessions with reflections
  useEffect(() => {
    if (!isMounted) return;
    const sessions = loadSessions();
    // Filter sessions that have reflections
    const sessionsWithReflections = sessions.filter(
      s => s.taskReflections && Object.keys(s.taskReflections).length > 0
    );
    setWorkSessions(sessionsWithReflections);
  }, [isMounted]);

  // Refresh work sessions when storage might change (could be improved with event listeners)
  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      const sessions = loadSessions();
      const sessionsWithReflections = sessions.filter(
        s => s.taskReflections && Object.keys(s.taskReflections).length > 0
      );
      setWorkSessions(sessionsWithReflections);
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isMounted]);

  const fmtWhen = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <>
      <section className="rounded-xl border border-gray-300 bg-white shadow-sm m-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
          <h2 className="font-semibold text-gray-500">Journal</h2>
          <div className="text-xs text-gray-500">
            {isMounted && savedAt ? `Autosaved ${savedAt.toLocaleTimeString()}` : 'Not saved yet'}
          </div>
        </div>

        <div className="p-4">
          <label htmlFor="journal-textarea" className="sr-only">
            Journal entry
          </label>
          <textarea
            id="journal-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[180px] resize-y leading-7 outline-none text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </section>

      {/* Work Session Reflections */}
      {isMounted && workSessions.length > 0 && (
        <section className="rounded-xl border border-gray-300 bg-white shadow-sm m-6">
          <div className="px-4 py-3 border-b border-gray-300">
            <h2 className="font-semibold text-gray-500">Work Session Reflections</h2>
          </div>
          <div className="p-4 space-y-6">
            {workSessions.map((session) => (
              <div key={session.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-600 text-sm mb-1">
                    {fmtWhen(session.startedAtISO)}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {Math.floor(session.durationSec / 60)} min
                  </p>
                </div>
                {session.tasks && session.taskReflections && (
                  <div className="space-y-4">
                    {session.tasks.map((task) => {
                      const reflection = session.taskReflections?.[task.id];
                      if (!reflection) return null;
                      return (
                        <div key={task.id} className="pl-4 border-l-2 border-gray-200">
                          <h4 className="font-medium text-gray-700 text-sm mb-2">
                            {task.text}
                          </h4>
                          <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                            {reflection}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
