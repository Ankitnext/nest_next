import Link from "next/link";

const services = [
  { emoji: "⚡", name: "Electrician", count: "50+ Pros" },
  { emoji: "🔧", name: "Plumber", count: "40+ Pros" },
  { emoji: "🪚", name: "Carpenter", count: "35+ Pros" },
  { emoji: "🎨", name: "Painter", count: "30+ Pros" },
  { emoji: "❄️", name: "AC Repair", count: "25+ Pros" },
  { emoji: "🧹", name: "Cleaner", count: "60+ Pros" },
];

export function LocalServicesGrid() {
  return (
    <section className="py-16 px-6 bg-[#F3F4F9]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Local Services
          </h2>
          <Link href="/pricing" className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:border-[#7158E2] hover:text-[#7158E2] transition shadow-sm bg-white">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {services.map((svc) => (
            <button
              key={svc.name}
              className="flex flex-col items-center rounded-2xl bg-white border border-gray-100 p-5 text-center shadow-sm hover:shadow-md hover:border-[#7158E2] hover:-translate-y-1 transition group cursor-pointer"
            >
              <span className="mb-3 text-4xl">{svc.emoji}</span>
              <span className="text-sm font-bold text-gray-900 group-hover:text-[#7158E2] transition">{svc.name}</span>
              <span className="mt-1 text-xs text-gray-400">{svc.count}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
