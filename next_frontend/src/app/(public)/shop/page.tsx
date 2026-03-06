import { CategoryStrip } from "@/components/CategoryStrip";
import { VendorSearchDropdown } from "@/components/VendorSearchDropdown";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { SearchBar } from "@/components/SearchBar";
import { fetchCategories, fetchProducts } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface RegisteredVendor { id: number; name: string; store: string; }

async function fetchRegisteredVendors(): Promise<RegisteredVendor[]> {
  try {
    const res = await fetch(`${API_BASE}/vendors`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json() as Promise<RegisteredVendor[]>;
  } catch {
    return [];
  }
}

type ShopPageProps = {
  searchParams: Promise<{ category?: string; vendor?: string; q?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category, vendor, q } = await searchParams;

  const [products, categories, registeredVendors] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchRegisteredVendors(),
  ]);

  // Build a Set of registered store slugs (used for the dropdown only)
  const registeredStores = new Set(registeredVendors.map(v => v.store));

  // Start with ALL products
  let visibleProducts = products;

  // Apply vendor filter first (so we know what categories this vendor actually sells)
  if (vendor && registeredStores.has(vendor)) {
    visibleProducts = visibleProducts.filter(p => p.store === vendor);
  }

  // Dynamically compute available categories for the currently visible products
  const availableCategories = Array.from(new Set(visibleProducts.map(p => p.category))).sort();

  // Apply category filter
  if (category) {
    visibleProducts = visibleProducts.filter(
      p => p.category.toLowerCase() === category.toLowerCase(),
    );
  }

  // Apply text search filter
  if (q) {
    visibleProducts = visibleProducts.filter(
      p => p.name.toLowerCase().includes(q.toLowerCase())
    );
  }


  // Build heading
  const headingParts: string[] = [];
  if (category) headingParts.push(category);
  if (vendor) {
    const vObj = registeredVendors.find(v => v.store === vendor);
    headingParts.push(`from ${vObj?.name ?? vendor}`);
  }
  const headingTitle = headingParts.length ? headingParts.join(" ") : "Full Menu";

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Shop"
        title={headingTitle}
        description={
          vendor
            ? `Showing menu items from ${registeredVendors.find(v => v.store === vendor)?.name ?? vendor}${category ? ` in ${category}` : ""}.`
            : category
            ? `Filtered by category: ${category}.`
            : `Browse meals from ${registeredVendors.length} registered shop${registeredVendors.length !== 1 ? "s" : ""}.`
        }
      />

      {/* Category filter */}
      <CategoryStrip
        categories={availableCategories}
        activeCategory={category}
        activeVendor={vendor}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Vendor search dropdown — only registered vendors */}
        <VendorSearchDropdown vendors={registeredVendors} activeVendor={vendor} />
        
        {/* Search Bar for filtering items by name */}
        <SearchBar />
      </div>

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {visibleProducts.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm text-slate-600">
            No menu items found{q ? ` matching "${q}"` : ""}{vendor ? ` for this shop` : ""}
            {category ? ` in "${category}"` : ""}.
          </p>
          <a href="/shop" className="mt-3 inline-block text-xs text-orange-500 hover:underline">
            Clear all filters →
          </a>
        </div>
      )}
    </section>
  );
}
