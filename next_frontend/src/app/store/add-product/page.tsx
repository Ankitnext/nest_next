export default function StoreAddProductPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">Add Product</h2>
      <form className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-6 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm text-slate-200">Product Name</span>
          <input
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
            placeholder="CloudLite Laptop 14"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-200">Category</span>
          <input
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
            placeholder="Computers"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-200">Price</span>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
            placeholder="999"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-200">Stock Count</span>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
            placeholder="40"
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm text-slate-200">Description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300"
            placeholder="Explain the key value proposition."
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-cyan-300"
          >
            Publish Product
          </button>
        </div>
      </form>
    </section>
  );
}

