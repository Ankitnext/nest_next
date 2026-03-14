import Link from "next/link";
import { ShopCard, type Shop } from "@/components/ShopCard";

const vendors: Shop[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop",
    name: "Fresh Vegetable Market",
    description: "Organic vegetables & fresh fruits",
    rating: 4.8,
    reviews: 200,
    distance: "0.5 km",
    deliveryTime: "10-15",
    category: "Grocery",
    hoursToday: "07:00-22:00",
    href: "/shop",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
    name: "Sweet Treats Bakery",
    description: "Fresh bread, cakes & pastries",
    rating: 4.9,
    reviews: 350,
    distance: "1.2 km",
    deliveryTime: "20-25",
    category: "Bakery",
    hoursToday: "07:00-21:00",
    href: "/shop",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=800&auto=format&fit=crop",
    name: "Daily Needs Grocery",
    description: "All household essentials",
    rating: 4.7,
    reviews: 180,
    distance: "0.8 km",
    deliveryTime: "10-15",
    category: "Grocery",
    hoursToday: "08:00-22:00",
    href: "/shop",
  },
];

export function RecommendedVendors() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Recommended Near You
            </h2>
            <p className="mt-2 text-gray-500">Highly rated shops in your area</p>
          </div>
          <Link href="/shop" className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:border-[#7158E2] hover:text-[#7158E2] transition shadow-sm">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((v) => (
            <ShopCard key={v.id} shop={v} />
          ))}
        </div>
      </div>
    </section>
  );
}
