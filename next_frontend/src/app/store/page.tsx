"use client";

import { useEffect, useState } from "react";
import { asCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { ProductForm as SharedProductForm } from "@/components/store/ProductForm";

import { getApiBaseUrl } from "@/lib/config";

const API = getApiBaseUrl();
const tok = () => {
  const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return m ? m[1] : "";
};
const authH = () => ({ Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" });

interface Order {
  id: number; order_number: string; product_name: string; product_image: string;
  price: number; quantity: number; status: string; ordered_at: string;
}

const STAGES = [
  { key: "pending",    label: "Order Placed",      icon: "🛒", color: "bg-slate-600/20 text-slate-600 border-slate-200/30" },
  { key: "confirmed",  label: "Received",           icon: "📦", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { key: "packing",    label: "Packing",            icon: "🏗️",  color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { key: "ready",      label: "Ready to Deliver",   icon: "✅",  color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { key: "in_transit", label: "Out for Delivery",   icon: "🚚",  color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { key: "delivered",  label: "Delivered ✓",        icon: "🎉",  color: "bg-orange-600/20 text-orange-500 border-orange-600/30" },
];
const STATUS_KEYS = STAGES.map(s => s.key);

// Upload form
interface ProductForm { name: string; desc: string; price: string; category: string; image: string; oldPrice: string; stock: string; }
const EMPTY_FORM: ProductForm = { name: "", desc: "", price: "", category: "Electronics", image: "", oldPrice: "", stock: "" };

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Grocery", "General", "Software"];

interface VendorProduct {
  id: number; trnum: string; name: string; description: string;
  price: string; old_price: string | null; category: string;
  image: string; in_stock: boolean; stock_count: number; created_at: string;
}

interface MarketProduct {
  id: number; name: string; description: string;
  price: string; old_price: string | null;
  image: string | null; category: string;
  stock_count: number; created_at: string;
}

export default function StorePage() {
  const { userName, userStore } = useAuth();
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [myProducts, setMyProducts] = useState<VendorProduct[]>([]);
  const [marketProducts, setMarketProducts] = useState<MarketProduct[]>([]);
  const [arModels,   setArModels]   = useState<any[]>([]);
  const [tab,        setTab]        = useState<"orders" | "upload" | "products" | "ar_models" | "market">("orders");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showQR,     setShowQR]     = useState(false);
  const [hostStr,    setHostStr]    = useState("");
  const [form,       setForm]       = useState<ProductForm>(EMPTY_FORM);
  const [pMsg,       setPMsg]       = useState("");
  const [pErr,       setPErr]       = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setPErr("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tok()}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      setPErr(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      let origin = window.location.origin;
      // Convert localhost automatically into the user's local network IP for proper mobile phone QR scanning
      if (origin.includes("localhost")) {
        origin = origin.replace("localhost", "192.168.1.100");
      }
      setHostStr(origin);
    }
    
    fetch(`${API}/vendor/orders`, { headers: authH() })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d as Order[] : []))
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));

    fetch(`${API}/vendor/ar-models`, { headers: authH() })
      .then(r => r.json())
      .then(d => setArModels(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  // Load my products when tab opens
  useEffect(() => {
    if (tab !== "products") return;
    loadMyProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    if (tab !== "market") return;
    loadMarketProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function setStatus(orderId: number, status: string) {
    const res = await fetch(`${API}/vendor/orders/${orderId}/status`, {
      method: "PATCH", headers: authH(), body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json() as Order;
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    }
  }

  async function loadMyProducts() {
    try {
      const r = await fetch(`${API}/vendor/products`, { headers: authH() });
      const d = await r.json();
      setMyProducts(Array.isArray(d) ? d as VendorProduct[] : []);
    } catch {
      setMyProducts([]);
    }
  }

  async function loadMarketProducts() {
    try {
      const r = await fetch(`${API}/market/products`, { headers: authH() });
      const d = await r.json();
      setMarketProducts(Array.isArray(d) ? d as MarketProduct[] : []);
    } catch {
      setMarketProducts([]);
    }
  }

  const totalRevenue  = orders.reduce((s, o) => s + Number(o.price) * o.quantity, 0);
  const delivered     = orders.filter(o => o.status === "delivered").length;
  const inProgress    = orders.filter(o => o.status !== "delivered" && o.status !== "pending").length;
  const filteredOrders = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-500">Vendor Console</p>
          <h1 className="text-2xl font-bold text-slate-900">Seller Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {userName ?? "Vendor"} · <span className="text-orange-500">{userStore ?? "—"}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowQR(true)}
            className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-400/20 transition">
            📱 Store QR
          </button>
          <button onClick={() => setTab("market")}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              tab === "market" 
                ? "bg-violet-400 text-white border-violet-400" 
                : "border-violet-400/30 bg-violet-400/10 text-violet-300 hover:bg-violet-400/20"
            }`}>
            🏪 Market
          </button>
          <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-500">
            🏪 {userStore ?? "My Store"}
          </span>
        </div>
      </div>

      {showQR && userStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl relative">
            <button onClick={() => setShowQR(false)} className="absolute right-4 top-4 text-slate-500 hover:text-rose-400 transition">✕</button>
            <h2 className="text-xl font-bold text-slate-900">Scan to visit my store</h2>
            <p className="mt-1 text-sm text-slate-500">Share this with your customers</p>
            <div className="mt-6 flex justify-center rounded-2xl bg-white p-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(hostStr ? `${hostStr}/shop?vendor=${encodeURIComponent(userStore)}` : '')}`}
                alt="Store QR Code" 
                className="h-48 w-48 object-contain"
              />
            </div>
            <p className="mt-5 text-xs font-mono text-orange-500 opacity-80 break-all bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
              {hostStr ? `${hostStr}/shop?vendor=${encodeURIComponent(userStore)}` : ''}
            </p>
          </div>
        </div>
      )}

      {error && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 border border-rose-500/20">{error}</p>}

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Orders",   value: String(orders.length),        icon: "📦",  sub: "All time" },
          { label: "Revenue",        value: asCurrency(totalRevenue),     icon: "💰",  sub: "Total earnings" },
          { label: "Delivered",      value: String(delivered),            icon: "✅",  sub: `${((delivered / Math.max(orders.length, 1)) * 100).toFixed(0)}% completion` },
          { label: "In Progress",    value: String(inProgress),           icon: "🚚",  sub: "Being processed" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-slate-500">{kpi.label}</p>
              <span className="text-lg">{kpi.icon}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
            <p className="text-xs text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: "orders",   label: "📦 Orders" },
          { key: "upload",   label: "➕ Add Product" },
          { key: "products", label: `🗂️ My Products${myProducts.length ? ` (${myProducts.length})` : ""}` },
          { key: "market",   label: `🏪 Vendor Market${marketProducts.length ? ` (${marketProducts.length})` : ""}` },
          { key: "ar_models",label: `🕶️ AR Models${arModels.length ? ` (${arModels.length})` : ""}` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.key ? "bg-orange-500 text-white" : "border border-slate-200 text-slate-600 hover:border-orange-500 hover:text-orange-500"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="space-y-4">
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStatusFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                statusFilter === "all" ? "bg-slate-200 text-slate-900 border-slate-200" : "border-slate-200 text-slate-500 hover:border-slate-400"
              }`}>All ({orders.length})</button>
            {STAGES.map(s => {
              const count = orders.filter(o => o.status === s.key).length;
              if (count === 0) return null;
              return (
                <button key={s.key} onClick={() => setStatusFilter(s.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition border ${
                    statusFilter === s.key ? `${s.color} scale-105` : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}>
                  {s.icon} {s.label} ({count})
                </button>
              );
            })}
          </div>

          {loading ? <p className="text-slate-500 text-sm">Loading orders…</p>
          : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-10 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-600 font-medium">No orders yet for your store</p>
              <p className="text-slate-500 text-sm mt-1">Orders from customers will appear here</p>
            </div>
          ) : filteredOrders.map(o => {
            const stage = STAGES.find(s => s.key === o.status) ?? STAGES[0];
            const currentIdx = STATUS_KEYS.indexOf(o.status);
            return (
              <div key={o.id} className="rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden">
                {/* Order header */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-200/40">
                  <img src={o.product_image} alt={o.product_name} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">{o.product_name}</p>
                      {o.order_number && (
                        <span className="rounded-md bg-cyan-400/10 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyan-300 tracking-wider flex-shrink-0">
                          {o.order_number}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Qty: {o.quantity} · {asCurrency(Number(o.price) * o.quantity)} · {new Date(o.ordered_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold flex-shrink-0 ${stage.color}`}>
                    {stage.icon} {stage.label}
                  </span>
                </div>

                {/* Status pipeline selector */}
                <div className="p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">Update Status</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {STAGES.map((s, i) => {
                      const isActive = s.key === o.status;
                      const isPast   = i < currentIdx;
                      return (
                        <button key={s.key} onClick={() => setStatus(o.id, s.key)}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-xs transition ${
                            isActive  ? `${s.color} scale-105 shadow-lg`
                            : isPast  ? "border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-700/50"
                            : "border-slate-200/50 text-slate-500 hover:border-slate-300 hover:text-slate-600"
                          }`}>
                          <span className="text-base">{s.icon}</span>
                          <span className="leading-tight font-medium">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Product tab */}
      {tab === "upload" && (
        <SharedProductForm 
          userStore={userStore} 
          onSuccess={async (trnum) => {
            await loadMyProducts();
            // Optional: short delay to show success message before switching
            setTimeout(() => setTab("products"), 2000);
          }} 
        />
      )}

      {/* My Products tab */}
      {tab === "products" && (
        <div className="space-y-3">
          {myProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-10 text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-slate-600 font-medium">No products uploaded yet</p>
              <p className="text-slate-500 text-sm mt-1">Use the "Add Product" tab to list your first item</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-3 border-b border-slate-200/60 bg-slate-50/50 px-5 py-3 text-xs uppercase tracking-widest text-slate-500">
                <span>Trnum</span><span>Product</span><span>Category</span>
                <span className="text-right">Price</span><span className="text-center">Stock</span><span>Added</span>
              </div>
              {myProducts.map(p => (
                <div key={p.id} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] items-center gap-3 border-b border-slate-200/40 last:border-0 px-5 py-3">
                  <span className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] font-mono font-semibold text-orange-500 truncate">
                    {p.trnum}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    {p.image && <img src={p.image} alt={p.name} className="h-8 w-8 rounded-lg object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 truncate">{p.description.slice(0,40)}{p.description.length > 40 ? '…' : ''}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{p.category}</span>
                  <span className="text-sm font-semibold text-orange-500 text-right">${parseFloat(p.price).toFixed(2)}</span>
                  <span className={`text-center text-xs font-semibold ${p.in_stock ? 'text-orange-500' : 'text-slate-500'}`}>
                    {p.in_stock ? p.stock_count : 'Out'}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* AR Models tab */}
      {tab === "ar_models" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-6 space-y-2">
            <h2 className="text-xl font-bold text-sky-400">🕶️ AR/VR Menu Experiences</h2>
            <p className="text-sm text-slate-600">
              The platform admin has granted your store access to use the following 3D AR models. 
              You can scan the QR code to view them globally in your physical space, or print the QR codes for your tables!
            </p>
          </div>

          {arModels.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-10 text-center">
              <p className="text-xl">📭</p>
              <p className="mt-2 text-slate-500">No AR Models granted to your store yet.</p>
              <p className="text-sm text-slate-500 mt-1">Contact the administrator to request 3D models.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {arModels.map(m => {
                const globalUrl = hostStr ? `${hostStr}/ar/${m.id}` : "";
                return (
                  <div key={m.id} className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 space-y-4 flex flex-col items-center text-center">
                    <h3 className="font-bold text-lg text-slate-900">{m.name}</h3>
                    <div className="bg-white p-3 rounded-xl inline-block shadow-lg">
                      {globalUrl ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(globalUrl)}`}
                          alt="AR QR"
                          className="h-32 w-32 object-contain"
                        />
                      ) : (
                        <div className="h-32 w-32 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-500">Loading...</div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Added: {new Date(m.granted_at).toLocaleDateString()}</p>
                    <a href={globalUrl} target="_blank" rel="noreferrer"
                      className="mt-auto w-full rounded-xl bg-sky-500 hover:bg-sky-400 py-2 text-sm font-bold text-white transition block">
                      Test Global Viewer
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Market tab */}
      {tab === "market" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-6 flex-1">
              <h2 className="text-xl font-bold text-violet-400">🏪 B2B Vendor Market</h2>
              <p className="text-sm text-slate-600">
                Purchase inventory or equipment directly from Baazaarse Admin. 
                These products are exclusively for vendors.
              </p>
            </div>
          </div>

          {/* 3D Billboard / Hero Section in Dashboard */}
          {marketProducts.some(p => p.name.toLowerCase().includes("bill board") || p.name.toLowerCase().includes("billboard")) && (
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl group">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-transparent pointer-events-none" />
              
              {marketProducts.filter(p => p.name.toLowerCase().includes("bill board") || p.name.toLowerCase().includes("billboard")).map(p => (
                <div key={p.id} className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
                  <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-[10px] font-bold text-violet-300 uppercase tracking-widest">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                      </span>
                      Admin Choice
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {p.name}
                    </h2>
                    <p className="text-sm text-slate-400 max-w-xl leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Wholesale Price</span>
                        <span className="text-2xl font-black text-orange-500">{asCurrency(parseFloat(p.price))}</span>
                      </div>
                      <a href="/market" className="rounded-full bg-white px-6 py-2.5 text-xs font-black text-slate-900 hover:bg-violet-400 hover:text-white transition-all transform hover:scale-105 shadow-lg">
                        ADVERTISE NOW
                      </a>
                    </div>
                  </div>
                  
                  <div className="relative w-24 md:w-40 aspect-square">
                    <div className="absolute inset-0 bg-violet-500/20 blur-[40px] rounded-full" />
                    {p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="relative z-10 w-full h-full object-contain rounded-2xl transform rotate-3 group-hover:rotate-0 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="relative z-10 w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-slate-700">
                        🏢
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {marketProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-10 text-center">
              <p className="text-xl">🏪</p>
              <p className="mt-2 text-slate-500">No market products available yet.</p>
              <p className="text-sm text-slate-500 mt-1">Admin listed wholesale products will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {marketProducts.map(p => (
                <div key={p.id} className="rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden flex flex-col group">
                  <div className="relative h-48 bg-slate-100">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">🏢</div>
                    )}
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-900 shadow-sm">
                      {p.category}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 gap-2">
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <div>
                        <p className="text-[10px] uppercase text-slate-400 font-bold">Wholesale Price</p>
                        <p className="text-lg font-black text-orange-500">{asCurrency(parseFloat(p.price))}</p>
                      </div>
                      <a href="/market" className="rounded-full bg-violet-500 px-4 py-2 text-xs font-bold text-white hover:bg-violet-400 transition transform hover:scale-105">
                        VIEW MARKET
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
