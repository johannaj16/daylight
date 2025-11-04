import type { WorkSession } from '@/lib/sessions';

type Props = {
  session: WorkSession;
  position: number;
  onMouseEnter: (session: WorkSession, event: React.MouseEvent) => void;
  onMouseMove: (session: WorkSession, event: React.MouseEvent) => void;
  onMouseLeave: () => void;
};

export default function SessionPoint({ session, position, onMouseEnter, onMouseMove, onMouseLeave }: Props) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${position}%`, top: '50%' }}
      onMouseEnter={(e) => onMouseEnter(session, e)}
      onMouseMove={(e) => onMouseMove(session, e)}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative group">
        <div className="w-4 h-4 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md" />
        {/* Pulse effect */}
        <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
      </div>
    </div>
  );
}

