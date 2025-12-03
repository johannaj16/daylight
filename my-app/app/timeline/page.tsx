"use client";
import { useEffect, useState } from "react";
import { loadSessions, type WorkSession } from "@/lib/sessions";
import SessionList from "./components/SessionList";
import EmptyState from "./components/EmptyState";
import MonthTimeline from "./components/MonthTimeline";
import { getDaysInRange } from "@/lib/days";
import PageShell from "../components/PageShell";

export default function TimelinePage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [days, setDays] = useState<any[]>([]);
  // default to current day selected
  const [selectedDay, setSelectedDay] = useState<string | null>(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const loadedSessions = loadSessions();
    // Sort by date (newest first for display)
    loadedSessions.sort(
      (a, b) =>
        new Date(b.startedAtISO).getTime() - new Date(a.startedAtISO).getTime()
    );
    setSessions(loadedSessions);
    // load days for current month
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);
    const monthDays = getDaysInRange(start, end);
    setDays(monthDays);
  }, []);
  // If a day is selected, only show sessions for that day
  const displayedSessions = selectedDay
    ? sessions.filter(
        (s) => (s.startedAtISO || "").slice(0, 10) === selectedDay
      )
    : sessions;

  const headerDescription =
    "See how your work sessions stack up across the month. Tap any date to zoom in on that day’s wins.";

  return (
    <PageShell title="Timeline" description={headerDescription}>
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
          <SessionList sessions={displayedSessions} selectedDay={selectedDay} />
        </>
      )}
    </PageShell>
  );
}
