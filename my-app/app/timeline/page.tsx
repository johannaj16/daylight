'use client';
import { useEffect, useState } from 'react';
import VerticalNavbar from '../components/VerticalNavbar';
import { loadSessions, type WorkSession } from '@/lib/sessions';
import TimelineChart from './components/TimelineChart';
import SessionList from './components/SessionList';
import EmptyState from './components/EmptyState';
import MonthTimeline from './components/MonthTimeline';
import { getDaysInRange, formatDateKey } from '@/lib/days';

export default function TimelinePage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [days, setDays] = useState<any[]>([]);
  // default to current day selected
  const [selectedDay, setSelectedDay] = useState<string | null>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const loadedSessions = loadSessions();
    // Sort by date (newest first for display)
    loadedSessions.sort(
      (a, b) => new Date(b.startedAtISO).getTime() - new Date(a.startedAtISO).getTime()
    );
    setSessions(loadedSessions);
    // load days for current month
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
    const end = new Date(today.getFullYear(), today.getMonth()+1, 0).toISOString().slice(0,10);
    const monthDays = getDaysInRange(start, end);
    setDays(monthDays);
  }, []);
  // If a day is selected, only show sessions for that day
  const displayedSessions = selectedDay
    ? sessions.filter((s) => (s.startedAtISO || '').slice(0, 10) === selectedDay)
    : sessions;

  return (
    <div className="text-gray-500 min-h-screen bg-white flex">
      <VerticalNavbar />
      <div className="flex flex-col flex-1 max-w-6xl mx-auto overflow-y-auto py-6 px-6">
        <h1 className="font-bold text-2xl mb-6">Timeline</h1>
        
        {sessions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <MonthTimeline
              days={days}
              year={new Date().getFullYear()}
              month={new Date().getMonth()}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
            {/* <TimelineChart sessions={displayedSessions} /> */}
            <SessionList sessions={displayedSessions} />
          </>
        )}
      </div>
    </div>
  );
}

