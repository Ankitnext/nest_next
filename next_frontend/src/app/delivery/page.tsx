"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { asCurrency } from "@/lib/format";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const tok = () => { const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/); return m ? m[1] : ""; };
const authH = () => ({ Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" });

interface DeliveryOrder {
  id: number; product_name: string; product_image: string;
  price: number; quantity: number; status: string; ordered_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  in_transit: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  delivered:  "bg-orange-600/20 text-orange-500 border-orange-600/30",
  ready:      "bg-amber-500/20 text-amber-300 border-amber-500/30",
  pending:    "bg-slate-600/20 text-slate-600 border-slate-200/30",
};

export default function DeliveryPage() {
  const { userName } = useAuth();
  const [orders,   setOrders]   = useState<DeliveryOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [msg,      setMsg]      = useState("");

  useEffect(() => {
    fetch(`${API}/delivery/orders`, { headers: authH() })
      .then(r => r.json())
      .then(d => setOrders(Array.isArray(d) ? d as DeliveryOrder[] : []))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: number, status: string) {
    setUpdating(orderId); setMsg("");
    const res = await fetch(`${API}/delivery/orders/${orderId}/status`, {
      method: "PATCH", headers: authH(), body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json() as DeliveryOrder;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      setMsg(status === "delivered" ? "🎉 Marked as delivered!" : "🚚 Status updated to Out for Delivery");
    }
    setUpdating(null);
  }

  const total     = orders.length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const active    = orders.filter(o => o.status === "in_transit").length;
  const pending   = orders.filter(o => o.status === "ready").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-orange-400">Delivery Console</p>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome, <span className="text-orange-300">{userName ?? "Rider"}</span></p>
        </div>
        <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-semibold text-orange-300">
          🛵 Active Rider
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Total Assigned", value: total,     icon: "📦", color: "text-slate-900" },
          { label: "Delivered",      value: delivered,  icon: "✅", color: "text-orange-500" },
          { label: "Out for Delivery", value: active,  icon: "🚚", color: "text-orange-300" },
          { label: "Pending Pickup", value: pending,   icon: "⏳", color: "text-amber-300" },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border border-slate-200/60 bg-white/60 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-slate-500">{kpi.label}</p>
              <span className="text-lg">{kpi.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {msg && <p className="rounded-xl bg-orange-600/10 px-4 py-3 text-sm text-orange-500 border border-orange-600/20">{msg}</p>}

      {/* Orders list */}
      <div>
        <h2 className="text-sm uppercase tracking-widest text-slate-500 mb-3">Assigned Deliveries</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-10 text-center">
            <p className="text-3xl mb-2">🛵</p>
            <p className="text-slate-600 font-medium">No deliveries assigned yet</p>
            <p className="text-slate-500 text-sm mt-1">The admin will assign orders to you soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const color   = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
              const isDone  = order.status === "delivered";
              const isBusy  = updating === order.id;
              return (
                <div key={order.id} className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <img src={order.product_image} alt={order.product_name} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{order.product_name}</p>
                    <p className="text-xs text-slate-500">Qty: {order.quantity} · {asCurrency(Number(order.price) * order.quantity)}</p>
                    <p className="text-xs text-slate-500">{new Date(order.ordered_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${color}`}>
                      {order.status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                    {!isDone && (
                      <div className="flex gap-2">
                        {order.status !== "in_transit" && (
                          <button onClick={() => updateStatus(order.id, "in_transit")} disabled={isBusy}
                            className="rounded-full border border-orange-400/40 px-3 py-1 text-xs text-orange-300 hover:bg-orange-400/10 transition disabled:opacity-50">
                            {isBusy ? "…" : "🚚 Pick Up"}
                          </button>
                        )}
                        <button onClick={() => updateStatus(order.id, "delivered")} disabled={isBusy}
                          className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white hover:bg-orange-500 transition disabled:opacity-50">
                          {isBusy ? "…" : "✅ Delivered"}
                        </button>
                      </div>
                    )}
                    {isDone && <span className="text-xs text-orange-600 font-semibold">🎉 Completed</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
