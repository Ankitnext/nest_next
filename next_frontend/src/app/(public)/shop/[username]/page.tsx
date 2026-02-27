import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { fetchProductsByStore } from "@/lib/api";
import { titleFromSlug } from "@/lib/format";

type StorePageProps = {
  params: Promise<{ username: string }>;
};

export default async function StorefrontPage({ params }: StorePageProps) {
  const { username } = await params;
  const storeName = username.toLowerCase();
  const products = await fetchProductsByStore(storeName);

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Storefront"
        title={titleFromSlug(storeName)}
        description="Store-specific products pulled from your NestJS API."
      />

      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-sm text-slate-300">
          No products found for this store yet.
        </div>
      )}
    </section>
  );
}

