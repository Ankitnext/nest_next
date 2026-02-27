const orders = [
  { id: "NC-2145", date: "Feb 20, 2026", total: "$329.99", status: "Delivered" },
  { id: "NC-2101", date: "Feb 11, 2026", total: "$129.99", status: "Shipped" },
  { id: "NC-1982", date: "Jan 28, 2026", total: "$89.00", status: "Processing" },
];

export default function OrdersPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-100">Order History</h1>
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-200">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-slate-700 text-slate-300">
                <td className="px-4 py-3 font-medium text-slate-100">{order.id}</td>
                <td className="px-4 py-3">{order.date}</td>
                <td className="px-4 py-3">{order.total}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                    {order.status}
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

