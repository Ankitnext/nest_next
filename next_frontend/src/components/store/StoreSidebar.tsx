import Link from "next/link";

const links = [
  { href: "/store", label: "Dashboard" },
  { href: "/store/add-product", label: "Add Product" },
  { href: "/store/manage-product", label: "Manage Products" },
  { href: "/store/orders", label: "Orders" },
];

export function StoreSidebar() {
  return (
    <aside className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-4 lg:w-64">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Seller Workspace</p>
      <nav className="mt-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800 hover:text-cyan-200"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

