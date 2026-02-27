"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageContainer } from "@/components/PageContainer";

// Items only visible to authenticated users
const authNavItems = [
  { href: "/shop", label: "Shop" },
  { href: "/pricing", label: "Pricing" },
  { href: "/orders", label: "Orders" },
  { href: "/create-store", label: "Sell on NovaCart" },
];

export function PublicNavbar() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/80 bg-[#070d1d]/80 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400 font-bold text-slate-950">
            N
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              NovaCart
            </p>
            <p className="text-xs text-slate-300">Modern commerce engine</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          {/* Home always visible */}
          <Link href="/" className="transition hover:text-emerald-300">
            Home
          </Link>

          {/* Protected links — shown only when logged in */}
          {isLoggedIn &&
            authNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-emerald-300"
              >
                {item.label}
              </Link>
            ))}

          {/* Login / Logout toggle */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="transition hover:text-rose-300 text-slate-200"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="transition hover:text-emerald-300">
              Login
            </Link>
          )}
        </nav>

        {/* Right-side CTA — only when logged in */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="rounded-full border border-slate-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              Cart
            </Link>
            <Link
              href="/shop"
              className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300"
            >
              Explore
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300"
          >
            Login
          </Link>
        )}
      </PageContainer>
    </header>
  );
}
