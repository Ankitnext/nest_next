"use client";

import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { ShopCard, computeIsOpen, type Shop } from "@/components/ShopCard";

const shopCategories = ["All", "Grocery", "Bakery", "Pharmacy", "Electronics", "Clothing", "Restaurants"];

const shops: Shop[] = [
  {
    id: 1,
    name: "Fresh Harvest Grocery",
    category: "Grocery",
    description: "Fresh organic vegetables, fruits & daily essentials",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    reviews: 234,
    distance: "0.5 km",
    deliveryTime: "10-15",
    hoursToday: "07:00-22:00",
    href: "/shop/fresh-harvest-grocery",
  },
  {
    id: 2,
    name: "Sweet Treats Bakery",
    category: "Bakery",
    description: "Fresh baked bread, cakes, pastries & more",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    reviews: 456,
    distance: "1.2 km",
    deliveryTime: "20-25",
    hoursToday: "07:00-21:00",
    href: "/shop/sweet-treats-bakery",
  },
  {
    id: 3,
    name: "HealthFirst Pharmacy",
    category: "Pharmacy",
    description: "Medicines, vitamins, health & wellness products",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    reviews: 189,
    distance: "0.8 km",
    deliveryTime: "10-15",
    hoursToday: "08:00-23:00",
    href: "/shop/healthfirst-pharmacy",
  },
  {
    id: 4,
    name: "TechZone Electronics",
    category: "Electronics",
    description: "Latest gadgets, phones, accessories & electronics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    rating: 4.5,
    reviews: 298,
    distance: "1.8 km",
    deliveryTime: "15-20",
    hoursToday: "10:00-21:00",
    href: "/shop/techzone-electronics",
  },
  {
    id: 5,
    name: "Fashion Hub",
    category: "Clothing",
    description: "Trendy clothing, accessories and fashion wear",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop",
    rating: 4.4,
    reviews: 210,
    distance: "2.1 km",
    deliveryTime: "20-25",
    hoursToday: "10:00-20:00",
    href: "/shop/fashion-hub",
  },
  {
    id: 6,
    name: "Spice Garden Restaurant",
    category: "Restaurants",
    description: "Authentic Indian cuisine, biryanis & curries",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    reviews: 567,
    distance: "0.6 km",
    deliveryTime: "10-15",
    hoursToday: "11:00-23:00",
    href: "/shop/spice-garden-restaurant",
  },
  {
    id: 7,
    name: "Corner Bakehouse",
    category: "Bakery",
    description: "Artisan breads, cookies and sourdough",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    reviews: 178,
    distance: "0.9 km",
    deliveryTime: "15-20",
    hoursToday: "06:00-20:00",
    href: "/shop/corner-bakehouse",
  },
  {
    id: 8,
    name: "Daily Needs Mart",
    category: "Grocery",
    description: "All household essentials, packaged food & beverages",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=800&auto=format&fit=crop",
    rating: 4.6,
    reviews: 145,
    distance: "0.3 km",
    deliveryTime: "10-15",
    hoursToday: "08:00-22:00",
    href: "/shop/daily-needs-mart",
  },
];

export default function ShopsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const filtered = shops.filter((s) => {
    const isOpen = computeIsOpen(s.hoursToday, s.isOpen);
    if (showOpenOnly && !isOpen) return false;
    const matchCat = activeCategory === "All" || s.category === activeCategory;
    const matchSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F3F4F9]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#7158E2] via-[#6366f1] to-[#8b5cf6] px-6 py-14 md:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold text-white md:text-5xl">Local Shops Near You</h1>
          <p className="mt-3 text-lg text-white/80">
            Browse and order from verified shops in your neighborhood
          </p>
          {/* Search bar */}
          <div className="mt-8 flex w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex flex-1 items-center gap-3 px-5">
              <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shops, categories..."
                className="w-full bg-transparent py-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <button className="m-2 rounded-xl bg-[#7158E2] px-6 py-3 text-sm font-bold text-white hover:bg-[#5e48d0] transition shadow-md">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Filter row */}
      <div className="sticky top-[60px] z-30 border-b border-gray-200 bg-white px-6 py-4 shadow-sm md:px-12">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-[#7158E2] hover:text-[#7158E2] transition">
            <FunnelIcon className="h-4 w-4" />
            Filters
          </button>
          {shopCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? "bg-gray-900 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
          {/* Open Now toggle */}
          <button
            onClick={() => setShowOpenOnly(!showOpenOnly)}
            className={`ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition border ${
              showOpenOnly
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-green-500 hover:text-green-600"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${showOpenOnly ? "bg-green-500" : "bg-gray-300"}`} />
            Open Now
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">
        <p className="mb-6 text-sm font-medium text-gray-500">
          <span className="font-bold text-gray-900">{filtered.length}</span>{" "}
          shop{filtered.length !== 1 ? "s" : ""} found
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm">
            <span className="mb-4 text-5xl">🏪</span>
            <h3 className="text-xl font-bold text-gray-900">No shops found</h3>
            <p className="mt-2 text-sm text-gray-500">Try a different filter or search term</p>
            <button
              onClick={() => { setActiveCategory("All"); setSearch(""); setShowOpenOnly(false); }}
              className="mt-4 text-sm text-[#7158E2] hover:underline"
            >
              Clear all filters →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
