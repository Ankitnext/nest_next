"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Always uses correct API based on current browser location
function getApi() {
  if (typeof window !== "undefined" && (window.location.hostname.includes("baazaarse"))) {
    return "https://baazaarse.online/api";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
}

function getToken() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return m ? m[1] : "";
}

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Grocery", "General", "Software", "Utensils"];

interface FormState {
  name: string; desc: string; price: string; oldPrice: string;
  category: string; stock: string; image: string;
}
const EMPTY: FormState = { name: "", desc: "", price: "", oldPrice: "", category: "General", stock: "", image: "" };

export default function StoreAddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [msg,  setMsg]  = useState("");
  const [err,  setErr]  = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${getApi()}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Upload failed");
      setForm(p => ({ ...p, image: d.url }));
    } catch (ex: any) {
      setErr(ex.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setErr(""); setSaving(true);
    try {
      const res = await fetch(`${getApi()}/vendor/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name:        form.name.trim(),
          description: form.desc.trim(),
          price:       parseFloat(form.price),
          oldPrice:    form.oldPrice ? parseFloat(form.oldPrice) : undefined,
          category:    form.category || "General",
          image:       form.image || undefined,
          stockCount:  form.stock ? parseInt(form.stock) : 0,
        }),
      });
      const d = await res.json() as { success?: boolean; trnum?: string; message?: string };
      if (!res.ok) { setErr(d.message ?? "Failed to add product."); return; }
      setMsg(`✅ Product added! Tracking: ${d.trnum}`);
      setForm(EMPTY);
      setTimeout(() => router.push("/store/manage-product"), 1500);
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Add New Product</h2>
        <p className="text-sm text-slate-500 mt-0.5">Fill in the details to list a product in your store.</p>
      </div>

      <form onSubmit={submit} className="max-w-2xl rounded-2xl border border-slate-200 bg-white/80 p-6 space-y-5">
        {msg && <p className="rounded-xl bg-orange-500/10 px-4 py-3 text-sm text-orange-600 border border-orange-500/20">{msg}</p>}
        {err && <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-500 border border-rose-500/20">{err}</p>}

        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Product Name *</span>
            <input required value={form.name} onChange={set("name")} placeholder="e.g. Wireless Headphones"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 placeholder-slate-400" />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Category *</span>
            <select required value={form.category} onChange={set("category")}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Stock Count</span>
            <input type="number" min="0" value={form.stock} onChange={set("stock")} placeholder="e.g. 50"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Price *</span>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="e.g. 99.99"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Old Price (optional)</span>
            <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={set("oldPrice")} placeholder="e.g. 129.99"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Description *</span>
          <textarea required rows={3} value={form.desc} onChange={set("desc")} placeholder="Short product description…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400 resize-none" />
        </label>

        <label className="block space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Product Image</span>
            {uploading && <span className="text-xs font-semibold text-sky-500 animate-pulse">Uploading…</span>}
          </div>
          <input type="file" accept="image/*" onChange={uploadImage} disabled={uploading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-600 hover:file:bg-orange-500/20" />
          {form.image && (
            <img src={form.image} alt="preview"
              className="mt-2 h-28 w-full rounded-lg object-cover border border-slate-200"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </label>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving || uploading}
            className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? "Saving…" : "➕ Publish Product"}
          </button>
          <button type="button" onClick={() => router.push("/store/manage-product")}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            View Products
          </button>
        </div>
      </form>
    </section>
  );
}
