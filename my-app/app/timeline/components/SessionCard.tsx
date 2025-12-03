import type { WorkSession } from '@/lib/sessions';
import { formatDate, formatTime, formatDuration, completedTasks } from './utils';

type Props = {
  session: WorkSession;
};

export default function SessionCard({ session }: Props) {
  const tasks = completedTasks(session);

  return (
    <div className="px-6 py-5 transition hover:bg-[color:var(--brand-100)]/40">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {formatDate(session.startedAtISO)} · {formatTime(session.startedAtISO)}
          </p>
          <p className="text-xs text-gray-500">
            Duration {formatDuration(session.durationSec)}
          </p>
        </div>
        <div className="rounded-full bg-[color:var(--brand-100)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--brand-600)]">
          {tasks.length} tasks
        </div>
      </div>

      {tasks.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-2xl border border-[color:var(--muted-border)] bg-white/80 px-4 py-2 text-sm text-[color:var(--foreground)] shadow-[0_15px_30px_-25px_rgba(212,79,0,0.9)]"
            >
              {task.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
