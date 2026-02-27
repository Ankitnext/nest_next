export function NewsletterCta() {
  return (
    <section className="rounded-2xl border border-slate-600/70 bg-slate-900/80 p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Stay Updated</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Weekly drops and private deal alerts.</h3>
          <p className="mt-2 text-sm text-slate-300">
            Subscribe for early access to new arrivals and best-price product bundles.
          </p>
        </div>
        <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-full border border-slate-500 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 outline-none ring-emerald-300 placeholder:text-slate-400 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

