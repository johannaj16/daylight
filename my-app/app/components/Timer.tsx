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
    <section className="w-full space-y-6 text-[color:var(--foreground)]">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--muted-border)] bg-white/80 px-4 py-3 shadow-inner">
            <input
              id="minutes"
              type="number"
              min={1}
              max={240}
              step={1}
              value={minutesInput}
              onChange={(e) => setMinutesInput(Number(e.target.value))}
              className="w-24 border-none bg-transparent text-2xl font-semibold text-[color:var(--foreground)] focus:outline-none"
            />
            <span className="text-sm text-gray-500">minutes</span>
          </div>
        </div>
        <button
          onClick={applyMinutes}
          className="h-12 rounded-2xl bg-[color:var(--brand-600)] px-6 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-[0_20px_45px_-30px_rgba(230,88,12,0.9)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-700)]"
        >
          Set timer
        </button>
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center">
        <div
          className="relative flex items-center justify-center rounded-[3rem] bg-gradient-to-b from-white/90 to-white/70 p-6 shadow-[0_40px_80px_-65px_rgba(212,79,0,0.9)]"
          aria-live="polite"
          aria-label="Remaining time"
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="select-none"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              className="text-[color:var(--brand-100)]"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={stroke}
              className="text-[color:var(--brand-600)] transition-[stroke-dashoffset]"
              stroke="currentColor"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-semibold tabular-nums">
              {format(remaining)}
            </div>
            <div className="text-sm text-gray-500">
              {running ? "Counting down" : "Paused"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-full bg-[color:var(--brand-100)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--brand-600)]">
          {Math.round(progress * 100)}% complete · Total {format(duration)}
        </div>
      </div>

      {/* Start/Reset Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={running ? pause : start}
          className="flex-1 rounded-2xl bg-[color:var(--brand-700)] px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_25px_45px_-35px_rgba(230,88,12,0.9)] transition hover:-translate-y-0.5 hover:bg-[color:var(--brand-800)]"
        >
          {running ? "Pause sprint" : "Start sprint"}
        </button>
        <button
          onClick={reset}
          className="flex-1 rounded-2xl border border-[color:var(--muted-border)] bg-white/80 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-gray-500 transition hover:border-[color:var(--brand-200)] hover:text-[color:var(--brand-500)]"
        >
          Reset timer
        </button>
      </div>
    </section>
  );
}
