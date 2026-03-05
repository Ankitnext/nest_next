const storeOrders = [
  { id: "SO-901", customer: "Daniel Cole", amount: "$329.99", status: "Packed" },
  { id: "SO-902", customer: "Riya Gupta", amount: "$199.00", status: "Shipped" },
  { id: "SO-903", customer: "Oliver Ray", amount: "$89.50", status: "Pending" },
];

export default function StoreOrdersPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Store Orders</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-800">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {storeOrders.map((order) => (
              <tr key={order.id} className="border-t border-slate-200 text-slate-600">
                <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                <td className="px-4 py-3">{order.customer}</td>
                <td className="px-4 py-3">{order.amount}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs text-cyan-200">
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

