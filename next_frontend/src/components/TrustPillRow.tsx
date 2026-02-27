const trustItems = [
  "Express Delivery",
  "Secure Checkout",
  "Easy Returns",
  "Verified Stores",
  "24/7 Support",
];

export function TrustPillRow() {
  return (
    <section className="flex flex-wrap gap-3">
      {trustItems.map((item) => (
        <span
          key={item}
          className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200"
        >
          {item}
        </span>
      ))}
    </section>
  );
}

