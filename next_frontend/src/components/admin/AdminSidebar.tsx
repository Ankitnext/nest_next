"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/admin",             label: "Overview",   icon: "📊" },
  { href: "/admin?tab=markets", label: "Markets",    icon: "🏬" },
  { href: "/admin?tab=vendors", label: "Vendors",    icon: "👔" },
  { href: "/admin?tab=users",   label: "Users",      icon: "👤" },
  { href: "/admin/stores",      label: "Stores",     icon: "🗂️" },
  { href: "/admin/approve",     label: "Approvals",  icon: "✅" },
];

export function AdminSidebar() {
  const path   = usePathname();
  const router = useRouter();
  const { userName, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* ── Mobile top-bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">N</span>
          <div>
            <p className="text-xs font-semibold text-slate-900">{userName ?? "Admin"}</p>
            <p className="text-[10px] text-orange-500">Admin Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:text-orange-500 transition">🏠</Link>
          <button
            onClick={handleLogout}
            className="rounded-full border border-rose-500/40 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/10 transition"
          >
            Logout
          </button>
          <button onClick={() => setOpen(o => !o)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-50 transition">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown nav */}
      {open && (
        <nav className="rounded-2xl border border-slate-200 bg-white/95 p-3 lg:hidden space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                path === l.href.split("?")[0] ? "bg-orange-500/10 text-orange-500 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-orange-400"
              }`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </nav>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 rounded-2xl border border-slate-200 bg-white/80 p-4 min-h-[400px]">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">N</span>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-orange-500 font-semibold">Admin Panel</p>
            <p className="text-[11px] text-slate-500">Baazaarse Control</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {links.map(l => {
            const active = path === l.href.split("?")[0];
            return (
              <Link key={l.href} href={l.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-orange-500/10 text-orange-500 font-medium" : "text-slate-600 hover:bg-slate-50 hover:text-orange-400"
                }`}>
                <span className="text-base">{l.icon}</span>{l.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — user + logout */}
        <div className="mt-4 border-t border-slate-200/60 pt-4 space-y-2">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:text-orange-500 transition">
            🏠 <span>Go to Home</span>
          </Link>
          <div className="px-3 py-1">
            <span className="text-xs text-slate-500 truncate block">{userName ?? "Super Admin"}</span>
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
