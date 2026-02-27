type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
};

export function MetricCard({ label, value, trend }: MetricCardProps) {
  return (
    <article className="card-light rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
      <p className="mt-1 text-xs font-semibold text-emerald-700">{trend}</p>
    </article>
  );
}

