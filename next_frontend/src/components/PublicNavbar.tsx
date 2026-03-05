"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function PublicNavbar() {
  const { isLoggedIn, role, userName, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const dashboardHref = role === "admin" ? "/admin" : role === "vendor" ? "/store" : null;

  return (
    <nav className="relative flex items-center justify-between rounded-2xl border border-white/10 bg-[#1e3a5f]/95 px-4 py-3 backdrop-blur-md z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
          N
        </span>
        <span className="font-semibold text-white">BAAZAARSE</span>
      </Link>

      {/* Mobile menu button */}
      <div className="flex items-center md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-orange-400 focus:outline-none p-1"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Links */}
      <div 
        className={`${
          isMobileMenuOpen 
            ? "flex flex-col absolute top-[calc(100%+0.5rem)] left-0 right-0 rounded-2xl border border-white/10 bg-[#1e3a5f]/95 p-4 backdrop-blur-md shadow-xl gap-3 z-50" 
            : "hidden"
        } md:flex md:static md:flex-row md:items-center md:gap-1 md:border-none md:bg-transparent md:p-0 md:shadow-none text-sm w-full md:w-auto`}
      >
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 md:py-1.5 text-white font-medium transition hover:bg-white/10 md:hover:bg-transparent hover:text-orange-400">Home</Link>

        <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 md:py-1.5 text-white font-medium transition hover:bg-white/10 md:hover:bg-transparent hover:text-orange-400">Menu</Link>
        <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 md:py-1.5 text-white font-medium transition hover:bg-white/10 md:hover:bg-transparent hover:text-orange-400">Pricing</Link>

        {isLoggedIn && role === "user" && (
          <>
            <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 md:py-1.5 text-white font-medium transition hover:bg-white/10 md:hover:bg-transparent hover:text-orange-400">Orders</Link>
            <Link href="/create-store" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 md:py-1.5 text-white font-medium transition hover:bg-white/10 md:hover:bg-transparent hover:text-orange-400">Partner Kitchen</Link>
          </>
        )}

        {isLoggedIn && (role === "vendor" || role === "admin") && dashboardHref && (
          <Link href={dashboardHref} onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-2 md:py-1.5 text-orange-400 font-semibold transition hover:bg-white/10 md:hover:bg-transparent hover:text-orange-300">
            {role === "admin" ? "🛡️ Admin" : "🏪 Dashboard"}
          </Link>
        )}

        {isLoggedIn ? (
          <>
            {role === "user" && (
              <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}
                className="w-max rounded-full border border-slate-500 px-4 py-1.5 text-white transition hover:border-orange-400 hover:text-orange-400 md:ml-1 mt-1 md:mt-0">
                Cart
              </Link>
            )}
            <span className="px-3 py-1.5 text-sm font-medium text-white md:ml-2 md:px-0">{userName}</span>
            <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
              className="w-max rounded-full border border-rose-500/40 px-4 py-1.5 text-sm text-rose-400 transition hover:bg-rose-500/10 md:ml-1 mt-1 md:mt-0">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}
            className="w-max rounded-full bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-orange-500 md:ml-2 mt-2 md:mt-0">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
