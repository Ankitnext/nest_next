"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function PublicNavbar() {
  const { isLoggedIn, role, userName, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  const dashboardHref = role === "admin" ? "/admin" : role === "vendor" ? "/store" : null;

  return (
    <nav className="flex items-center justify-between rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 backdrop-blur">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400 text-sm font-bold text-slate-950">
          N
        </span>
        <span className="font-semibold text-slate-100">BAAZAARSE</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1 text-sm">
        <Link href="/" className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:text-emerald-300">Home</Link>

        <Link href="/shop"    className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:text-emerald-300">Shop</Link>
        <Link href="/pricing" className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:text-emerald-300">Pricing</Link>

        {isLoggedIn && role === "user" && (
          <>
            <Link href="/orders"  className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:text-emerald-300">Orders</Link>
            <Link href="/create-store" className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:text-emerald-300">Sell on Baazaarse</Link>
          </>
        )}

        {isLoggedIn && (role === "vendor" || role === "admin") && dashboardHref && (
          <Link href={dashboardHref} className="rounded-lg px-3 py-1.5 text-emerald-300 font-semibold transition hover:text-emerald-200">
            {role === "admin" ? "🛡️ Admin" : "🏪 Dashboard"}
          </Link>
        )}

        {isLoggedIn ? (
          <>
            {role === "user" && (
              <Link href="/cart"
                className="rounded-full border border-slate-500 px-4 py-1.5 text-slate-100 transition hover:border-emerald-300 hover:text-emerald-300">
                Cart
              </Link>
            )}
            <span className="ml-2 text-xs text-slate-500">{userName}</span>
            <button onClick={handleLogout}
              className="ml-1 rounded-full border border-rose-500/40 px-4 py-1.5 text-sm text-rose-400 transition hover:bg-rose-500/10">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login"
            className="ml-2 rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
