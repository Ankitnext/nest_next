"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest, registerRequest } from "@/lib/auth-api";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "register";
type Role = "user" | "vendor" | "delivery";

interface AuthPanelProps {
  redirectTo?: string;
  allowedRoles?: Role[];
}

const ROLE_OPTIONS: { value: Role; label: string; icon: string; desc: string }[] = [
  { value: "user",     label: "Customer",      icon: "👤", desc: "Browse & order products" },
  { value: "vendor",   label: "Vendor",        icon: "🏪", desc: "Sell products & manage orders" },
  { value: "delivery", label: "Delivery Boy",  icon: "🛵", desc: "Deliver orders & earn" },
];

const VEHICLE_OPTIONS = ["Bike", "Bicycle", "Scooter", "Car", "Van", "Walking"];

function roleRedirect(role: string): string {
  if (role === "admin")    return "/admin";
  if (role === "vendor")   return "/store";
  if (role === "delivery") return "/delivery";
  return "/shop";
}

export function AuthPanel({ redirectTo, allowedRoles = ["user", "vendor", "delivery"] }: AuthPanelProps) {
  const router = useRouter();
  const { login } = useAuth();

  const filteredRoles = ROLE_OPTIONS.filter(opt => allowedRoles.includes(opt.value));

  const [mode,        setMode]        = useState<Mode>("login");
  const [role,        setRole]        = useState<Role>(filteredRoles[0]?.value ?? "user");
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [storeName,   setStoreName]   = useState("");
  const [phone,       setPhone]       = useState("");
  const [vehicle,     setVehicle]     = useState("Bike");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response =
        mode === "login"
          ? await loginRequest({ email, password })
          : await registerRequest({
              name,
              email,
              password,
              role,
              vendor_store: role === "vendor" ? storeName : undefined,
              phone:        role === "delivery" ? phone : undefined,
              vehicle_type: role === "delivery" ? vehicle : undefined,
            });

      login(response.token);

      const dest = redirectTo && redirectTo !== "/shop"
        ? redirectTo
        : roleRedirect(response.role ?? role);

      router.push(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white/85 p-6 md:p-8 space-y-5">
      {/* Role picker (register mode only) */}
      {mode === "register" && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">Register as</p>
          <div className={`grid gap-2 ${filteredRoles.length === 1 ? "grid-cols-1 max-w-[200px] mx-auto" : "grid-cols-" + Math.min(filteredRoles.length, 3)}`}>
            {filteredRoles.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center text-xs transition ${
                  role === opt.value
                    ? "border-orange-500 bg-orange-500/10 text-orange-500"
                    : "border-slate-200 text-slate-500 hover:border-slate-400"
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <span className="font-semibold">{opt.label}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex rounded-full border border-slate-200 p-1">
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              mode === m ? "bg-orange-500 text-white" : "text-slate-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <label className="block space-y-1">
            <span className="text-sm text-slate-800">Full Name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
              placeholder="John Doe" />
          </label>
        )}

        {/* Vendor: store name */}
        {mode === "register" && role === "vendor" && (
          <label className="block space-y-1">
            <span className="text-sm text-slate-800">Store Name (slug)</span>
            <input required value={storeName} onChange={(e) => setStoreName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
              placeholder="my-store" />
          </label>
        )}

        {/* Delivery boy: phone + vehicle */}
        {mode === "register" && role === "delivery" && (
          <>
            <label className="block space-y-1">
              <span className="text-sm text-slate-800">Phone Number</span>
              <input required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
                placeholder="+91 98765 43210" />
            </label>
            <div className="space-y-1">
              <p className="text-sm text-slate-800">Vehicle Type</p>
              <div className="grid grid-cols-3 gap-2">
                {VEHICLE_OPTIONS.map((v) => (
                  <button key={v} type="button" onClick={() => setVehicle(v)}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${
                      vehicle === v
                        ? "border-orange-500 bg-orange-500/10 text-orange-500"
                        : "border-slate-200 text-slate-500 hover:border-slate-400"
                    }`}>
                    {v === "Bike" ? "🏍️" : v === "Bicycle" ? "🚲" : v === "Scooter" ? "🛵" : v === "Car" ? "🚗" : v === "Van" ? "🚐" : "🚶"} {v}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <label className="block space-y-1">
          <span className="text-sm text-slate-800">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            placeholder="you@example.com" />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-800">Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            placeholder="Minimum 6 characters" />
        </label>

        {error && (
          <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-300">{error}</p>
        )}

        <button disabled={loading} type="submit"
          className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? "Please wait…" : mode === "login" ? "Login" : `Register as ${ROLE_OPTIONS.find(r => r.value === role)?.label ?? role}`}
        </button>
      </form>
    </section>
  );
}
