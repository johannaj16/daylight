import type { WorkSession } from '@/lib/sessions';
import SessionCard from './SessionCard';
import EmptyState from './EmptyState';

function formatHeadingDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map((part) => parseInt(part, 10));
  if (!year || !month || !day) {
    return new Date(dateKey).toLocaleDateString();
  }
  // month/day come in as 1-indexed, so adjust for Date constructor to keep the local day stable
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type Props = {
  sessions: WorkSession[];
  selectedDay?: string | null;
};

export default function SessionList({ sessions, selectedDay }: Props) {
  const heading = selectedDay
    ? `Sessions for ${formatHeadingDate(selectedDay)}`
    : 'All Sessions';

  return (
    <section className="rounded-3xl border border-[color:var(--muted-border)] bg-white/90 shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
      <div className="border-b border-[color:var(--muted-border)] px-6 py-5">
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
          {heading}
        </h2>
      </div>
      <div className="divide-y divide-[color:var(--muted-border)]">
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          sessions.map((session) => <SessionCard key={session.id} session={session} />)
        )}
      </div>
    </section>
  );
}
