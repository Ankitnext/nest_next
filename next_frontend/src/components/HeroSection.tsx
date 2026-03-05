import Link from "next/link";
import { asCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type HeroSectionProps = {
  spotlight: Product | null;
};

export function HeroSection({ spotlight }: HeroSectionProps) {
  return (
    <section 
      className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-cover bg-center px-6 py-24 text-center md:px-10 md:py-32"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl font-extrabold leading-tight text-white md:text-6xl tracking-tight">
          Local Shops, Cafe Treats,<br />& Quick Queues
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-200">
          Discover the best of your neighborhood with seamless delivery, pickup, and smart dining options.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-lg bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 hover:shadow-orange-500/25"
          >
            Explore Now
          </Link>
          <Link
            href="/create-store"
            className="rounded-lg bg-white/20 backdrop-blur-md border border-white/30 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-white/30"
          >
            Partner With Us
          </Link>
        </div>
      </div>
    </section>
  );
}

