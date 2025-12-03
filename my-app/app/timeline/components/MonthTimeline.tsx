"use client";

import React from 'react';
import type { DayData } from '@/lib/days';

type Props = {
  days: DayData[]; // array of day objects for the month (may be sparse)
  year: number;
  month: number; // 0-indexed month
  selectedDay?: string | null;
  onSelectDay?: (date: string | null) => void;
};

function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function MonthTimeline({ days, year, month, selectedDay, onSelectDay }: Props) {
  const byDate = new Map(days.map(d => [d.date, d] as [string, DayData]));
  const monthDays = getDaysInMonth(year, month);

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-3xl border border-[color:var(--muted-border)] bg-white/90 px-6 py-6 shadow-[0_35px_80px_-60px_rgba(212,79,0,0.9)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-[color:var(--foreground)]">
            {new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        {selectedDay && (
          <button
            onClick={() => onSelectDay?.(null)}
            className="rounded-full border border-[color:var(--muted-border)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 hover:border-[color:var(--brand-200)]"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="timeline-scroll w-full min-w-0 overflow-x-auto overflow-y-hidden pb-2">
        <div className="flex w-max flex-nowrap items-start gap-4 pr-4">
          {monthDays.map((d) => {
            const key = d.toISOString().slice(0,10);
            const day = byDate.get(key);
            const sessions = day?.workSessions || [];
            const isSelected = selectedDay === key;

            const handleClick = () => {
              if (!onSelectDay) return;
              // toggle selection: clicking again clears
              onSelectDay(isSelected ? null : key);
            };

            return (
              <div
                key={key}
                onClick={handleClick}
                className={`flex min-w-[68px] cursor-pointer select-none flex-col items-center rounded-2xl border px-3 py-3 transition-all flex-none ${
                  isSelected
                    ? 'border-[color:var(--brand-400)] bg-[color:var(--brand-100)] shadow-[0_25px_35px_-35px_rgba(212,79,0,0.9)]'
                    : 'border-transparent bg-white/70 hover:border-[color:var(--brand-200)]'
                }`}
              >
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gray-400">
                  {d.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="text-lg font-semibold text-[color:var(--foreground)]">
                  {d.getDate()}
                </p>
                <span
                  className={`mt-2 h-1.5 w-full rounded-full ${
                    day ? 'bg-[color:var(--brand-400)]' : 'bg-gray-200'
                  }`}
                />
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                  {sessions.length === 0 ? (
                    <span className="text-[0.6rem] uppercase tracking-[0.3em] text-gray-300">
                      —
                    </span>
                  ) : (
                    sessions.map((s) => (
                      <span
                        key={s.id}
                        className="h-2 w-2 rounded-full bg-[color:var(--brand-600)]"
                        title={new Date(s.startedAtISO).toLocaleTimeString()}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
