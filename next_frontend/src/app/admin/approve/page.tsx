const requests = [
  { store: "sound-craft", owner: "Mia Stone", category: "Audio" },
  { store: "pixel-parts", owner: "Ethan Reed", category: "Accessories" },
  { store: "zen-space", owner: "Sophia Kim", category: "Home" },
];

export default function AdminApprovePage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">Pending Store Approvals</h2>
      <div className="space-y-3">
        {requests.map((request) => (
          <article
            key={request.store}
            className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-100">{request.store}</h3>
              <p className="text-sm text-slate-300">
                Owner: {request.owner} • Category: {request.category}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950">
                Approve
              </button>
              <button className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200">
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

