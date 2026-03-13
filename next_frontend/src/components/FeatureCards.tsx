import Link from "next/link";

const features = [
  {
    icon: "🚀",
    title: "Fast Delivery",
    description: "Get your orders delivered in minutes, just like Zepto",
    color: "bg-blue-50",
    iconBg: "bg-blue-100",
  },
  {
    icon: "🏘️",
    title: "Local Trust",
    description: "Connect with shops and services right in your neighborhood",
    color: "bg-purple-50",
    iconBg: "bg-purple-100",
  },
  {
    icon: "✅",
    title: "Verified Vendors",
    description: "All shops and service providers are verified and trusted",
    color: "bg-green-50",
    iconBg: "bg-green-100",
  },
  {
    icon: "⚡",
    title: "Instant Booking",
    description: "Book services and place orders instantly with one click",
    color: "bg-orange-50",
    iconBg: "bg-orange-100",
  },
];

export function FeatureCards() {
  return (
    <section className="py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
            Why Choose <span className="text-[#7158E2]">Baazaarse?</span>
          </h2>
          <p className="mt-3 text-gray-500">Everything you need in one place</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl ${f.color} p-6 border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition`}
            >
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} text-2xl`}>
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
