const plans = [
  {
    name: "Starter",
    price: "$0",
    detail: "For new sellers testing their first catalog.",
    features: ["Up to 20 products", "Basic analytics", "Standard support"],
  },
  {
    name: "Growth",
    price: "$39/mo",
    detail: "For active stores scaling monthly revenue.",
    features: ["Unlimited products", "Advanced analytics", "Priority support"],
  },
  {
    name: "Scale",
    price: "$119/mo",
    detail: "For high-volume brands with multi-team workflows.",
    features: ["Custom onboarding", "Dedicated manager", "API automation"],
  },
];

export default function PricingPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-100">Seller Pricing</h1>
      <p className="max-w-2xl text-slate-300">
        Choose a plan based on your stage. Upgrade anytime as your store grows.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{plan.name}</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{plan.price}</h2>
            <p className="mt-2 text-sm text-slate-300">{plan.detail}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300">
              Choose {plan.name}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

