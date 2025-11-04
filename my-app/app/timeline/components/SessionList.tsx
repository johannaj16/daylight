import type { WorkSession } from '@/lib/sessions';
import SessionCard from './SessionCard';

type Props = {
  sessions: WorkSession[];
};

export default function SessionList({ sessions }: Props) {
  return (
    <div className="mt-8">
      <h2 className="font-semibold text-xl mb-4">All Sessions</h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}

