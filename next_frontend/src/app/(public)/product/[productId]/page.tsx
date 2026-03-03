"use client";

import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { fetchProductById, fetchProducts } from "@/lib/api";
import { addToCart } from "@/lib/shop-api";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ProductCard";
import { asCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default function ProductDetailsPage({ params }: ProductPageProps) {
  const { productId } = use(params);
  const parsedId = Number.parseInt(productId, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [adding, setAdding] = useState(false);
  
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (Number.isNaN(parsedId)) {
      notFound();
      return;
    }
    Promise.all([fetchProductById(parsedId), fetchProducts()]).then(([prod, all]) => {
      if (!prod) { notFound(); return; }
      setProduct(prod);
      setRelated(all.filter((p) => p.category === prod.category && p.id !== prod.id).slice(0, 3));
    });
  }, [parsedId]);

  async function handleAddToCart() {
    if (!product) return;
    if (!isLoggedIn) {
      router.push("/login?redirect=/product/" + product.id);
      return;
    }
    setAdding(true);
    setFeedback(null);
    try {
      await addToCart({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        product_store: (product as Product & { store?: string }).store,
        price: product.price,
        currency: product.currency ?? "USD",
      });
      setFeedback({ type: "success", msg: "Added to cart! 🛒" });
    } catch (err) {
      setFeedback({ type: "error", msg: err instanceof Error ? err.message : "Failed to add" });
    } finally {
      setAdding(false);
    }
  }

  if (!product) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading product…
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 rounded-3xl border border-slate-700 bg-slate-900/80 p-5 md:grid-cols-2 md:p-8">
        <img
          src={product.image}
          alt={product.name}
          className="h-72 w-full rounded-2xl object-cover md:h-full"
        />
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{product.category}</p>
          <h1 className="text-3xl font-semibold text-white">{product.name}</h1>
          <p className="text-slate-300">{product.description}</p>
          <div className="flex items-end gap-3">
            <p className="text-2xl font-bold text-emerald-300">{asCurrency(product.price, product.currency)}</p>
            <p className="text-sm text-slate-400 line-through">{asCurrency(product.oldPrice, product.currency)}</p>
          </div>
          <p className={product.inStock ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>
            {product.inStock ? `${product.stockCount} units available` : "Out of stock"}
          </p>

          {/* Feedback toast */}
          {feedback && (
            <p className={`rounded-lg px-3 py-2 text-sm ${
              feedback.type === "success"
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-rose-500/15 text-rose-300"
            }`}>
              {feedback.msg}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || !product.inStock}
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adding ? "Adding…" : "Add to Cart"}
            </button>
            <Link
              href="/shop"
              className="rounded-full border border-slate-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-100 transition hover:border-emerald-300 hover:text-emerald-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">Related Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      )}
    </section>
  );
}
