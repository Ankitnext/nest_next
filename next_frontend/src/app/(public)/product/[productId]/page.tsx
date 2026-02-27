import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductById, fetchProducts } from "@/lib/api";
import { asCurrency } from "@/lib/format";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const parsedId = Number.parseInt(productId, 10);

  if (Number.isNaN(parsedId)) {
    notFound();
  }

  const [product, allProducts] = await Promise.all([
    fetchProductById(parsedId),
    fetchProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const related = allProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

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
            <p className="text-2xl font-bold text-emerald-300">
              {asCurrency(product.price, product.currency)}
            </p>
            <p className="text-sm text-slate-400 line-through">
              {asCurrency(product.oldPrice, product.currency)}
            </p>
          </div>
          <p className={product.inStock ? "text-sm text-emerald-300" : "text-sm text-rose-300"}>
            {product.inStock ? `${product.stockCount} units available` : "Out of stock"}
          </p>
          <div className="flex gap-3">
            <button className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300">
              Add to Cart
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
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

