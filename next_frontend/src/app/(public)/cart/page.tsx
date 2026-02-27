import { fetchProducts } from "@/lib/api";
import { asCurrency } from "@/lib/format";

const quantityMap: Record<number, number> = {
  1: 1,
  2: 2,
  3: 1,
  4: 1,
};

export default async function CartPage() {
  const products = (await fetchProducts()).slice(0, 4);
  const cartItems = products.map((product) => ({
    ...product,
    quantity: quantityMap[product.id] ?? 1,
  }));

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 300 ? 0 : 14.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-100">Your Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:flex-row sm:items-center"
            >
              <img src={item.image} alt={item.name} className="h-24 w-full rounded-xl object-cover sm:w-28" />
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-100">{item.name}</h2>
                <p className="text-sm text-slate-300">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-emerald-300">
                {asCurrency(item.price * item.quantity)}
              </p>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <h2 className="text-lg font-semibold text-white">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{asCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : asCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{asCurrency(tax)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-700 pt-3 text-base font-semibold text-slate-100">
              <span>Total</span>
              <span>{asCurrency(total)}</span>
            </div>
          </div>
          <button className="mt-5 w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300">
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </section>
  );
}

