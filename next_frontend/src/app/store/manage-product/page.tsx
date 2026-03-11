"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Always uses correct API based on current browser location
function getApi() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("baazaarse") || host === "82.112.236.1") {
      return "https://baazaarse.online/api";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
}

function getToken() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return m ? m[1] : "";
}

interface VendorProduct {
  id: number; trnum: string; name: string; description: string;
  price: string; old_price: string | null; category: string;
  image: string; in_stock: boolean; stock_count: number; created_at: string;
}

export default function StoreManageProductsPage() {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const api = getApi();
    const token = getToken();
    setLoading(true);
    fetch(`${api}/vendor/products`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) {
          setProducts(d);
        } else if (d.message) {
          setError(`Error: ${d.message}`);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setError("Failed to load products. Please check your connection."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage Products</h2>
          <p className="text-sm text-slate-500 mt-0.5">All products listed under your store</p>
        </div>
        <Link href="/store/add-product"
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
          ➕ Add Product
        </Link>
      </div>

      {error && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500 border border-rose-500/20">{error}</p>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-10 text-center">
          <p className="text-slate-500 text-sm animate-pulse">Loading your products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center space-y-3">
          <p className="text-4xl">📦</p>
          <p className="font-semibold text-slate-700">No products yet</p>
          <p className="text-slate-500 text-sm">Use the Add Product page to list your first item.</p>
          <Link href="/store/add-product"
            className="inline-block mt-2 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
            ➕ Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-3 text-xs uppercase tracking-widest text-slate-500 font-medium">
            <span>Tracking #</span>
            <span>Product</span>
            <span>Category</span>
            <span className="text-right">Price</span>
            <span className="text-center">Stock</span>
            <span>Added</span>
          </div>

          {products.map((p) => (
            <div key={p.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-slate-200/60 last:border-0 px-5 py-3 hover:bg-slate-50/50 transition">

              <span className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-orange-500 truncate w-fit">
                {p.trnum}
              </span>

              <div className="flex items-center gap-2 min-w-0">
                {p.image ? (
                  <img src={p.image} alt={p.name}
                    className="h-9 w-9 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center text-lg">📦</div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400 truncate">{p.description.slice(0, 45)}{p.description.length > 45 ? "…" : ""}</p>
                </div>
              </div>

              <span className="hidden sm:block text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 w-fit">{p.category}</span>

              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-orange-500">${parseFloat(p.price).toFixed(2)}</p>
                {p.old_price && (
                  <p className="text-xs text-slate-400 line-through">${parseFloat(p.old_price).toFixed(2)}</p>
                )}
              </div>

              <div className="hidden sm:flex justify-center">
                <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                  p.in_stock
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}>
                  {p.in_stock ? `${p.stock_count} left` : "Out of Stock"}
                </span>
              </div>

              <span className="hidden sm:block text-xs text-slate-400">
                {new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <p className="text-xs text-slate-400 text-right">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
      )}
    </section>
  );
}
