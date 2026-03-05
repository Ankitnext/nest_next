import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 flex w-full flex-col">
      {/* Top Section (Dark Blue) */}
      <div className="bg-[#1e3a5f] px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 md:flex-row md:items-start">
          
          {/* Left: App Promo */}
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              Support Local,<br />Eat Better, Shop Smarter.
            </h2>
            <p className="mt-4 text-sm text-slate-300 md:text-base">
              Get the Baazaarse app for the full experience. Real-time queue updates, exclusive neighborhood deals, and seamless one-tap payments.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <button className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                <span className="text-lg">🍏</span> App Store
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                <span className="text-lg">▶️</span> Play Store
              </button>
            </div>
          </div>

          {/* Right: Newsletter Glass Card */}
          <div className="w-full max-w-md rounded-2xl bg-white/10 p-6 backdrop-blur-md md:p-8 border border-white/10 shadow-xl">
            <h3 className="text-xl font-bold text-white">Join our community</h3>
            <p className="mt-2 text-sm text-slate-300">
              Receive weekly highlights of new shops and exclusive local treats.
            </p>
            <form className="mt-5 flex w-full flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600 w-full sm:w-auto"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Section (White) */}
      <div className="bg-white px-6 py-12 md:px-12">
        <div className="mx-auto max-w-6xl grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          
          {/* Brand & Copyright Info */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
                N
              </span>
              <span className="text-xl font-bold text-slate-900">BAAZAARSE</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              Connecting neighbors with the best local business, one shop at a time. Proudly supporting over 500+ local vendors.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Discover</h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li><Link href="/shop" className="hover:text-orange-500">Shops</Link></li>
              <li><Link href="/shop" className="hover:text-orange-500">Cafes</Link></li>
              <li><Link href="/shop" className="hover:text-orange-500">Restaurants</Link></li>
              <li><Link href="/shop" className="hover:text-orange-500">Local Deals</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Partner</h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li><Link href="/create-store" className="hover:text-orange-500">For Vendors</Link></li>
              <li><Link href="/create-store" className="hover:text-orange-500">For Couriers</Link></li>
              <li><span className="hover:text-orange-500 cursor-pointer">Integration API</span></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
            <ul className="flex flex-col gap-2 text-sm text-slate-500">
              <li><span className="hover:text-orange-500 cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-orange-500 cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-orange-500 cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

        </div>

        {/* Deep Footer */}
        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between border-t border-slate-200 pt-8 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Baazaarse Inc. All rights reserved.</p>
          <div className="mt-4 flex gap-4 md:mt-0">
            <span className="cursor-pointer hover:text-orange-500">Twitter</span>
            <span className="cursor-pointer hover:text-orange-500">Instagram</span>
            <span className="cursor-pointer hover:text-orange-500">Facebook</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
