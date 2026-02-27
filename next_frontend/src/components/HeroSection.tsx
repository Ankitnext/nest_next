import Link from "next/link";
import { asCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type HeroSectionProps = {
  spotlight: Product | null;
};

export function HeroSection({ spotlight }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 px-6 py-8 md:px-10 md:py-12">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-20 left-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="inline-flex rounded-full border border-emerald-300/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
            New Collection 2026
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white md:text-5xl">
            Tech and lifestyle gear that feels premium from day one.
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-200 md:text-lg">
            Discover curated products with transparent pricing, fast shipping, and trusted sellers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300"
            >
              Shop Now
            </Link>
            <Link
              href="/create-store"
              className="rounded-full border border-slate-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-100 transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Become a Seller
            </Link>
          </div>
        </div>

        <div className="grid-halo rounded-2xl border border-slate-600/70 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Spotlight Deal</p>
          {spotlight ? (
            <div className="mt-3 space-y-3">
              <img
                src={spotlight.image}
                alt={spotlight.name}
                className="h-44 w-full rounded-xl object-cover"
              />
              <h2 className="text-xl font-semibold text-white">{spotlight.name}</h2>
              <p className="text-sm text-slate-300">{spotlight.description}</p>
              <div className="flex items-center gap-3">
                <strong className="text-emerald-300">{asCurrency(spotlight.price, spotlight.currency)}</strong>
                <span className="text-sm text-slate-400 line-through">
                  {asCurrency(spotlight.oldPrice, spotlight.currency)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-300">No spotlight product available.</p>
          )}
        </div>
      </div>
    </section>
  );
}

