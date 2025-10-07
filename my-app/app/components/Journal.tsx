'use client';

import { useEffect, useState } from 'react';

type Props = {
  className?: string;
  storageKey?: string;          // e.g. "journal:2025-10-06"
  placeholder?: string;
  autosaveMs?: number;          // e.g. 800 (debounced autosave)
};

export default function Journal({
  storageKey = 'journal:today',
  placeholder = 'Write freely about your day…',
  autosaveMs = 800,
}: Props) {
  const [text, setText] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setText(saved);
    } catch {}
  }, [storageKey]);

  // Debounced autosave
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, text);
        setSavedAt(new Date());
      } catch {}
    }, autosaveMs);
    return () => clearTimeout(id);
  }, [text, storageKey, autosaveMs]);

  return (
    <section className="rounded-xl border border-gray-300 bg-white shadow-sm m-6">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
        <h2 className="font-semibold text-gray-500">Journal</h2>
        <div className="text-xs text-gray-500">
          {savedAt ? `Autosaved ${savedAt.toLocaleTimeString()}` : 'Not saved yet'}
        </div>
      </div>

      <div className="p-4">
        <label htmlFor="journal-textarea" className="sr-only">
          Journal entry
        </label>
        <textarea
          id="journal-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[180px] resize-y leading-7 outline-none text-gray-800 placeholder:text-gray-400"
        />
      </div>
    </section>
  );
}
