"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AdminTopbar() {
  const { userName, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-5 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Control Center</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Marketplace Administration</h1>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/" className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:text-orange-500">
          🏠 Home
        </Link>
        <span className="text-xs text-slate-500">{userName ?? "Admin"}</span>
        <button
          onClick={handleLogout}
          className="rounded-full border border-rose-500/40 px-4 py-1.5 text-sm text-rose-400 transition hover:bg-rose-500/10 hover:border-rose-400"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
