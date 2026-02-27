import Link from "next/link";
import { asCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="grid-halo overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/85 transition hover:-translate-y-1 hover:border-emerald-400/60">
      <Link href={`/product/${product.id}`}>
        <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{product.category}</p>
        <Link href={`/product/${product.id}`} className="line-clamp-1 text-base font-semibold text-slate-100">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-300">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              {asCurrency(product.price, product.currency)}
            </p>
            <p className="text-xs text-slate-400 line-through">
              {asCurrency(product.oldPrice, product.currency)}
            </p>
          </div>
          <span className={product.inStock ? "text-xs text-emerald-300" : "text-xs text-rose-300"}>
            {product.inStock ? `${product.stockCount} left` : "Out of stock"}
          </span>
        </div>
      </div>
    </article>
  );
}

