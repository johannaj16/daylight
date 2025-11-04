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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</h3>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex gap-4 items-start">
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
                className="flex flex-col items-center min-w-[56px] cursor-pointer select-none"
              >
                <div className="text-xs text-gray-400 mb-2">{d.getDate()}</div>

                {/* Day dot (filled if we have day data). If selected, show accent ring */}
                <div
                  className={`w-4 h-4 rounded-full mb-4 ${day ? 'bg-gray-600' : 'bg-gray-200'} ${isSelected ? 'ring-2 ring-indigo-400' : ''}`}
                />

                {/* Session dots */}
                <div className="flex flex-col gap-4 items-center mt-1">
                  {sessions.length === 0 ? (
                    <div className="text-xs text-gray-300">&nbsp;</div>
                  ) : (
                    sessions.map((s) => (
                      <div key={s.id} className="w-2 h-2 rounded-full bg-gray-500" title={new Date(s.startedAtISO).toLocaleTimeString()} />
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
