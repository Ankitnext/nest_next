"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest, registerRequest } from "@/lib/auth-api";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "register";

interface AuthPanelProps {
  /** Where to send the user after a successful auth. Defaults to /shop. */
  redirectTo?: string;
}

export function AuthPanel({ redirectTo = "/shop" }: AuthPanelProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response =
        mode === "login"
          ? await loginRequest({ email, password })
          : await registerRequest({ name, email, password });

      // login() sets the cookie + localStorage AND flips isLoggedIn in context
      // → navbar updates instantly, no reload needed
      login(response.token);

      // Navigate to the originally requested page
      router.push(redirectTo);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Request failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900/85 p-6 md:p-8">
      {/* Mode toggle */}
      <div className="mb-6 flex rounded-full border border-slate-600 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "login" ? "bg-emerald-400 text-slate-950" : "text-slate-200"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
            mode === "register"
              ? "bg-emerald-400 text-slate-950"
              : "text-slate-200"
          }`}
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <label className="block space-y-1">
            <span className="text-sm text-slate-200">Full Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-300"
              placeholder="John Doe"
            />
          </label>
        )}

        <label className="block space-y-1">
          <span className="text-sm text-slate-200">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-300"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-200">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-500 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-300"
            placeholder="Minimum 6 characters"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading
            ? "Please wait…"
            : mode === "login"
            ? "Login & Enter Shop"
            : "Create Account & Enter Shop"}
        </button>
      </form>
    </section>
  );
}
