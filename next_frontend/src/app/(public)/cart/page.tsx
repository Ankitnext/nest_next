"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCart, removeFromCart, placeOrder } from "@/lib/shop-api";
import { asCurrency } from "@/lib/format";
import type { CartItem } from "@/lib/shop-api";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>("");
  const router = useRouter();

  async function load() {
    try {
      setItems(await getCart());
    } catch {
      setFeedback("Could not load cart. Please log in.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(productId: number) {
    await removeFromCart(productId).catch(() => null);
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Your Cart</h1>
        {items.length > 0 && (
          <span className="rounded-full bg-orange-500/15 px-3 py-1 text-sm text-orange-500">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {feedback && (
        <p className="rounded-xl bg-orange-600/10 px-4 py-3 text-sm text-orange-500 border border-orange-600/20">
          {feedback}
          {feedback.includes("Orders") && (
            <Link href="/orders" className="ml-2 underline hover:text-orange-400">Go to Orders →</Link>
          )}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading cart…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-10 text-center space-y-3">
          <p className="text-slate-600 text-lg">Your cart is empty.</p>
          <Link href="/shop" className="inline-block rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 sm:flex-row sm:items-center"
              >
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="h-28 w-full rounded-xl object-cover sm:w-32"
                />
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-semibold text-slate-900">{item.product_name}</h2>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                  <p className="text-sm font-semibold text-orange-500">
                    {asCurrency(Number(item.price) * item.quantity)}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:items-end w-full sm:w-auto">
                  <Link
                    href={`/product/${item.product_id}`}
                    className="w-full sm:w-auto text-center rounded-full bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-700 hover:text-white transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="w-full sm:w-auto text-center rounded-full border border-rose-500/50 px-5 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between bg-white/80 border border-slate-200 p-5 rounded-2xl gap-4">
            <div>
              <p className="text-sm text-slate-500">Cart Subtotal</p>
              <p className="text-2xl font-bold text-slate-900">{asCurrency(subtotal)}</p>
            </div>
            <Link
              href="/checkout"
              className="w-full sm:w-auto rounded-full bg-orange-500 px-8 py-3.5 text-center text-sm font-bold text-white hover:bg-orange-500 transition shadow-lg shadow-orange-600/20"
            >
              Proceed to Pay
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
