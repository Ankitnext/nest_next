"use client";

import { useState } from "react";
import { getApiBaseUrl } from "@/lib/config";

const API = getApiBaseUrl();
const tok = () => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)novacart_token=([^;]+)/);
  return m ? m[1] : "";
};
const authH = () => ({ Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" });

const CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Grocery", "General", "Software", "Utensils"];

interface ProductFormProps {
  onSuccess: (trnum: string) => void;
  userStore: string | null;
}

interface FormState {
  name: string;
  desc: string;
  price: string;
  oldPrice: string;
  category: string;
  stock: string;
  image: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  desc: "",
  price: "",
  oldPrice: "",
  category: "General",
  stock: "",
  image: "",
};

export function ProductForm({ onSuccess, userStore }: ProductFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleChange = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    setErr("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tok()}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      setErr(err.message || "Image upload failed");
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);

    try {
      const res = await fetch(`${API}/vendor/products`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.desc.trim(),
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
          category: form.category || "General",
          image: form.image || undefined,
          stockCount: form.stock ? parseInt(form.stock) : 0,
        }),
      });

      const data = await res.json() as { success?: boolean; trnum?: string; message?: string };
      if (!res.ok) {
        setErr(data.message ?? "Upload failed.");
        return;
      }

      setMsg(`✅ Product saved! Tracking number: ${data.trnum}`);
      setForm(EMPTY_FORM);
      if (onSuccess) onSuccess(data.trnum || "");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto rounded-2xl border border-slate-200/60 bg-white/60 overflow-hidden shadow-sm">
      <div className="border-b border-slate-200/60 px-5 py-4 bg-slate-50/30">
        <h2 className="font-semibold text-slate-900">Add New Product</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Product will be listed under store: <span className="text-orange-500">{userStore ?? "your-store"}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {msg && (
          <p className="rounded-xl bg-orange-600/10 px-4 py-3 text-sm text-orange-500 border border-orange-600/20 animate-in fade-in slide-in-from-top-1">
            {msg}
          </p>
        )}
        {err && (
          <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 border border-rose-500/20">
            {err}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1 col-span-2">
            <span className="text-xs uppercase tracking-wider text-slate-500">Product Name</span>
            <input
              required
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g. AeroPods Max"
              className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500">Category</span>
            <select
              value={form.category}
              onChange={handleChange("category")}
              className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500">Stock Count</span>
            <input
              type="number"
              value={form.stock}
              onChange={handleChange("stock")}
              placeholder="50"
              className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500">Price (USD)</span>
            <input
              required
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange("price")}
              placeholder="99.99"
              className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-500">Old Price (USD)</span>
            <input
              type="number"
              step="0.01"
              value={form.oldPrice}
              onChange={handleChange("oldPrice")}
              placeholder="129.99"
              className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wider text-slate-500">Description</span>
          <textarea
            required
            value={form.desc}
            onChange={handleChange("desc")}
            placeholder="Short product description…"
            rows={3}
            className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 placeholder-slate-400 resize-none"
          />
        </label>

        <label className="block space-y-1">
          <div className="flex justify-between items-end">
            <span className="text-xs uppercase tracking-wider text-slate-500">Product Image</span>
            {uploadingImg && (
              <span className="text-xs font-semibold text-sky-500 animate-pulse">
                Uploading...
              </span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImg}
            className="w-full rounded-lg border border-slate-200/60 bg-white/60 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-500/10 file:text-orange-600 hover:file:bg-orange-500/20"
          />
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-2 h-32 w-full rounded-xl object-cover border border-slate-200 shadow-inner"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </label>

        <button
          type="submit"
          disabled={saving || uploadingImg}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 active:scale-[0.98]"
        >
          {saving ? "Saving…" : "Save Product to Store"}
        </button>
      </form>
    </div>
  );
}
