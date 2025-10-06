'use client';

import { useState, useEffect } from 'react';
import Timer from '../components/Timer';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: 'academic' | 'personal' | 'health' | 'other';
}

interface WorkSession {
  id: string;
  tasks: Task[];
  duration: number; // in milliseconds
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
}

const presetDurations = [
  { label: '25 min (Pomodoro)', value: 25 * 60 * 1000 },
  { label: '45 min (Study)', value: 45 * 60 * 1000 },
  { label: '60 min (Deep Work)', value: 60 * 60 * 1000 },
  { label: '90 min (Research)', value: 90 * 60 * 1000 },
];

export default function WorkSessionPage() {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [sessionDuration, setSessionDuration] = useState(25 * 60 * 1000); // 25 minutes default
  const [customDuration, setCustomDuration] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<WorkSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);

  // Load session history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('work-session-history');
    if (saved) {
      setSessionHistory(JSON.parse(saved));
    }
  }, []);

  // Save session history to localStorage
  useEffect(() => {
    localStorage.setItem('work-session-history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const addTask = () => {
    const text = prompt('Enter task description:');
    if (text?.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        category: 'academic',
      };
      setSelectedTasks([...selectedTasks, newTask]);
    }
  };

  const toggleTask = (id: string) => {
    setSelectedTasks(selectedTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id: string) => {
    setSelectedTasks(selectedTasks.filter(task => task.id !== id));
  };

  const startSession = () => {
    if (selectedTasks.length === 0) {
      alert('Please add at least one task before starting a session.');
      return;
    }

    const session: WorkSession = {
      id: Date.now().toString(),
      tasks: [...selectedTasks],
      duration: sessionDuration,
      startTime: new Date(),
      completed: false,
    };

    setCurrentSession(session);
    setIsSessionActive(true);
  };

  const endSession = () => {
    if (currentSession) {
      const completedSession: WorkSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true,
      };
      
      setSessionHistory([completedSession, ...sessionHistory]);
      setCurrentSession(null);
      setIsSessionActive(false);
    }
  };

  const handleTimerComplete = () => {
    endSession();
    alert('Session completed! Great work!');
  };

  const handleCustomDurationChange = (value: string) => {
    setCustomDuration(value);
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0) {
      setSessionDuration(minutes * 60 * 1000);
    }
  };

  const completedTasks = selectedTasks.filter(task => task.completed).length;
  const totalTasks = selectedTasks.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              <h1 className="text-2xl font-normal text-gray-800">Work Session</h1>
            </div>
            <div className="text-sm text-gray-500">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!isSessionActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Task Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Select Tasks</h2>
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks selected</p>
                    <p className="text-sm">Add tasks to get started</p>
                  </div>
                ) : (
                  selectedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Session Configuration */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Session Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {presetDurations.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setSessionDuration(preset.value)}
                        className={`p-3 text-sm rounded-md border transition-colors ${
                          sessionDuration === preset.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => handleCustomDurationChange(e.target.value)}
                    placeholder="Enter minutes"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="180"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={startSession}
                    disabled={selectedTasks.length === 0}
                    className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                  >
                    Start Work Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Session View */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Work Session in Progress</h2>
              <p className="text-gray-600">Stay focused and work on your selected tasks</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <Timer
                duration={sessionDuration}
                onComplete={handleTimerComplete}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Session Tasks</h3>
              <div className="space-y-2">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        task.completed
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800'
                      }`}
                    >
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={endSession}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                End Session Early
              </button>
            </div>
          </div>
        )}

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Sessions</h2>
            <div className="space-y-3">
              {sessionHistory.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">
                        {Math.round(session.duration / 60000)} minute session
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.startTime && new Date(session.startTime).toLocaleDateString()} at{' '}
                        {session.startTime && new Date(session.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.tasks.filter(t => t.completed).length} / {session.tasks.length} tasks completed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

