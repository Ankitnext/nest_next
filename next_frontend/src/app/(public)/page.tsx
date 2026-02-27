import { CategoryStrip } from "@/components/CategoryStrip";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { HeroSection } from "@/components/HeroSection";
import { NewsletterCta } from "@/components/NewsletterCta";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustPillRow } from "@/components/TrustPillRow";
import { fetchCategories, fetchProducts } from "@/lib/api";
import Link from "next/link";

export default async function HomePage() {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
  const featured = products.slice(0, 6);
  const justDropped = products.slice(6, 10);
  const stores = Array.from(new Set(products.map((product) => product.store))).slice(0, 4);

  return (
    <>
      <HeroSection spotlight={products[0] ?? null} />
      <TrustPillRow />

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Find exactly what you need in seconds."
          description="From creator tech to workspace upgrades, browse everything in organized collections."
        />
        <CategoryStrip categories={categories} />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Featured Picks"
          title="High-demand products chosen by our editorial team."
          description="Updated daily with trending deals and customer-favorite picks."
        />
        <FeaturedProducts products={featured} />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Just Dropped"
          title="Fresh arrivals across top stores."
          description="Catch new launches before they go out of stock."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {justDropped.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/75 p-6">
        <SectionHeading
          eyebrow="Top Stores"
          title="Explore seller-first storefront pages."
          description="Each store can have a dedicated catalog page backed by your API."
        />
        <div className="flex flex-wrap gap-3">
          {stores.map((store) => (
            <Link
              key={store}
              href={`/shop/${store}`}
              className="rounded-full border border-slate-500 px-4 py-2 text-sm text-slate-100 transition hover:border-emerald-300 hover:text-emerald-300"
            >
              {store}
            </Link>
          ))}
        </div>
      </section>

      <NewsletterCta />
    </>
  );
}
