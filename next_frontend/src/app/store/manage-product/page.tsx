import { fetchProductsByStore } from "@/lib/api";
import { asCurrency } from "@/lib/format";

export default async function StoreManageProductsPage() {
  const products = await fetchProductsByStore("pixel-hub");

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Manage Products</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-800">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-slate-200 text-slate-600">
                <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                <td className="px-4 py-3">{asCurrency(product.price, product.currency)}</td>
                <td className="px-4 py-3">{product.stockCount}</td>
                <td className="px-4 py-3">{product.rating.toFixed(1)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="px-4 py-5 text-slate-600" colSpan={4}>
                  No products in this store yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

