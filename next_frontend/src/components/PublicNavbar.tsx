"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";

export function PublicNavbar() {
  const { isLoggedIn, role, isVendor, isDelivery, isServiceProvider, userName, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isVendorOrLegacy = isVendor || role === "vendor";
  const isDeliveryOrLegacy = isDelivery || role === "delivery";
  const dashboardHref = role === "admin" 
    ? "/admin" 
    : isVendorOrLegacy 
      ? "/store" 
      : isServiceProvider 
        ? "/services/dashboard" 
        : isDeliveryOrLegacy 
          ? "/delivery" 
          : null;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/95 px-6 py-3.5 shadow-sm backdrop-blur-md border-b border-gray-100">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7158E2] text-sm font-bold text-white shadow-md shadow-purple-200">
          B
        </span>
        <span className="text-xl font-bold text-[#7158E2] tracking-tight">Baazaarse</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-1 text-sm font-medium">
        <Link href="/shop" className="rounded-lg px-4 py-2 text-gray-600 hover:text-[#7158E2] hover:bg-purple-50 transition">
          Shops
        </Link>
        <Link href="/pricing" className="rounded-lg px-4 py-2 text-gray-600 hover:text-[#7158E2] hover:bg-purple-50 transition">
          Services
        </Link>
        <Link href="/area" className="rounded-lg px-4 py-2 text-gray-600 hover:text-[#7158E2] hover:bg-purple-50 transition">
          Your Area
        </Link>

        {isLoggedIn && (
          <Link href="/orders" className="rounded-lg px-4 py-2 text-gray-600 hover:text-[#7158E2] hover:bg-purple-50 transition">
            Orders
          </Link>
        )}

        {isLoggedIn && dashboardHref && (
          <Link href={dashboardHref} className="rounded-lg px-4 py-2 text-[#7158E2] font-semibold hover:bg-purple-50 transition">
            {role === "admin" ? "🛡️ Admin" : "🏪 Dashboard"}
          </Link>
        )}
      </div>

      {/* Right Actions */}
      <div className="hidden md:flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <Link href="/cart" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-gray-600 border border-gray-200 hover:border-[#7158E2] hover:text-[#7158E2] transition">
              <ShoppingCartIcon className="h-4 w-4" />
              Cart
            </Link>
            {(!isVendorOrLegacy && !isServiceProvider) && (
              <Link href="/login?mode=register&role=vendor" className="hidden lg:block text-xs font-semibold text-orange-500 hover:underline">
                Unlock Seller Portal
              </Link>
            )}
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            <button onClick={handleLogout}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[#7158E2] transition">
              Sign In
            </Link>
            <Link href="/login?mode=register&role=vendor"
              className="rounded-lg border-2 border-[#7158E2] px-5 py-2 text-sm font-semibold text-[#7158E2] hover:bg-[#7158E2] hover:text-white transition shadow-sm">
              Sell on Baazaarse
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="flex items-center md:hidden text-gray-600 hover:text-[#7158E2] p-1"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl md:hidden z-50">
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#7158E2]">Shops</Link>
          <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#7158E2]">Services</Link>
          <Link href="/area" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#7158E2]">Your Area</Link>
          {isLoggedIn && (
            <>
              <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#7158E2]">Orders</Link>
              <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-purple-50 hover:text-[#7158E2]">Cart</Link>
            </>
          )}
          {isLoggedIn && dashboardHref && (
            <Link href={dashboardHref} onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[#7158E2] hover:bg-purple-50">{role === "admin" ? "🛡️ Admin" : "🏪 Dashboard"}</Link>
          )}
          <div className="mt-2 border-t border-gray-100 pt-3 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                {(!isVendorOrLegacy && !isServiceProvider) && (
                  <Link href="/login?mode=register&role=vendor" className="px-4 py-2 text-sm font-semibold text-orange-500">
                    Unlock Seller Portal
                  </Link>
                )}
                <span className="px-4 py-2 text-sm font-medium text-gray-700">{userName}</span>
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-purple-50 hover:text-[#7158E2]">Sign In</Link>
                <Link href="/login?mode=register&role=vendor" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl border-2 border-[#7158E2] px-4 py-2.5 text-sm font-semibold text-[#7158E2] text-center hover:bg-[#7158E2] hover:text-white">Sell on Baazaarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
