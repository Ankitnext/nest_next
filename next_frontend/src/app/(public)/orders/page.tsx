"use client";

import { useEffect, useState } from "react";
import { getOrders, markReceived, payForOrder, createRazorpayOrder } from "@/lib/shop-api";
import { asCurrency } from "@/lib/format";
import type { Order } from "@/lib/shop-api";

// 7-stage order pipeline
const STAGES: { key: string; label: string; icon: string }[] = [
  { key: "pending_payment", label: "Awaiting Payment", icon: "💳" },
  { key: "pending",     label: "Order Placed",         icon: "🛒" },
  { key: "confirmed",   label: "Received by Supplier", icon: "📦" },
  { key: "packing",     label: "Packing",              icon: "🏗️"  },
  { key: "ready",       label: "Ready to Deliver",     icon: "✅" },
  { key: "in_transit",  label: "Out for Delivery",     icon: "🚚" },
  { key: "delivered",   label: "Delivered",            icon: "🎉" },
];

function stageIndex(status: string) {
  return STAGES.findIndex((s) => s.key === status);
}

function StatusStepper({ status }: { status: string }) {
  const current = stageIndex(status);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-0">
      {STAGES.map((stage, i) => {
        const done   = i <= current;
        const active = i === current;
        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                  done
                    ? active
                      ? "bg-orange-500 text-white ring-2 ring-orange-500/50 scale-110"
                      : "bg-emerald-600 text-white"
                    : "bg-slate-700 text-slate-500"
                }`}
              >
                {stage.icon}
              </div>
              <p className={`mt-1 max-w-[64px] text-center text-[9px] leading-tight ${
                active ? "text-orange-500 font-semibold" : done ? "text-slate-600" : "text-slate-500"
              }`}>
                {stage.label}
              </p>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`mb-4 h-0.5 w-6 flex-shrink-0 ${i < current ? "bg-emerald-600" : "bg-slate-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Shows when the order can be received by the buyer */
function canMarkReceived(status: string) {
  return ["ready", "in_transit", "confirmed", "packing"].includes(status);
}

export default function OrdersPage() {
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [receiving, setReceiving] = useState<number | null>(null);
  const [paying,    setPaying]    = useState<number | null>(null);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setError("Could not load orders. Please log in."))
      .finally(() => setLoading(false));
  }, []);

  async function handleReceived(order: Order) {
    setReceiving(order.id);
    setError(""); setSuccess("");
    try {
      const updated = await markReceived(order.id);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSuccess(`"${order.product_name}" marked as received! 🎉`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setReceiving(null);
    }
  }

  async function handlePayment(orderId: number) {
    setPaying(orderId);
    setError(""); setSuccess("");
    try {
      const orderData = await createRazorpayOrder(orderId);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Baazaarse Modern Commerce",
        description: `Payment for Order #${orderId}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          setSuccess("Verifying your payment...");
          try {
            const updated = await payForOrder(
              orderId, 
              response.razorpay_payment_id, 
              response.razorpay_order_id, 
              response.razorpay_signature
            );
            getOrders().then(setOrders).finally(() => setLoading(false));
            setSuccess(`Payment successful! Order ${updated.order_number} has been generated.`);
          } catch (verifyErr) {
            setError(verifyErr instanceof Error ? verifyErr.message : "Payment verification failed.");
          }
        },
        theme: {
          color: "#06b6d4" // Cyan-500 matching the UI
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment failed");
      });
      rzp.open();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize payment.");
    } finally {
      setPaying(null);
    }
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Order History</h1>

      {error   && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 border border-rose-500/20">{error}</p>}
      {success && <p className="rounded-xl bg-orange-600/10 px-4 py-3 text-sm text-orange-500 border border-orange-600/20">{success}</p>}

      {loading ? (
        <p className="text-slate-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-10 text-center">
          <p className="text-slate-600">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered  = order.status === "delivered";
            const isPendingPay = order.status === "pending_payment";
            const isReceiving  = receiving === order.id;
            const isPaying     = paying === order.id;
            const showReceive  = canMarkReceived(order.status);
            const stageLabel   = STAGES.find((s) => s.key === order.status)?.label ?? order.status;

            return (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white/80 overflow-hidden"
              >
                {/* Order Number Banner */}
                <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/60 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">🧾 Order</span>
                    <span className="font-mono text-sm font-bold tracking-wider text-amber-300">
                      {order.order_number || <span className="text-rose-400 italic">AWAITING PAYMENT</span>}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(order.ordered_at).toLocaleDateString()}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={order.product_image}
                      alt={order.product_name}
                      className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{order.product_name}</p>
                      <p className="text-xs text-slate-500">
                        Qty: {order.quantity} · {asCurrency(Number(order.price) * order.quantity)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Ordered: {new Date(order.ordered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    {/* Status badge */}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isDelivered
                        ? "bg-orange-500/15 text-orange-500"
                        : "bg-amber-400/15 text-amber-300"
                    }`}>
                      {STAGES.find((s) => s.key === order.status)?.icon} {stageLabel}
                    </span>

                    {/* ✅ Mark as Received button */}
                    {!isDelivered && showReceive && (
                      <button
                        onClick={() => handleReceived(order)}
                        disabled={isReceiving}
                        className="flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                      >
                        {isReceiving ? (
                          <span className="animate-pulse">Confirming…</span>
                        ) : (
                          <>✅ Mark as Received</>
                        )}
                      </button>
                    )}

                    {/* Pay Now Button */}
                    {isPendingPay && (
                      <button
                        onClick={() => handlePayment(order.id)}
                        disabled={isPaying}
                        className="flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-cyan-400 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:pointer-events-none shadow-lg shadow-cyan-500/25"
                      >
                        {isPaying ? (
                          <span className="animate-pulse">Processing...</span>
                        ) : (
                          <>💳 Pay Now & Complete Order</>
                        )}
                      </button>
                    )}

                    {/* Already delivered */}
                    {isDelivered && (
                      <span className="text-xs text-orange-600 font-semibold">🎉 Order complete</span>
                    )}
                  </div>
                </div>

                {/* Delivery note when out for delivery */}
                {order.status === "in_transit" && (
                  <div className="mx-5 mb-4 rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-2.5 flex items-center gap-2">
                    <span className="text-lg">🚚</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-300">Your order is out for delivery!</p>
                      <p className="text-xs text-slate-500">Click <strong>"Mark as Received"</strong> once you receive your package.</p>
                    </div>
                  </div>
                )}

                {/* 6-stage stepper */}
                <div className="px-5 pb-5">
                  <StatusStepper status={order.status} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
