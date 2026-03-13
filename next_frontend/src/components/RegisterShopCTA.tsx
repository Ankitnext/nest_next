import Link from "next/link";

export function RegisterShopCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#a855f7] px-6 py-20 text-center">
      {/* Soft radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
          Own a Shop or Provide Services?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/80 leading-relaxed">
          Join Baazaarse and reach thousands of local customers. Grow your business with our platform.
        </p>
        <div className="mt-10">
          <Link
            href="/create-store"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-base font-bold text-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-1 transform transition"
          >
            <span>📈</span>
            Start Selling Today
          </Link>
        </div>
      </div>
    </section>
  );
}
