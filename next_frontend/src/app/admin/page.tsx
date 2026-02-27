import { MetricCard } from "@/components/MetricCard";

export default function AdminPage() {
  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross Sales" value="$128,450" trend="+14.2% this month" />
        <MetricCard label="Orders" value="1,924" trend="+8.7% this month" />
        <MetricCard label="Active Stores" value="146" trend="+11 new approvals" />
        <MetricCard label="Refund Rate" value="1.8%" trend="Down 0.4%" />
      </div>

      <article className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
        <h2 className="text-lg font-semibold text-slate-100">Operational Alerts</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li>• 4 stores waiting for KYC verification.</li>
          <li>• 7 high-value orders flagged for manual review.</li>
          <li>• Coupon conversion up 19% after weekend campaign.</li>
        </ul>
      </article>
    </section>
  );
}

