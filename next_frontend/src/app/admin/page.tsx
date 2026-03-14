"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { asCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const tok = () => {
  const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return m ? m[1] : "";
};
const H = () => ({ Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" });

// ── Types ──────────────────────────────────────────────────────────────────

interface RegisteredVendor {
  id: number; name: string; email: string; store: string | null;
  product_count: number; order_count: number;
  gross_revenue: number; platform_margin: number; vendor_profit: number;
  joined: string;
}

interface RegisteredUser {
  id: number; name: string; email: string;
  order_count: number; total_spent: number; joined: string;
}

interface VendorVerification {
  id: number;
  name: string;
  email: string;
  vendor_store: string;
  gst_number: string;
  aadhar_number: string;
  shop_image: string;
  verification_status: string;
  created_at: string;
}

interface ProductBreakdown {
  product_id: number; product_name: string; product_image: string;
  qty: number; revenue?: number; spent?: number;
  orders: { id: number; status: string; ordered_at: string }[];
}

interface DrillDown {
  id: number;
  type: "vendor" | "user";
  total_orders: number;
  total: number; // revenue (vendor) or spent (user)
  products: ProductBreakdown[];
}

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-slate-500/20 text-slate-600",
  confirmed:  "bg-blue-500/20 text-blue-300",
  packing:    "bg-purple-500/20 text-purple-300",
  ready:      "bg-amber-500/20 text-amber-300",
  in_transit: "bg-orange-500/20 text-orange-300",
  delivered:  "bg-orange-600/20 text-orange-500",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Placed", confirmed: "Received", packing: "Packing",
  ready: "Ready", in_transit: "In Transit", delivered: "Delivered ✓",
};

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}

// ── Drill-down expand panel ─────────────────────────────────────────────────

function DrillPanel({ data, type }: { data: DrillDown; type: "vendor" | "user" }) {
  return (
    <div className="border-t border-slate-200/40 bg-slate-50/30 px-6 py-5 space-y-4">
      <div className="flex gap-6 text-sm">
        <span className="text-slate-500">Orders: <strong className="text-slate-900">{data.total_orders}</strong></span>
        <span className="text-slate-500">
          {type === "vendor" ? "Net Profit" : "Total Spent"}:{" "}
          <strong className="text-orange-500">{asCurrency(data.total)}</strong>
        </span>
      </div>

      {data.products.length === 0 ? (
        <p className="text-sm text-slate-500 py-2">No order history yet.</p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            {type === "vendor" ? "Products Sold" : "Products Ordered"}
          </p>
          {data.products.map(p => (
            <div key={p.product_id} className="flex items-start gap-4 rounded-xl border border-slate-200/40 bg-white/60 p-4">
              <img src={p.product_image} alt={p.product_name} className="h-11 w-11 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">{p.product_name}</p>
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>📦 {p.qty} unit{p.qty !== 1 ? "s" : ""}</span>
                  <span>
                    {type === "vendor" ? "💰 Revenue: " : "💳 Spent: "}
                    <span className="text-orange-500 font-semibold">
                      {asCurrency(type === "vendor" ? (p.revenue ?? 0) : (p.spent ?? 0))}
                    </span>
                  </span>
                  <span>🧾 {p.orders.length} order{p.orders.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.orders.map(o => (
                    <span key={o.id}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border border-white/5 ${STATUS_STYLES[o.status] ?? "bg-slate-600/20 text-slate-600"}`}>
                      #{o.id} {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-orange-500">
                  {asCurrency(type === "vendor" ? (p.revenue ?? 0) : (p.spent ?? 0))}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">{type === "vendor" ? "revenue" : "spent"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product type (for Markets tab) ─────────────────────────────────────────

interface Product {
  id: number; name: string; description: string; image: string;
  price: number; currency: string; store: string; category?: string;
  oldPrice?: number;
}

interface StoreGroup {
  store: string;
  products: Product[];
  gmv: number;
}

// ── Main Page ───────────────────────────────────────────────────────────────

type Tab = "vendors" | "users" | "markets" | "market" | "ar" | "verifications";

function AdminContent() {
  const { userName } = useAuth();
  const params = useSearchParams();

  const [vendors,  setVendors]  = useState<RegisteredVendor[]>([]);
  const [users,    setUsers]    = useState<RegisteredUser[]>([]);
  const [markets,  setMarkets]  = useState<StoreGroup[]>([]);
  const [verifs,   setVerifs]   = useState<VendorVerification[]>([]);
  const [tab,      setTab]      = useState<Tab>(() => (params.get("tab") as Tab) ?? "vendors");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [mExpanded,setMExpanded]= useState<string | null>(null);

  const [expanded,  setExpanded]  = useState<number | null>(null);
  const [drillData, setDrillData] = useState<DrillDown | null>(null);
  const [drillLoad, setDrillLoad] = useState(false);

  // Keep tab in sync with URL ?tab param
  useEffect(() => {
    const t = params.get("tab") as Tab | null;
    if (t) setTab(t);
  }, [params]);

  useEffect(() => {
    const h = H();
    setLoading(true);
    Promise.all([
      fetch(`${API}/admin/registered-vendors`, { headers: h }).then(r => r.json()),
      fetch(`${API}/admin/users`,              { headers: h }).then(r => r.json()),
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/admin/vendors/verifications`, { headers: h }).then(r => r.json()),
    ])
      .then(([v, u, prods, verifData]) => {
        setVendors(Array.isArray(v)     ? v     as RegisteredVendor[] : []);
        setUsers(Array.isArray(u)       ? u     as RegisteredUser[]   : []);
        setVerifs(Array.isArray(verifData) ? verifData as VendorVerification[] : []);
        // Group products by store
        const allProds: Product[] = Array.isArray(prods) ? prods as Product[] : [];
        const storeMap: Record<string, Product[]> = {};
        for (const p of allProds) {
          if (!storeMap[p.store]) storeMap[p.store] = [];
          storeMap[p.store].push(p);
        }
        const groups: StoreGroup[] = Object.entries(storeMap).map(([store, ps]) => ({
          store,
          products: ps,
          gmv: ps.reduce((s, p) => s + p.price, 0),
        })).sort((a, b) => b.products.length - a.products.length);
        setMarkets(groups);
      })
      .catch(() => setError("Failed to load admin data."))
      .finally(() => setLoading(false));
  }, []);

  async function expand(id: number, type: Tab) {
    if (expanded === id) { setExpanded(null); setDrillData(null); return; }
    setExpanded(id);
    setDrillLoad(true);
    setDrillData(null);

    if (type === "vendors") {
      const v = vendors.find(x => x.id === id)!;
      const res = await fetch(`${API}/admin/vendors/${v.store ?? "unknown"}/orders`, { headers: H() });
      const d = await res.json() as { total_orders: number; total_revenue: number; products: ProductBreakdown[] };
      setDrillData({ id, type: "vendor", total_orders: d.total_orders, total: v.vendor_profit, products: d.products.map(p => ({ ...p, revenue: p.revenue })) });
    } else {
      const res = await fetch(`${API}/admin/users/${id}/orders`, { headers: H() });
      const d = await res.json() as { total_orders: number; total_spent: number; products: ProductBreakdown[] };
      setDrillData({ id, type: "user", total_orders: d.total_orders, total: d.total_spent, products: d.products });
    }
    setDrillLoad(false);
  }

  async function handleVerify(id: number, status: "approved" | "rejected") {
    try {
      const res = await fetch(`${API}/admin/vendors/${id}/verify`, {
        method: "PATCH",
        headers: H(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to verify vendor");
      
      setVerifs(prev => prev.map(v => v.id === id ? { ...v, verification_status: status } : v));
      // Refresh vendor list slightly to reflect the change if needed
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Summary KPIs
  const totalGross   = vendors.reduce((s, v) => s + v.gross_revenue, 0);
  const totalMargin  = vendors.reduce((s, v) => s + v.platform_margin, 0);
  const totalProfit  = vendors.reduce((s, v) => s + v.vendor_profit, 0);
  const totalOrders  = vendors.reduce((s, v) => s + v.order_count, 0);

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search) || (v.store ?? "").toLowerCase().includes(search) || v.email.toLowerCase().includes(search)
  );
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500">Admin Control Center</p>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, {userName ?? "Admin"}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-500 border border-orange-500/20">
          🟢 System Operational
        </span>
      </div>

      {error && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 border border-rose-500/20">{error}</p>}

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross Revenue"      value={asCurrency(totalGross)}   icon="💰" sub="Total platform sales" />
        <StatCard label="Platform Earnings"  value={asCurrency(totalMargin)}  icon="📊" sub="10% margin collected" />
        <StatCard label="Vendor Payouts"     value={asCurrency(totalProfit)}  icon="🏪" sub="Net paid to vendors" />
        <StatCard label="Total Orders"       value={String(totalOrders)}      icon="📦" sub={`${vendors.length} vendors · ${users.length} users`} />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {([
            { key: "vendors", label: `🏪 Vendors (${vendors.length})` },
            { key: "users",   label: `👤 Users (${users.length})` },
            { key: "markets", label: `🏬 Markets (${markets.length})` },
            { key: "verifications", label: `✅ Verifications (${verifs.filter(v => v.verification_status === "pending").length})` },
            { key: "market",  label: "🛍️ Vendor Market" },
            { key: "ar",      label: "🕶️ AR Models" },
          ] as { key: Tab; label: string }[]).map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setExpanded(null); setDrillData(null); setSearch(""); }}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                tab === t.key ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value.toLowerCase())}
          placeholder={tab === "markets" ? "Search markets…" : tab === "vendors" ? "Search vendors…" : "Search users…"}
          className="rounded-xl border border-slate-200 bg-white/60 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-500 outline-none focus:border-orange-500 sm:w-56" />
      </div>

      {loading && <p className="text-slate-500 text-sm animate-pulse">Loading data…</p>}

      {/* ── Vendors ──────────────────────────────────────────────────────── */}
      {!loading && tab === "vendors" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 border-b border-slate-200/60 bg-slate-50/50 px-5 py-3 text-xs uppercase tracking-widest text-slate-500">
            <span>Vendor</span><span className="text-center">Products</span><span className="text-center">Orders</span>
            <span className="text-right">Gross</span><span className="text-right">Margin (10%)</span><span className="text-right">Net Profit</span>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">🏪</p>
              <p className="text-slate-600 font-medium">No vendors registered yet</p>
            </div>
          ) : filteredVendors.map(v => (
            <div key={v.id} className="border-b border-slate-200/40 last:border-0">
              {/* Row */}
              <button onClick={() => expand(v.id, "vendors")} className="w-full text-left">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 px-5 py-4 hover:bg-slate-50/30 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-sm font-bold text-orange-500">
                      {v.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{v.name}</p>
                      <p className="text-xs text-slate-500 truncate">{v.email}</p>
                      {v.store && <p className="text-xs text-orange-500 truncate">🏪 {v.store}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 text-center">{v.product_count}</p>
                  <p className="text-sm text-slate-600 text-center">{v.order_count}</p>
                  <p className="text-sm text-right text-slate-600">{asCurrency(v.gross_revenue)}</p>
                  <p className="text-sm text-right text-rose-400">−{asCurrency(v.platform_margin)}</p>
                  <div className="flex items-center justify-end gap-2">
                    <p className={`text-sm font-bold ${v.vendor_profit > 0 ? "text-orange-500" : "text-slate-500"}`}>
                      {asCurrency(v.vendor_profit)}
                    </p>
                    <span className="text-slate-500 text-sm">{expanded === v.id ? "▲" : "▼"}</span>
                  </div>
                </div>
              </button>
              {expanded === v.id && (
                drillLoad ? (
                  <div className="border-t border-slate-200/40 bg-slate-50/30 px-6 py-4">
                    <p className="text-sm text-slate-500 animate-pulse">Loading orders…</p>
                  </div>
                ) : drillData ? (
                  <DrillPanel data={drillData} type="vendor" />
                ) : null
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Users ──────────────────────────────────────────────────────────── */}
      {!loading && tab === "users" && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_auto] gap-2 border-b border-slate-200/60 bg-slate-50/50 px-5 py-3 text-xs uppercase tracking-widest text-slate-500">
            <span>User</span><span className="text-center">Orders</span><span className="text-right">Total Spent</span><span className="text-right">Joined</span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-slate-600 font-medium">No users registered yet</p>
            </div>
          ) : filteredUsers.map(u => (
            <div key={u.id} className="border-b border-slate-200/40 last:border-0">
              <button onClick={() => expand(u.id, "users")} className="w-full text-left">
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-2 px-5 py-4 hover:bg-slate-50/30 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-sm font-bold text-blue-300">
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 text-center">{u.order_count}</p>
                  <p className={`text-sm font-semibold text-right ${u.total_spent > 0 ? "text-orange-500" : "text-slate-500"}`}>
                    {asCurrency(u.total_spent)}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 text-right">{new Date(u.joined).toLocaleDateString()}</p>
                    <span className="text-slate-500 text-sm">{expanded === u.id ? "▲" : "▼"}</span>
                  </div>
                </div>
              </button>
              {expanded === u.id && (
                drillLoad ? (
                  <div className="border-t border-slate-200/40 bg-slate-50/30 px-6 py-4">
                    <p className="text-sm text-slate-500 animate-pulse">Loading orders…</p>
                  </div>
                ) : drillData ? (
                  <DrillPanel data={drillData} type="user" />
                ) : null
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Markets ──────────────────────────────────────────────────────────── */}
      {!loading && tab === "markets" && (() => {
        const filteredMarkets = markets.filter(m => m.store.toLowerCase().includes(search));
        return (
          <div className="space-y-4">
            {filteredMarkets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-10 text-center">
                <p className="text-3xl mb-2">🏬</p>
                <p className="text-slate-600 font-medium">No markets found</p>
              </div>
            ) : filteredMarkets.map(m => (
              <div key={m.store} className="rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden">
                {/* Store header row */}
                <button onClick={() => setMExpanded(mExpanded === m.store ? null : m.store)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-base font-bold text-orange-500">
                      {m.store[0]?.toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{m.store}</p>
                      <p className="text-xs text-slate-500">{m.products.length} products · Catalog GMV {asCurrency(m.gmv)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-500">
                      {m.products.length} products
                    </span>
                    <span className="text-slate-500">{mExpanded === m.store ? "▲" : "▼"}</span>
                  </div>
                </button>

                {/* Product grid */}
                {mExpanded === m.store && (
                  <div className="border-t border-slate-200/40 bg-slate-50/20 p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {m.products.map(p => (
                        <div key={p.id} className="rounded-xl border border-slate-200/40 bg-white/60 overflow-hidden">
                          <div className="relative">
                            <img src={p.image} alt={p.name}
                              className="h-32 w-full object-cover" />
                            {p.category && (
                              <span className="absolute top-2 left-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                                {p.category}
                              </span>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">{p.name}</p>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <span className="text-sm font-bold text-orange-500">{asCurrency(p.price)}</span>
                              {p.oldPrice && p.oldPrice > p.price && (
                                <span className="text-[10px] text-slate-500 line-through">{asCurrency(p.oldPrice)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {!loading && tab === "market" && (
        <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-10 text-center space-y-5">
          <p className="text-5xl">🛍️</p>
          <h2 className="text-2xl font-bold text-slate-900">Vendor Market Console</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Add wholesale products for vendors to purchase, manage stock levels,
            and track all vendor orders — all in the dedicated Market console.
          </p>
          <a href="/market"
            className="inline-block rounded-full bg-violet-500 px-8 py-3 text-sm font-bold text-white hover:bg-violet-400 transition shadow-lg shadow-violet-500/20">
            Open Market Console →
          </a>
        </div>
      )}

      {!loading && tab === "ar" && (
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-10 text-center space-y-5">
          <p className="text-5xl">🕶️</p>
          <h2 className="text-2xl font-bold text-slate-900">AR/VR Model Management</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Upload and manage 3D AR/VR models. Generate QR codes and grant vendors
            global access to use these models in their own shops.
          </p>
          <a href="/admin/ar"
            className="inline-block rounded-full bg-sky-500 px-8 py-3 text-sm font-bold text-white hover:bg-sky-400 transition shadow-lg shadow-sky-500/20">
            Open AR Console →
          </a>
        </div>
      )}

      {/* ── Verifications ──────────────────────────────────────────────────────── */}
      {!loading && tab === "verifications" && (
        <div className="space-y-4">
          {verifs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 px-5 py-10 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-slate-600 font-medium">No pending verifications</p>
            </div>
          ) : verifs.map(v => (
            <div key={v.id} className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 overflow-hidden flex flex-col md:flex-row gap-6">
              {/* Image Section */}
              <div className="w-full md:w-48 h-32 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative">
                {v.shop_image ? (
                  <img src={v.shop_image} alt={v.vendor_store} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Shop Image</div>
                )}
                <div className="absolute top-2 left-2">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${v.verification_status === 'approved' ? 'bg-green-500 text-white' :
                        v.verification_status === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-amber-500 text-white'}`
                    }>
                      {v.verification_status}
                    </span>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {v.name}
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      🏪 {v.vendor_store}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{v.email}</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">GST Number</p>
                    <p className="text-sm font-mono text-slate-800">{v.gst_number || "Not Provided"}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Aadhar Number</p>
                    <p className="text-sm font-mono text-slate-800">{v.aadhar_number || "Not Provided"}</p>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              {v.verification_status === "pending" && (
                <div className="flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-40 flex-shrink-0">
                  <button 
                    onClick={() => handleVerify(v.id, "approved")}
                    className="flex-1 md:flex-none rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold py-2.5 transition active:scale-95 shadow-sm shadow-green-200"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleVerify(v.id, "rejected")}
                    className="flex-1 md:flex-none rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-500 text-sm font-bold py-2.5 transition active:scale-95"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center font-mono tracking-widest text-slate-500 text-xs animate-pulse">Loading Console...</div>}>
      <AdminContent />
    </Suspense>
  );
}

