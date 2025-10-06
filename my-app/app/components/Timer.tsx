'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  duration: number; // in milliseconds
  onComplete?: () => void;
  onTick?: (elapsed: number) => void;
}

export default function Timer({ duration, onComplete, onTick }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create Web Worker
    workerRef.current = new Worker(new URL('../timer-worker.js', import.meta.url));
    
    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;
      
      switch (type) {
        case 'TICK':
          setElapsed(data.elapsed);
          onTick?.(data.elapsed);
          
          if (data.elapsed >= duration) {
            stop();
            onComplete?.();
          }
          break;
          
        case 'PAUSED':
          setIsPaused(true);
          setIsRunning(false);
          break;
          
        case 'STOPPED':
          setIsRunning(false);
          setIsPaused(false);
          setElapsed(0);
          break;
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [duration, onComplete, onTick]);

  const start = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'START' });
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pause = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'PAUSE' });
    }
  };

  const resume = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESUME' });
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatRemainingTime = (ms: number) => {
    const remaining = Math.max(0, duration - ms);
    const totalSeconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / duration) * 100, 100);

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
          {formatRemainingTime(elapsed)}
        </div>
        <div className="text-sm text-gray-500">
          {formatTime(elapsed)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-blue-600"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${progress}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!isRunning && !isPaused && (
          <button
            onClick={start}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Start
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={pause}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            Pause
          </button>
        )}
        
        {isPaused && (
          <button
            onClick={resume}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Resume
          </button>
        )}
        
        {(isRunning || isPaused) && (
          <button
            onClick={stop}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

