"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/store",                label: "Dashboard",       icon: "📊" },
  { href: "/store/add-product",    label: "Add Product",     icon: "➕" },
  { href: "/store/manage-product", label: "Manage Products", icon: "🗂️" },
  { href: "/store/orders",         label: "Orders",          icon: "📦" },
  { href: "/store/settings",       label: "Settings",        icon: "⚙️" },
];

export function StoreSidebar() {
  const path    = usePathname();
  const router  = useRouter();
  const { userName, userStore, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* ── Mobile top-bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-sm font-bold text-slate-950">S</span>
          <div>
            <p className="text-xs font-semibold text-slate-100">{userName ?? "Vendor"}</p>
            <p className="text-[10px] text-cyan-400">{userStore ?? "My Store"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-cyan-300 transition">🏠</Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-rose-500/40 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/10 transition"
          >
            Logout
          </button>
          <button onClick={() => setOpen(o => !o)} className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 transition">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {open && (
        <nav className="rounded-2xl border border-slate-700 bg-slate-900/95 p-3 lg:hidden space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                path === l.href ? "bg-cyan-400/10 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800 hover:text-cyan-200"
              }`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </nav>
      )}

      {/* ── Desktop sidebar ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 min-h-[400px]">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-sm font-bold text-slate-950">S</span>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-cyan-300 font-semibold">Seller Workspace</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{userStore ?? "My Store"}</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                path === l.href ? "bg-cyan-400/10 text-cyan-300 font-medium" : "text-slate-300 hover:bg-slate-800 hover:text-cyan-200"
              }`}>
              <span className="text-base">{l.icon}</span>{l.label}
            </Link>
          ))}
        </nav>

        {/* Bottom section — user + logout */}
        <div className="mt-4 border-t border-slate-700/60 pt-4 space-y-2">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-cyan-300 transition">
            🏠 <span>Go to Home</span>
          </Link>
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-slate-500 truncate">{userName ?? "Vendor"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-rose-500/30 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10 hover:border-rose-400"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}
