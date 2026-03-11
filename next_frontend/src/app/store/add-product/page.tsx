"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Always uses correct API based on current browser location
function getApi() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Cover the main domains and the IP directly for production
    if (host.includes("baazaarse") || host === "82.112.236.1") {
      return "https://baazaarse.online/api";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
}

function getToken() {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return m ? m[1] : "";
}

type Category = { id: number; name: string };

interface FormState {
  name: string; desc: string; price: string; oldPrice: string;
  category: string; stock: string; image: string;
}
const EMPTY: FormState = { name: "", desc: "", price: "", oldPrice: "", category: "", stock: "", image: "" };

export default function StoreAddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [msg,  setMsg]  = useState("");
  const [err,  setErr]  = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Custom Category State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories(selectNewCategory: string = "") {
    try {
      setLoadingCats(true);
      const res = await fetch(`${getApi()}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (selectNewCategory) {
          setForm(p => ({ ...p, category: selectNewCategory }));
        } else if (data.length > 0 && !form.category) {
          setForm(p => ({ ...p, category: data[0].name }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch categories");
    } finally {
      setLoadingCats(false);
    }
  }

  const setField = (k: keyof FormState) =>
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

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    setErr("");
    try {
      const res = await fetch(`${getApi()}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to add category");
      
      setNewCategoryName("");
      setIsAddingNewCategory(false);
      await fetchCategories(d.name); // Refresh list and auto-select the new one
    } catch (ex: any) {
      setErr(ex.message || "Failed to add category");
    } finally {
      setSavingCategory(false);
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
      setForm(p => ({ ...EMPTY, category: categories.length > 0 ? categories[0].name : "General" }));
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
            <input required value={form.name} onChange={setField("name")} placeholder="e.g. Wireless Headphones"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 placeholder-slate-400" />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Category *</span>
            
            {!isAddingNewCategory ? (
              <select required value={form.category} disabled={loadingCats} onChange={(e) => {
                  if (e.target.value === "__ADD_NEW__") {
                    setIsAddingNewCategory(true);
                  } else {
                    setField("category")(e);
                  }
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400">
                {loadingCats ? (
                  <option value="">Loading categories...</option>
                ) : (
                  <>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    <option value="__ADD_NEW__" className="font-bold text-orange-600 border-t mt-1">➕ Add New Category...</option>
                  </>
                )}
              </select>
            ) : (
              <div className="flex gap-2">
                <input 
                  autoFocus
                  placeholder="New Category Name" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" 
                />
                <button 
                  type="button" 
                  onClick={handleAddCategory}
                  disabled={savingCategory || !newCategoryName.trim()}
                  className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-200 transition disabled:opacity-50">
                  {savingCategory ? ".." : "Save"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingNewCategory(false)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition">
                  Cancel
                </button>
              </div>
            )}
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Stock Count</span>
            <input type="number" min="0" value={form.stock} onChange={setField("stock")} placeholder="e.g. 50"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Price *</span>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={setField("price")} placeholder="e.g. 99.99"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" />
          </label>

          <label className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Old Price (optional)</span>
            <input type="number" min="0" step="0.01" value={form.oldPrice} onChange={setField("oldPrice")} placeholder="e.g. 129.99"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-400 placeholder-slate-400" />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Description *</span>
          <textarea required rows={3} value={form.desc} onChange={setField("desc")} placeholder="Short product description…"
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
