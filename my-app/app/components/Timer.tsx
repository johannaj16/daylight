'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type TimerProps = {
  resetSignal?: number;
  // Fired once when the countdown reaches 0
  onComplete?: (durationSec: number) => void;
};

export default function Timer({ resetSignal = 0, onComplete }: TimerProps) {
  // duration/remaining in seconds
  const [minutesInput, setMinutesInput] = useState<number>(25);
  const [duration, setDuration] = useState<number>(25 * 60);
  const [remaining, setRemaining] = useState<number>(25 * 60);
  const [running, setRunning] = useState<boolean>(false);

  // ring geometry
  const size = 375;                // svg width/height
  const stroke = 12;               // ring thickness
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const intervalRef = useRef<number | null>(null);
  const startTsRef = useRef<number | null>(null); // for drift resistant timing
  const pausedAtRef = useRef<number | null>(null);
  const completedFiredRef = useRef<boolean>(false); // guard to avoid double fire

  const progress = useMemo(() => {
    if (duration <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - remaining / duration));
  }, [duration, remaining]);

  const dashOffset = useMemo(
    () => circumference * (1 - progress),
    [circumference, progress]
  );

  function format(secs: number) {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const ss = String(s % 60).padStart(2, '0');
    return `${m}:${ss}`;
  }

  function stopInternal() {
    setRunning(false);
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    startTsRef.current = null;
    pausedAtRef.current = null;
  }

  function applyMinutes() {
    const secs = Math.max(1, Math.floor(minutesInput * 60));
    setDuration(secs);
    setRemaining(secs);
    setRunning(false);
    completedFiredRef.current = false;
    stopInternal();
  }

  function start() {
    if (running || duration <= 0) return;
    setRunning(true);

    const now = performance.now();
    const alreadyElapsed =
      pausedAtRef.current && startTsRef.current
        ? (pausedAtRef.current - startTsRef.current) / 1000
        : (duration - remaining);

    startTsRef.current = now - alreadyElapsed * 1000;
    pausedAtRef.current = null;

    intervalRef.current = window.setInterval(() => {
      if (!startTsRef.current) return;
      const elapsed = (performance.now() - startTsRef.current) / 1000;
      const newRemaining = Math.max(0, duration - elapsed);
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        stopInternal();

        // Fire onComplete once per cycle
        if (!completedFiredRef.current) {
          completedFiredRef.current = true;
          onComplete?.(duration);
        }
      }
    }, 100); // smooth progress
  }

  function pause() {
    if (!running) return;
    setRunning(false);
    pausedAtRef.current = performance.now();
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
    if (intervalRef.current != null) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    startTsRef.current = null;
    pausedAtRef.current = null;
    completedFiredRef.current = false;
  }

  // 👇 whenever parent bumps resetSignal, run the same internal reset()
  useEffect(() => {
    reset();
  }, [resetSignal]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section className="w-full flex flex-col items-center gap-6 py-8 text-gray-400">
      {/* Controls */}
      <div className="flex items-end gap-3">
        <div className="flex flex-col">
          <label htmlFor="minutes" className="text-sm text-gray-600">
            Minutes
          </label>
          <input
            id="minutes"
            type="number"
            min={1}
            max={240}
            step={1}
            value={minutesInput}
            onChange={(e) => setMinutesInput(Number(e.target.value))}
            className="w-50 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          onClick={applyMinutes}
          className="h-10 px-4 rounded-lg bg-gray-500 cursor-pointer text-white hover:bg-gray-500"
        >
          Set
        </button>
      </div>

      {/* Circular timer */}
      <div className="relative" aria-live="polite" aria-label="Remaining time">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="text-gray-200"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="text-gray-500 transition-[stroke-dashoffset]"
            stroke="currentColor"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-semibold tabular-nums">{format(remaining)}</div>
          <div className="text-xs text-gray-500">
            {running ? 'Counting down…' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Progress text */}
      <div className="text-sm text-gray-600">
        {Math.round(progress * 100)}% complete · Total {format(duration)}
      </div>

      {/* Start/Reset Buttons */}
      <div className="flex gap-2">
        <button
          onClick={running ? pause : start}
          className="h-10 px-4 rounded-lg bg-gray-500 text-white hover:bg-gray-500 cursor-pointer"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="cursor-pointer h-10 px-4 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </section>
  );
}
