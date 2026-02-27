import { MetricCard } from "@/components/MetricCard";

export default function StorePage() {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue" value="$21,300" trend="+12.4% this week" />
        <MetricCard label="Orders" value="182" trend="+18 from yesterday" />
        <MetricCard label="New Customers" value="57" trend="+6.1% growth" />
        <MetricCard label="Conversion Rate" value="3.8%" trend="+0.9% this month" />
      </div>
      <article className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Today&apos;s Tasks</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• Restock low inventory products.</li>
          <li>• Respond to 12 customer messages.</li>
          <li>• Schedule weekend flash sale campaign.</li>
        </ul>
      </article>
    </section>
  );
}

