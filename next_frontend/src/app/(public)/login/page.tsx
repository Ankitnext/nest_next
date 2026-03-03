import { AuthPanel } from "@/components/auth/AuthPanel";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;

  // Only allow relative paths starting with "/" to prevent open-redirect attacks
  const safeRedirect =
    redirect && redirect.startsWith("/") ? redirect : "/shop";

  return (
    <section className="space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
          Baazaarse Access
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-100">
          Login or Create Account
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          {safeRedirect === "/shop"
            ? "Login to unlock the full Baazaarse shop experience."
            : "Connected to NestJS auth endpoints backed by Neon PostgreSQL."}
        </p>
      </div>
      <AuthPanel redirectTo={safeRedirect} />
    </section>
  );
}
