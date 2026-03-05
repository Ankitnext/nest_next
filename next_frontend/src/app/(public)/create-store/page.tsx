export default function CreateStorePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Create Your Store</h1>
      <p className="max-w-2xl text-slate-600">
        Launch your catalog in minutes. This onboarding form is ready for Neon/PostgreSQL integration.
      </p>
      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm text-slate-800">Store Name</span>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            placeholder="Pulse Gear"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-800">Store Slug</span>
          <input
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            placeholder="pulse-gear"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-800">Owner Email</span>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            placeholder="owner@store.com"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-800">Category Focus</span>
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500">
            <option>Electronics</option>
            <option>Accessories</option>
            <option>Home</option>
            <option>Lifestyle</option>
          </select>
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm text-slate-800">Store Description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            placeholder="Tell shoppers what makes your store unique."
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-orange-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-orange-500"
          >
            Submit Application
          </button>
        </div>
      </form>
    </section>
  );
}

