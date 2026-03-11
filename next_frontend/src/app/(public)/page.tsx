import { CategoryStrip } from "@/components/CategoryStrip";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { HeroSection } from "@/components/HeroSection";
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

  // Bulletproof mapping for SSR - handle string or object arrays
  const safeCategories = categories.map((cat: any) => {
      if (typeof cat === 'string') return cat.toLowerCase();
      if (cat && typeof cat === 'object' && cat.name) return String(cat.name).toLowerCase();
      return 'other';
  });

  return (
    <>
      <HeroSection spotlight={products[0] ?? null} />
      <TrustPillRow />

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Menu Categories"
          title="Find exactly what you're craving in seconds."
          description="From hearty mains to quick snacks, browse everything in organized menus."
        />
        <CategoryStrip categories={safeCategories} />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Popular Choices"
          title="High-demand meals chosen by our community."
          description="Updated daily with trending dishes and customer-favorite bites."
        />
        <FeaturedProducts products={featured} />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Just Cooked"
          title="Fresh plates across top kitchens."
          description="Catch new daily specials before they sell out."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {justDropped.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/75 p-6">
        <SectionHeading
          eyebrow="Top Kitchens"
          title="Explore partner stalls and cloud kitchens."
          description="Each culinary partner has a dedicated menu page backed by your API."
        />
        <div className="flex flex-wrap gap-3">
          {stores.map((store) => (
            <Link
              key={store}
              href={`/shop/${store}`}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 transition hover:border-orange-500 hover:text-orange-500"
            >
              {store}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
