const coupons = [
  { code: "WELCOME15", discount: "15%", uses: 420, expires: "Mar 31, 2026" },
  { code: "FLASH25", discount: "25%", uses: 193, expires: "Mar 02, 2026" },
  { code: "BUNDLE10", discount: "10%", uses: 641, expires: "Apr 15, 2026" },
];

export default function AdminCouponsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100">Coupon Campaigns</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {coupons.map((coupon) => (
          <article key={coupon.code} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Code</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{coupon.code}</h3>
            <p className="mt-2 text-sm text-slate-300">Discount: {coupon.discount}</p>
            <p className="text-sm text-slate-300">Uses: {coupon.uses}</p>
            <p className="text-sm text-slate-300">Expires: {coupon.expires}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

