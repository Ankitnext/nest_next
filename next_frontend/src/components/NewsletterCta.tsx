export function NewsletterCta() {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Stay Updated</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Weekly menus and special combo deals.</h3>
          <p className="mt-2 text-sm text-slate-600">
            Subscribe for early access to seasonal dishes and best-price meal bundles.
          </p>
        </div>
        <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm text-slate-900 outline-none ring-orange-500 placeholder:text-slate-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-orange-400"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

