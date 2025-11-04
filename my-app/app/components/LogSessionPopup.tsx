import React, { useEffect, useRef, useState } from "react";

type Task = { id: string | number; completed: boolean; [k: string]: any };

type LogSessionPopupProps = {
  open: boolean;
  pendingDurationSec: number | null;
  tasksSnapshot: Task[];                   // used to count completed tasks
  onSubmit: (data: {
    shouldLog: boolean;
    focusRating?: number | null;          // optional data
    improvementNotes?: string;            // optional data
  }) => void;
  onClose: () => void;
};

export default function LogSessionPopup({
  open,
  pendingDurationSec,
  tasksSnapshot,
  onSubmit,
  onClose,
}: LogSessionPopupProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focusRating, setFocusRating] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // lock scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // reset flow each time it opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setFocusRating(null);
      setNotes("");
    }
  }, [open]);

  // Basic focus management
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open, step]);

  if (!open) return null;

  const minutes = Math.floor((pendingDurationSec ?? 0) / 60);
  const completed = tasksSnapshot.filter((t) => t.completed).length;

  const handleNo = () => {
    onSubmit({ shouldLog: false });
    onClose();
  };

  const handleYes = () => setStep(2);

  const handleSkipFocus = () => setStep(3);

  const handleContinueToNotes = () => setStep(3);

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = () => {
    onSubmit({
      shouldLog: true,
      focusRating,
      improvementNotes: notes.trim() || undefined,
    });
    // onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="log-session-title"
      onKeyDown={onKeyDown}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="w-[min(42rem,100%)] rounded-2xl border border-gray-300 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 id="log-session-title" className="text-lg font-semibold text-gray-800">
              Timer Completed
            </h2>
            <button
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Log session with <span className="font-semibold">{minutes} min</span> and{" "}
                  <span className="font-semibold">{completed}</span> completed task(s)?
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
                    onClick={handleYes}
                  >
                    Yes, log it
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={handleNo}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <p className="text-gray-700 font-medium">
                    (Optional) How effective was your session and how can you improve?
                  </p>
                  <p className="text-sm text-gray-500">
                    You can skip if you don’t want to rate.
                  </p>
                </div>

                {/* Rating: 1–5 */}
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`Focus ${n}`}
                      onClick={() => setFocusRating(n)}
                      className={[
                        "h-10 w-10 rounded-full border",
                        focusRating === n
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      onClick={handleSkipFocus}
                    >
                      Skip
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
                      onClick={handleContinueToNotes}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 font-medium">
                    (Optional) How could you improve next session?
                  </p>
                  <p className="text-sm text-gray-500">Jot a quick thought.</p>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="e.g., Turn off phone, smaller task chunks, stand up mid-way..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />

                <div className="flex justify-between gap-3 pt-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
                      onClick={handleSubmit}
                    >
                      Log session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
