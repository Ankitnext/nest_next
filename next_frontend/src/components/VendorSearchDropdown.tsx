"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Vendor { id: number; name: string; store: string; }

interface Props {
  vendors: Vendor[];
  activeVendor?: string;
  onSelect?: (store: string) => void;
}

export function VendorSearchDropdown({ vendors, activeVendor, onSelect }: Props) {
  const router      = useRouter();
  const params      = useSearchParams();
  const [query,     setQuery]     = useState(activeVendor ?? "");
  const [open,      setOpen]      = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = vendors.filter(
    v =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.store.toLowerCase().includes(query.toLowerCase()),
  );

  function select(store: string) {
    setQuery(store);
    setOpen(false);

    if (onSelect) {
      onSelect(store);
      return;
    }

    const existing = params.get("category");
    const url = new URLSearchParams();
    if (existing) url.set("category", existing);
    url.set("vendor", store);
    router.push(`/shop?${url.toString()}`);
  }

  function clearFilter() {
    setQuery("");
    setOpen(false);
    const existing = params.get("category");
    router.push(existing ? `/shop?category=${existing}` : "/shop");
  }

  const activeVendorObj = vendors.find(v => v.store === activeVendor);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
      <p className="mb-3 text-xs uppercase tracking-widest text-orange-500 font-semibold">
        Filter by Shop
      </p>

      <div ref={containerRef} className="relative">
        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={query}
              onFocus={() => setOpen(true)}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              placeholder="Search shop…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-500 outline-none transition focus:border-orange-500 focus:bg-slate-50"
            />
            {/* Clear X */}
            {query && (
              <button
                onClick={clearFilter}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-rose-400 transition text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Active badge */}
          {activeVendorObj && (
            <div className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-[10px] font-bold text-orange-500">
                {activeVendorObj.store[0]?.toUpperCase()}
              </span>
              <span className="text-orange-500 font-medium">{activeVendorObj.name}</span>
              <div role="button" onClick={clearFilter} className="text-orange-500/60 hover:text-rose-400 ml-1 text-xs cursor-pointer">✕</div>
            </div>
          )}
        </div>

        {/* Dropdown list */}
        {open && (
          <div className="absolute z-50 mt-2 w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">No registered shops match.</p>
            ) : (
              <ul className="max-h-56 overflow-y-auto divide-y divide-slate-200">
                {filtered.map(v => (
                  <li key={v.id}>
                    <div
                      role="button"
                      onClick={() => select(v.store)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition cursor-pointer hover:bg-slate-50 ${
                        activeVendor === v.store ? "bg-orange-500/10 text-orange-500" : "text-slate-800"
                      }`}
                    >
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-500">
                        {v.store[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium">{v.name}</p>
                        <p className="text-xs text-slate-500">🍽️ {v.store}</p>
                      </div>
                      {activeVendor === v.store && (
                        <span className="ml-auto text-orange-500 text-xs font-semibold">✓ Active</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      {vendors.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">No shops have registered yet.</p>
      )}
    </div>
  );
}
