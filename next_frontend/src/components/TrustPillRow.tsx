const trustItems = [
  "Fast Preparation",
  "Secure Checkout",
  "Fresh Ingredients",
  "Top Rated Chefs",
  "24/7 Support",
];

export function TrustPillRow() {
  return (
    <section className="flex flex-wrap gap-3">
      {trustItems.map((item) => (
        <span
          key={item}
          className="rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange-400"
        >
          {item}
        </span>
      ))}
    </section>
  );
}

