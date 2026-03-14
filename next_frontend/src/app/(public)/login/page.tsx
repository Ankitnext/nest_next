import { AuthPanel } from "@/components/auth/AuthPanel";

import { headers } from "next/headers";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string, mode?: string, role?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, mode, role } = await searchParams;
  
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // Only allow relative paths starting with "/" to prevent open-redirect attacks
  const safeRedirect =
    redirect && redirect.startsWith("/") ? redirect : "/shop";

  // Determine allowed roles based on domain
  let allowedRoles: ("user" | "vendor" | "delivery" | "service_provider")[] = ["user", "vendor", "delivery", "service_provider"]; // Default: allow all on localhost
  if (host.includes("baazaarse.com")) {
    allowedRoles = ["user"];
  } else if (host.includes("baazaarse.online")) {
    allowedRoles = ["vendor", "delivery", "service_provider"];
  }

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-orange-500">
          Baazaarse Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {mode === "register" ? "Create an Account" : "Sign In to Your Account"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {safeRedirect === "/shop"
            ? "One account for buying, selling, and delivering services."
            : "Connected to NestJS auth endpoints backed by Neon PostgreSQL."}
        </p>
      </div>
      <AuthPanel 
        redirectTo={safeRedirect} 
        allowedRoles={allowedRoles} 
        defaultMode={mode as "login" | "register" | undefined}
        defaultRole={role as any}
      />
    </section>
  );
}
