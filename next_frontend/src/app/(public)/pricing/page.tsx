const plans = [
  {
    name: "Starter",
    price: "$0",
    detail: "For new chefs testing their first menu.",
    features: ["Up to 20 meals", "Basic analytics", "Standard support"],
  },
  {
    name: "Growth",
    price: "$39/mo",
    detail: "For active kitchens scaling monthly orders.",
    features: ["Unlimited meals", "Advanced analytics", "Priority support"],
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
      <h1 className="text-3xl font-semibold text-slate-900">Kitchen Pricing</h1>
      <p className="max-w-2xl text-slate-600">
        Choose a plan based on your stage. Upgrade anytime as your kitchen grows.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className="rounded-2xl border border-slate-200 bg-white/80 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300">{plan.name}</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{plan.price}</h2>
            <p className="mt-2 text-sm text-slate-600">{plan.detail}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-800">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-orange-300">
              Choose {plan.name}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

