const stores = [
  { name: "pulse-gear", owner: "Ava Carter", products: 46, status: "Active" },
  { name: "urban-active", owner: "Noah Patel", products: 38, status: "Active" },
  { name: "pixel-hub", owner: "Iris Walker", products: 24, status: "Review" },
  { name: "home-workflow", owner: "Liam Ross", products: 31, status: "Active" },
];

export default function AdminStoresPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">Store Directory</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-200">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.name} className="border-t border-slate-700 text-slate-300">
                <td className="px-4 py-3 font-medium text-slate-100">{store.name}</td>
                <td className="px-4 py-3">{store.owner}</td>
                <td className="px-4 py-3">{store.products}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                    {store.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

