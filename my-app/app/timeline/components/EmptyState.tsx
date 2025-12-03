export default function EmptyState() {
  return (
    <div className="px-6 py-10 text-center text-gray-500">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--brand-100)] text-[color:var(--brand-600)]">
        ✦
      </div>
      <p className="text-lg font-semibold text-[color:var(--foreground)]">No work sessions yet</p>
      <p className="mt-2 text-sm text-gray-500">
        Complete a work session to see it on the timeline.
      </p>
    </div>
  );
}
