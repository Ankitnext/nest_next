import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/approve", label: "Approvals" },
];

export function AdminSidebar() {
  return (
    <aside className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-4 lg:w-64">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Admin Panel</p>
      <nav className="mt-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800 hover:text-emerald-200"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

