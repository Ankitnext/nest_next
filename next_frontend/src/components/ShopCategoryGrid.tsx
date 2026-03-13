import Link from "next/link";

const shopCategories = [
  { emoji: "🛒", name: "Grocery", count: "150+ Shops" },
  { emoji: "🥐", name: "Bakery", count: "45+ Shops" },
  { emoji: "💊", name: "Pharmacy", count: "80+ Shops" },
  { emoji: "🍽️", name: "Restaurant", count: "200+ Shops" },
  { emoji: "👗", name: "Fashion", count: "120+ Shops" },
  { emoji: "📱", name: "Electronics", count: "60+ Shops" },
];

export function ShopCategoryGrid() {
  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Shop by Category
          </h2>
          <Link href="/shop" className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:border-[#7158E2] hover:text-[#7158E2] transition shadow-sm">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {shopCategories.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${cat.name.toLowerCase()}`}
              className="flex flex-col items-center rounded-2xl bg-white border border-gray-100 p-5 text-center shadow-sm hover:shadow-md hover:border-[#7158E2] hover:-translate-y-1 transition group"
            >
              <span className="mb-3 text-4xl">{cat.emoji}</span>
              <span className="text-sm font-bold text-gray-900 group-hover:text-[#7158E2] transition">{cat.name}</span>
              <span className="mt-1 text-xs text-gray-400">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
