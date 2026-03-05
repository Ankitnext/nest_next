const stores = [
  { name: "pulse-gear", owner: "Ava Carter", products: 46, status: "Active" },
  { name: "urban-active", owner: "Noah Patel", products: 38, status: "Active" },
  { name: "pixel-hub", owner: "Iris Walker", products: 24, status: "Review" },
  { name: "home-workflow", owner: "Liam Ross", products: 31, status: "Active" },
];

export default function AdminStoresPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Store Directory</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-800">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.name} className="border-t border-slate-200 text-slate-600">
                <td className="px-4 py-3 font-medium text-slate-900">{store.name}</td>
                <td className="px-4 py-3">{store.owner}</td>
                <td className="px-4 py-3">{store.products}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs text-orange-500">
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

