import { CategoryStrip } from "@/components/CategoryStrip";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { fetchCategories, fetchProducts } from "@/lib/api";

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
  const visibleProducts = category
    ? products.filter((product) => product.category.toLowerCase() === category.toLowerCase())
    : products;

  return (
    <section className="space-y-6">
      <SectionHeading
        eyebrow="Shop"
        title={category ? `${category} Collection` : "All Products"}
        description={
          category
            ? "Filtered from your backend JSON catalog."
            : "Browse the complete catalog from all connected stores."
        }
      />
      <CategoryStrip categories={categories} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {visibleProducts.length === 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5 text-sm text-slate-300">
          No products found for this category.
        </div>
      )}
    </section>
  );
}
