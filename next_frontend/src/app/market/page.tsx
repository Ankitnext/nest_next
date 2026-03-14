"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { asCurrency } from "@/lib/format";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const tok = () => { const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/); return m ? m[1] : ""; };
const authH = () => ({ Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" });

interface MarketProduct {
  id: number; name: string; description: string;
  price: string; old_price: string | null;
  image: string | null; category: string;
  stock_count: number; created_at: string;
}

interface MarketOrder {
  id: number; order_number: string; product_name: string; product_image: string | null;
  price: string; quantity: number; status: string; ordered_at: string;
  vendor_name?: string; vendor_store?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-slate-600/20 text-slate-600 border-slate-200/40",
  confirmed:  "bg-blue-500/20 text-blue-300 border-blue-500/40",
  shipped:    "bg-orange-500/20 text-orange-300 border-orange-500/40",
  delivered:  "bg-orange-600/20 text-orange-500 border-orange-600/40",
};

export default function MarketPage() {
  const { role, userName, userStore } = useAuth();
  const router = useRouter();

  const [products,  setProducts]  = useState<MarketProduct[]>([]);
  const [orders,    setOrders]    = useState<MarketOrder[]>([]);
  const [tab,       setTab]       = useState<"browse" | "orders" | "manage">("browse");
  const [loading,   setLoading]   = useState(true);
  const [buying,    setBuying]    = useState<number | null>(null);
  const [qty,       setQty]       = useState<Record<number, number>>({});
  const [msg,       setMsg]       = useState("");
  const [msgType,   setMsgType]   = useState<"ok"|"err">("ok");

  // Admin: product form state
  const [form, setForm] = useState({ name:"", description:"", price:"", old_price:"", image:"", category:"General", stock_count:"10" });
  const [editId, setEditId] = useState<number | null>(null);
  const [saving,  setSaving]  = useState(false);

  const fetchProducts = useCallback(async () => {
    const r = await fetch(`${API}/market/products`, { headers: authH() });
    if (r.ok) setProducts((await r.json()) as MarketProduct[]);
  }, []);

  const fetchOrders = useCallback(async () => {
    const endpoint = role === "admin" ? `${API}/admin/market/orders` : `${API}/market/orders`;
    const r = await fetch(endpoint, { headers: authH() });
    if (r.ok) setOrders((await r.json()) as MarketOrder[]);
  }, [role]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders()]).finally(() => setLoading(false));
  }, [fetchProducts, fetchOrders]);

  async function handleBuy(productId: number) {
    const quantity = qty[productId] ?? 1;
    setBuying(productId);
    const r = await fetch(`${API}/market/orders`, {
      method: "POST", headers: authH(), body: JSON.stringify({ product_id: productId, quantity }),
    });
    const data = await r.json() as { message?: string; order_number?: string };
    if (r.ok) {
      setMsg(`✅ Order ${data.order_number} placed!`); setMsgType("ok");
      await Promise.all([fetchProducts(), fetchOrders()]);
    } else {
      setMsg(`❌ ${data.message ?? "Purchase failed"}`); setMsgType("err");
    }
    setBuying(null);
    setTimeout(() => setMsg(""), 4000);
  }

  async function handleSaveProduct() {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    const url    = editId ? `${API}/admin/market/products/${editId}` : `${API}/admin/market/products`;
    const method = editId ? "PATCH" : "POST";
    const r = await fetch(url, {
      method, headers: authH(),
      body: JSON.stringify({
        name: form.name, description: form.description,
        price: parseFloat(form.price),
        old_price: form.old_price ? parseFloat(form.old_price) : undefined,
        image: form.image || undefined,
        category: form.category,
        stock_count: parseInt(form.stock_count) || 0,
      }),
    });
    if (r.ok) {
      setMsg(editId ? "✅ Product updated!" : "✅ Product added!"); setMsgType("ok");
      setForm({ name:"", description:"", price:"", old_price:"", image:"", category:"General", stock_count:"10" });
      setEditId(null);
      await fetchProducts();
    } else {
      const d = await r.json() as { message?: string };
      setMsg(`❌ ${d.message ?? "Save failed"}`); setMsgType("err");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 4000);
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this market product?")) return;
    await fetch(`${API}/admin/market/products/${id}`, { method: "DELETE", headers: authH() });
    await fetchProducts();
  }

  async function handleOrderStatus(orderId: number, status: string) {
    await fetch(`${API}/admin/market/orders/${orderId}/status`, {
      method: "PATCH", headers: authH(), body: JSON.stringify({ status }),
    });
    await fetchOrders();
  }

  function startEdit(p: MarketProduct) {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description ?? "", price: p.price, old_price: p.old_price ?? "", image: p.image ?? "", category: p.category, stock_count: String(p.stock_count) });
    setTab("manage");
  }

  const isAdmin  = role === "admin";
  const isVendor = role === "vendor";

  if (loading) return <div className="flex h-72 items-center justify-center text-slate-500">Loading market…</div>;
  if (!isAdmin && !isVendor) { router.push("/login"); return null; }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400">B2B Wholesale</p>
            <h1 className="text-3xl font-bold text-slate-900">Vendor Market</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isAdmin ? "Manage wholesale products & vendor orders" : `Welcome, ${userName} · ${userStore ?? "vendor"}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-300">
              {isAdmin ? "🔑 Admin" : "🏪 Vendor"}
            </span>
            <a href="/store" className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition">
              ← Store
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "browse",  label: "🛒 Browse Products" },
            { key: "orders",  label: `📋 ${isAdmin ? "All Orders" : "My Orders"}${orders.length ? ` (${orders.length})` : ""}` },
            ...(isAdmin ? [{ key: "manage", label: "⚙️ Manage Products" }] : []),
          ] as { key: string; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-violet-400 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Global feedback */}
        {msg && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium border ${
            msgType === "ok" ? "bg-orange-600/10 text-orange-500 border-orange-600/20" : "bg-rose-500/10 text-rose-300 border-rose-500/20"
          }`}>{msg}</div>
        )}

        {/* 3D Billboard / Hero Section */}
        {tab === "browse" && products.some(p => p.name.toLowerCase().includes("bill board") || p.name.toLowerCase().includes("billboard")) && (
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent pointer-events-none" />
            
            {products.filter(p => p.name.toLowerCase().includes("bill board") || p.name.toLowerCase().includes("billboard")).map(p => (
              <div key={p.id} className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300 uppercase tracking-widest">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                    </span>
                    Admin Choice
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {p.name}
                  </h2>
                  <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-500 font-medium">Wholesale Price</span>
                      <span className="text-3xl font-bold text-orange-500">{asCurrency(parseFloat(p.price))}</span>
                    </div>
                    <button onClick={() => handleBuy(p.id)} disabled={buying === p.id || p.stock_count === 0}
                      className="rounded-full bg-white px-8 py-3.5 text-sm font-black text-slate-900 hover:bg-violet-400 hover:text-white transition-all transform hover:scale-105 shadow-xl disabled:opacity-50">
                      {buying === p.id ? "Ordering..." : "ADVERTISE NOW"}
                    </button>
                  </div>
                </div>
                
                <div className="relative w-full md:w-1/3 aspect-square max-w-[320px]">
                  <div className="absolute inset-0 bg-violet-500/20 blur-[80px] rounded-full" />
                  {p.image ? (
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="relative z-10 w-full h-full object-contain rounded-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500 drop-shadow-[0_20px_50px_rgba(113,88,226,0.3)]" 
                    />
                  ) : (
                    <div className="relative z-10 w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-6xl shadow-inner border border-slate-700">
                      🏢
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Browse tab ── */}
        {tab === "browse" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200/60 bg-white/60 p-12 text-center">
                <p className="text-3xl mb-2">🏪</p>
                <p className="text-slate-600 font-medium">No products listed yet</p>
                <p className="text-slate-500 text-sm mt-1">{isAdmin ? "Add wholesale products from the Manage tab" : "Check back soon — admin will list products"}</p>
              </div>
            ) : products.map(p => (
              <div key={p.id} className="rounded-2xl border border-slate-200/60 bg-white/80 overflow-hidden flex flex-col">
                {p.image
                  ? <img src={p.image} alt={p.name} className="h-44 w-full object-cover" />
                  : <div className="h-44 bg-gradient-to-br from-violet-900/30 to-slate-800 flex items-center justify-center text-4xl">📦</div>
                }
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-violet-400">{p.category}</span>
                    <h3 className="font-semibold text-slate-900 mt-0.5">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold text-orange-500">{asCurrency(parseFloat(p.price))}</span>
                    {p.old_price && <span className="text-xs text-slate-500 line-through">{asCurrency(parseFloat(p.old_price))}</span>}
                  </div>
                  <p className={`text-xs font-medium ${p.stock_count > 0 ? "text-orange-500" : "text-rose-400"}`}>
                    {p.stock_count > 0 ? `${p.stock_count} units available` : "Out of stock"}
                  </p>
                  {isVendor && (
                    <div className="flex gap-2 mt-auto items-center">
                      <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden">
                        <button onClick={() => setQty(q => ({ ...q, [p.id]: Math.max(1, (q[p.id]??1)-1) }))}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-700 transition text-sm">−</button>
                        <span className="px-3 py-1 text-sm text-slate-900 min-w-[28px] text-center">{qty[p.id] ?? 1}</span>
                        <button onClick={() => setQty(q => ({ ...q, [p.id]: Math.min(p.stock_count, (q[p.id]??1)+1) }))}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-700 transition text-sm">+</button>
                      </div>
                      <button onClick={() => handleBuy(p.id)}
                        disabled={buying === p.id || p.stock_count === 0}
                        className="flex-1 rounded-full bg-violet-500 py-2 text-xs font-bold text-white hover:bg-violet-400 transition disabled:opacity-50">
                        {buying === p.id ? "Ordering…" : "🛒 Buy"}
                      </button>
                      {isAdmin && <button onClick={() => startEdit(p)} className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:border-violet-400 hover:text-violet-300 transition">Edit</button>}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="flex gap-2 mt-auto">
                      <button onClick={() => startEdit(p)} className="flex-1 rounded-full border border-violet-400/30 py-1.5 text-xs text-violet-300 hover:bg-violet-400/10 transition">✏️ Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="rounded-full border border-rose-500/30 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition">🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Orders tab ── */}
        {tab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-10 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="text-slate-600 font-medium">No orders yet</p>
                <p className="text-slate-500 text-sm mt-1">{isAdmin ? "Vendor orders will appear here" : "Browse the market and place your first order"}</p>
              </div>
            ) : orders.map(o => {
              const statusColor = STATUS_COLORS[o.status] ?? STATUS_COLORS.pending;
              return (
                <div key={o.id} className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  {o.product_image
                    ? <img src={o.product_image} alt={o.product_name} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                    : <div className="h-14 w-14 rounded-xl bg-violet-900/40 flex items-center justify-center flex-shrink-0 text-xl">📦</div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">{o.product_name}</p>
                      <span className="font-mono text-[10px] text-violet-300 bg-violet-400/10 border border-violet-400/30 rounded px-1.5 py-0.5">{o.order_number}</span>
                    </div>
                    <p className="text-xs text-slate-500">Qty: {o.quantity} · {asCurrency(parseFloat(o.price) * o.quantity)}</p>
                    {isAdmin && o.vendor_name && <p className="text-xs text-slate-500">Vendor: {o.vendor_name} ({o.vendor_store})</p>}
                    <p className="text-xs text-slate-500">{new Date(o.ordered_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${statusColor}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                    {isAdmin && (
                      <select
                        defaultValue={o.status}
                        onChange={e => handleOrderStatus(o.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800">
                        {["pending","confirmed","shipped","delivered"].map(s =>
                          <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                        )}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Admin: Manage products tab ── */}
        {tab === "manage" && isAdmin && (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Product list */}
            <div className="space-y-3">
              <h2 className="text-sm uppercase tracking-widest text-slate-500">All Market Products ({products.length})</h2>
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/60 p-3">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                    : <div className="h-12 w-12 rounded-xl bg-violet-900/30 flex items-center justify-center flex-shrink-0">📦</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{asCurrency(parseFloat(p.price))} · Stock: {p.stock_count} · {p.category}</p>
                  </div>
                  <button onClick={() => startEdit(p)} className="rounded-lg border border-violet-400/30 px-3 py-1 text-xs text-violet-300 hover:bg-violet-400/10 transition">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="rounded-lg border border-rose-500/30 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/10 transition">Delete</button>
                </div>
              ))}
            </div>

            {/* Add / Edit form */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 space-y-4">
              <h2 className="font-semibold text-slate-900">{editId ? "✏️ Edit Product" : "➕ Add Product"}</h2>
              {(["name","description","price","old_price","image","category","stock_count"] as const).map(field => (
                <div key={field} className="space-y-1">
                  <label className="text-xs text-slate-500 capitalize">{field.replace("_"," ")}</label>
                  {field === "description"
                    ? <textarea value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                        rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400 resize-none" />
                    : <input type={["price","old_price","stock_count"].includes(field) ? "number" : "text"}
                        value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400"
                        placeholder={field === "image" ? "https://..." : ""} />
                  }
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={handleSaveProduct} disabled={saving || !form.name || !form.price}
                  className="flex-1 rounded-full bg-violet-500 py-2 text-sm font-bold text-white hover:bg-violet-400 transition disabled:opacity-50">
                  {saving ? "Saving…" : editId ? "Update" : "Add to Market"}
                </button>
                {editId && (
                  <button onClick={() => { setEditId(null); setForm({ name:"", description:"", price:"", old_price:"", image:"", category:"General", stock_count:"10" }); }}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 hover:border-slate-400 transition">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
