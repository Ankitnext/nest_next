import Link from "next/link";
import { asCurrency } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="grid-halo overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 transition hover:-translate-y-1 hover:border-orange-500/60">
      <Link href={`/product/${product.id}`}>
        <img src={product.image} alt={product.name} className="h-44 w-full object-cover" />
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">{product.category}</p>
          <p className="text-xs text-slate-500 font-medium">🍽️ {product.store}</p>
        </div>
        <Link href={`/product/${product.id}`} className="line-clamp-1 text-base font-semibold text-slate-900 mt-1 block hover:text-orange-500 transition">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-sm font-semibold text-orange-500">
              {asCurrency(product.price, product.currency)}
            </p>
            <p className="text-xs text-slate-500 line-through">
              {asCurrency(product.oldPrice, product.currency)}
            </p>
          </div>
          <span className={product.inStock ? "text-xs text-orange-500" : "text-xs text-rose-300"}>
            {product.inStock ? `${product.stockCount} servings` : "Sold out"}
          </span>
        </div>
      </div>
    </article>
  );
}

