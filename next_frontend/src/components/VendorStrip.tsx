import Link from "next/link";

interface VendorStripProps {
  stores: string[];
  activeVendor?: string;
  activeCategory?: string;
}

export function VendorStrip({ stores, activeVendor, activeCategory }: VendorStripProps) {
  const baseParams = activeCategory ? `category=${encodeURIComponent(activeCategory)}&` : "";

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
      <p className="mb-3 text-xs uppercase tracking-widest text-orange-500 font-semibold">Filter by Vendor</p>
      <div className="flex flex-wrap gap-2">
        {/* All button */}
        <Link
          href={activeCategory ? `/shop?category=${encodeURIComponent(activeCategory)}` : "/shop"}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
            !activeVendor
              ? "border-orange-500 bg-orange-500/10 text-orange-500"
              : "border-slate-200 text-slate-600 hover:border-orange-500/60 hover:text-orange-500"
          }`}
        >
          🏪 All Vendors
        </Link>

        {stores.map((store) => {
          const isActive = activeVendor === store;
          return (
            <Link
              key={store}
              href={`/shop?${baseParams}vendor=${encodeURIComponent(store)}`}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "border-orange-500 bg-orange-500/10 text-orange-500"
                  : "border-slate-200 text-slate-600 hover:border-orange-500/60 hover:text-orange-500"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-[10px] font-bold text-orange-500">
                {store[0]?.toUpperCase()}
              </span>
              {store}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
