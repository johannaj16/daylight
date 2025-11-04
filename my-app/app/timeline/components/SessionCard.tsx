import type { WorkSession } from '@/lib/sessions';
import { formatDate, formatTime, formatDuration, completedTasks } from './utils';

type Props = {
  session: WorkSession;
};

export default function SessionCard({ session }: Props) {
  const tasks = completedTasks(session);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-gray-700">
            {formatDate(session.startedAtISO)} at {formatTime(session.startedAtISO)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Duration: {formatDuration(session.durationSec)}
          </div>
          {tasks.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-600 mb-2">
                Completed Tasks:
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                {tasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    <span>{task.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

