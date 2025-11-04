import { forwardRef } from 'react';
import type { WorkSession } from '@/lib/sessions';
import { formatDate, formatTime, formatDuration, completedTasks } from './utils';

type Props = {
  session: WorkSession;
  position: { x: number; y: number; alignLeft: boolean };
};

const SessionTooltip = forwardRef<HTMLDivElement, Props>(({ session, position }, ref) => {
  const tasks = completedTasks(session);

  return (
    <div
      ref={ref}
      className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[280px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 120}px`,
        transform: position.alignLeft ? 'translateX(-100%)' : 'none',
      }}
    >
      <div className="space-y-2">
        <div>
          <div className="font-semibold text-gray-700">
            {formatDate(session.startedAtISO)}
          </div>
          <div className="text-sm text-gray-500">
            {formatTime(session.startedAtISO)}
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Duration: <span className="font-medium">{formatDuration(session.durationSec)}</span>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Completed Tasks ({session.completedTaskIds.length}):
          </div>
          {tasks.length > 0 ? (
            <ul className="space-y-1 text-sm text-gray-600">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>{task.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 italic">No tasks completed</p>
          )}
        </div>
      </div>
    </div>
  );
});

SessionTooltip.displayName = 'SessionTooltip';

export default SessionTooltip;

