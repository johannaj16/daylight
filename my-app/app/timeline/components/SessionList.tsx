import type { WorkSession } from '@/lib/sessions';
import SessionCard from './SessionCard';
import EmptyState from './EmptyState';

type Props = {
  sessions: WorkSession[];
  selectedDay?: string | null;
};

export default function SessionList({ sessions, selectedDay }: Props) {
  const heading = selectedDay
    ? `Sessions for ${new Date(selectedDay).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`
    : 'All Sessions';

  return (
    <div className="mt-8">
      <h2 className="font-semibold text-xl mb-4">{heading}</h2>
      <div className="space-y-3">
        {sessions.length === 0 ? <EmptyState /> : sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

