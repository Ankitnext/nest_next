import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";

const quickLinks = [
  { href: "/shop", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/orders", label: "Orders" },
  { href: "/admin", label: "Admin" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--line)]/70 bg-[#050916]/80 py-8">
      <PageContainer className="grid gap-8 md:grid-cols-3">
        <section>
          <p className="text-xs uppercase tracking-[0.22em] text-orange-500">Baazaarse</p>
          <p className="mt-3 max-w-sm text-sm text-slate-600">
            Fast storefront setup with clean APIs, seller dashboards, and an extensible catalog.
          </p>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-slate-900">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-orange-500">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
          <p className="mt-3 text-sm text-slate-600">support@baazaarse.com</p>
          <p className="text-sm text-slate-600">Built with Next.js + NestJS</p>
        </section>
      </PageContainer>
    </footer>
  );
}

