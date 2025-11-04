'use client';
import { useEffect, useState } from 'react';
import VerticalNavbar from '../components/VerticalNavbar';
import { loadSessions, type WorkSession } from '@/lib/sessions';
import TimelineChart from './components/TimelineChart';
import SessionList from './components/SessionList';
import EmptyState from './components/EmptyState';

export default function TimelinePage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    const loadedSessions = loadSessions();
    // Sort by date (newest first for display)
    loadedSessions.sort(
      (a, b) => new Date(b.startedAtISO).getTime() - new Date(a.startedAtISO).getTime()
    );
    setSessions(loadedSessions);
  }, []);

  return (
    <div className="text-gray-500 min-h-screen bg-white flex">
      <VerticalNavbar />
      <div className="flex flex-col flex-1 max-w-6xl mx-auto overflow-y-auto py-6 px-6">
        <h1 className="font-bold text-2xl mb-6">Timeline</h1>
        
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <TimelineChart sessions={sessions} />
            <SessionList sessions={sessions} />
          </>
        )}
      </div>
    </div>
  );
}

