import Link from "next/link";

type CategoryStripProps = {
  categories: string[];
  activeCategory?: string;
  activeVendor?: string;
};

export function CategoryStrip({ categories, activeCategory, activeVendor }: CategoryStripProps) {
  if (categories.length === 0) return null;
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5">
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/shop${activeVendor ? `?vendor=${encodeURIComponent(activeVendor)}` : ""}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            !activeCategory
              ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
              : "border-slate-600/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-200"
          }`}
        >
          All
        </Link>
        {categories.map((category) => {
          const isActive = category.toLowerCase() === activeCategory?.toLowerCase();
          const href = `/shop?category=${encodeURIComponent(category)}${activeVendor ? `&vendor=${encodeURIComponent(activeVendor)}` : ""}`;
          return (
            <Link
              key={category}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                  : "border-slate-600/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-200"
              }`}
            >
              {category}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
