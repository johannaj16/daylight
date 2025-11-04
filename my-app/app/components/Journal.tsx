'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { loadSessions, type WorkSession } from '@/lib/sessions';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  RemoveFormatting 
} from 'lucide-react';

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
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[180px] px-4 py-3 text-gray-800 leading-7 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2',
      },
    },
    onUpdate: ({ editor }) => {
      // Update content state to trigger autosave
      const html = editor.getHTML();
      setEditorContent(html);
    },
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (!editor || !isMounted) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        editor.commands.setContent(saved);
        setEditorContent(saved);
      } else {
        // Even if no saved content, mark as loaded
        setEditorContent(editor.getHTML());
      }
      setHasLoadedFromStorage(true);
    } catch {}
  }, [editor, storageKey, isMounted]);

  // Debounced autosave (only after initial load from storage)
  useEffect(() => {
    if (!editor || !isMounted || !hasLoadedFromStorage) return;
    
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, editorContent);
        setSavedAt(new Date());
      } catch {}
    }, autosaveMs);
    
    return () => clearTimeout(id);
  }, [editorContent, storageKey, autosaveMs, isMounted, editor, hasLoadedFromStorage]);

  // Set mounted flag to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load work sessions with reflections
  useEffect(() => {
    if (!isMounted) return;
    const sessions = loadSessions();
    // Filter sessions that have reflections
    const sessionsWithReflections = sessions.filter(
      s => s.taskReflections && Object.keys(s.taskReflections).length > 0
    );
    setWorkSessions(sessionsWithReflections);
  }, [isMounted]);

  // Refresh work sessions when storage might change (could be improved with event listeners)
  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      const sessions = loadSessions();
      const sessionsWithReflections = sessions.filter(
        s => s.taskReflections && Object.keys(s.taskReflections).length > 0
      );
      setWorkSessions(sessionsWithReflections);
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isMounted]);

  const fmtWhen = (iso: string) =>
    new Date(iso).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (!editor) {
    return null;
  }

  return (
    <>
      <section className="rounded-xl border border-gray-300 bg-white shadow-sm m-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
          <h2 className="font-semibold text-gray-500">Journal</h2>
          <div className="text-xs text-gray-500">
            {isMounted && savedAt ? `Autosaved ${savedAt.toLocaleTimeString()}` : 'Not saved yet'}
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('underline') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('bulletList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('orderedList') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive('blockquote') ? 'bg-gray-200 text-gray-900' : 'text-gray-600'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            className="p-2 rounded hover:bg-gray-200 transition text-gray-600"
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <div className="p-0">
          <EditorContent editor={editor} />
        </div>
      </section>

      {/* Work Session Reflections */}
      {isMounted && workSessions.length > 0 && (
        <section className="rounded-xl border border-gray-300 bg-white shadow-sm m-6">
          <div className="px-4 py-3 border-b border-gray-300">
            <h2 className="font-semibold text-gray-500">Work Session Reflections</h2>
          </div>
          <div className="p-4 space-y-6">
            {workSessions.map((session) => (
              <div key={session.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-600 text-sm mb-1">
                    {fmtWhen(session.startedAtISO)}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {Math.floor(session.durationSec / 60)} min
                  </p>
                </div>
                {session.tasks && session.taskReflections && (
                  <div className="space-y-4">
                    {session.tasks.map((task) => {
                      const reflection = session.taskReflections?.[task.id];
                      if (!reflection) return null;
                      return (
                        <div key={task.id} className="pl-4 border-l-2 border-gray-200">
                          <h4 className="font-medium text-gray-700 text-sm mb-2">
                            {task.text}
                          </h4>
                          <p className="text-sm text-gray-600 leading-6 whitespace-pre-wrap">
                            {reflection}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
