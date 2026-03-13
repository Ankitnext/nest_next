import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#111827]">
      {/* Main Footer */}
      <div className="px-6 py-14 md:px-12">
        <div className="mx-auto max-w-6xl grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7158E2] text-sm font-bold text-white">
                B
              </span>
              <span className="text-xl font-bold text-white">Baazaarse</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-400 leading-relaxed">
              Your trusted hyperlocal marketplace, connecting you with local shops and services.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 hover:border-[#7158E2] hover:text-[#7158E2] transition text-sm font-bold">𝕏</a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 hover:border-[#7158E2] hover:text-[#7158E2] transition">📷</a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700 text-gray-400 hover:border-[#7158E2] hover:text-[#7158E2] transition text-sm font-bold">f</a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-bold text-white mb-5">For Customers</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link href="/shop" className="hover:text-[#7158E2] transition">Browse Shops</Link></li>
              <li><Link href="/shop" className="hover:text-[#7158E2] transition">Local Services</Link></li>
              <li><Link href="/shop" className="hover:text-[#7158E2] transition">Deals & Offers</Link></li>
              <li><Link href="/orders" className="hover:text-[#7158E2] transition">My Orders</Link></li>
            </ul>
          </div>

          {/* For Business */}
          <div>
            <h4 className="font-bold text-white mb-5">For Business</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><Link href="/create-store" className="hover:text-[#7158E2] transition">Register Your Shop</Link></li>
              <li><Link href="/create-store" className="hover:text-[#7158E2] transition">Register Your Service</Link></li>
              <li><Link href="/login" className="hover:text-[#7158E2] transition">Vendor Login</Link></li>
              <li><span className="cursor-pointer hover:text-[#7158E2] transition">Business Resources</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-5">Contact</h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li><span className="text-gray-400">Email: support@baazaarse.com</span></li>
              <li><span className="cursor-pointer hover:text-[#7158E2] transition">Help Center</span></li>
              <li><span className="cursor-pointer hover:text-[#7158E2] transition">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-[#7158E2] transition">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mx-auto mt-12 max-w-6xl flex flex-col items-center justify-between border-t border-gray-800 pt-8 text-xs text-gray-500 md:flex-row gap-3">
          <p>© {new Date().getFullYear()} Baazaarse. All rights reserved.</p>
          <p>Made with ❤️ for local communities in India</p>
        </div>
      </div>
    </footer>
  );
}
