export default function LoadingPreviewPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-slate-100">Loading States</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-700 bg-slate-900/70 p-4"
          >
            <div className="h-28 rounded-xl bg-slate-700/60" />
            <div className="mt-4 h-4 w-2/3 rounded bg-slate-700/60" />
            <div className="mt-2 h-3 w-full rounded bg-slate-700/60" />
            <div className="mt-2 h-3 w-5/6 rounded bg-slate-700/60" />
          </div>
        ))}
      </div>
    </section>
  );
}

