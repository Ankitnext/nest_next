import { AuthPanel } from "@/components/auth/AuthPanel";

import { headers } from "next/headers";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;
  
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Only allow relative paths starting with "/" to prevent open-redirect attacks
  const safeRedirect =
    redirect && redirect.startsWith("/") ? redirect : "/shop";

  // Determine allowed roles based on domain
  let allowedRoles: ("user" | "vendor" | "delivery")[] = ["user", "vendor", "delivery"]; // Default: allow all on localhost
  if (host.includes("baazaarse.com")) {
    allowedRoles = ["user"];
  } else if (host.includes("baazaarse.online")) {
    allowedRoles = ["vendor", "delivery"];
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-orange-500">
          Baazaarse Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Login or Create Account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {safeRedirect === "/shop"
            ? "Login to unlock the full Baazaarse shop experience."
            : "Connected to NestJS auth endpoints backed by Neon PostgreSQL."}
        </p>
      </div>
      <AuthPanel redirectTo={safeRedirect} allowedRoles={allowedRoles} />
    </section>
  );
}
