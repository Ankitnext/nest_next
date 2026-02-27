import Link from "next/link";

type CategoryStripProps = {
  categories: string[];
};

export function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/shop?category=${encodeURIComponent(category)}`}
            className="rounded-full border border-slate-500 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-300 hover:text-emerald-200"
          >
            {category}
          </Link>
        ))}
      </div>
    </section>
  );
}
