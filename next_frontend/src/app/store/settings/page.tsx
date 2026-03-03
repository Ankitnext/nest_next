"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getVendorSettings, updateVendorSettings, type VendorSettings as VSType } from "@/lib/shop-api";

export default function VendorSettings() {
  const { role, token } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<VSType>({
    payment_policy: "pay_after",
    allow_delivery: true,
    allow_pickup: true,
    allow_table: true,
    allow_queue: true,
    is_open: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    if (role !== "vendor") {
      router.push("/");
      return;
    }

    async function loadSettings() {
      try {
        const data = await getVendorSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [role, token, router]);

  async function handleSaveSettings(updates: Partial<VSType>) {
    setSaving(true);
    setMsg("");
    try {
      await updateVendorSettings(updates);
      setSettings(prev => ({ ...prev, ...updates }));
      setMsg("Settings saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading settings...</p>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Store Settings</h1>
        <p className="text-sm text-slate-400">Manage your store preferences and checkout rules.</p>
      </div>

      <div className={`rounded-2xl border p-6 md:p-8 flex items-center justify-between transition-colors ${
        settings.is_open 
          ? "border-emerald-500/50 bg-emerald-500/10" 
          : "border-red-500/50 bg-red-500/10"
      }`}>
        <div>
          <h2 className="text-lg font-semibold text-white">Store Status: {settings.is_open ? 'Online' : 'Offline'}</h2>
          <p className="text-sm mt-1 text-slate-300 max-w-lg">
            {settings.is_open 
              ? "Your store is open and your products are visible to customers." 
              : "Your store is currently closed. Customers cannot see or order your products."}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={settings.is_open}
            onChange={(e) => handleSaveSettings({ is_open: e.target.checked })}
            disabled={saving}
          />
          <div className="w-14 h-7 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 md:p-8 relative">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Payment Policy</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-xl">
          Choose how users interact with your store during checkout. You can require payment upfront before an order is generated, or you can allow immediate order creation and accept payment later.
        </p>

        <div className="space-y-4">
          <label
            className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
              settings.payment_policy === "pay_after"
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
            }`}
          >
            <div className="flex h-5 items-center mt-0.5">
              <input
                type="radio"
                name="payment_policy"
                value="pay_after"
                checked={settings.payment_policy === "pay_after"}
                onChange={() => handleSaveSettings({ payment_policy: "pay_after" })}
                disabled={saving}
                className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-slate-600 bg-slate-900 cursor-pointer"
              />
            </div>
            <div>
              <p className={`font-semibold ${settings.payment_policy === "pay_after" ? "text-cyan-300" : "text-slate-200"}`}>
                Pay After (Default)
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Customers can place orders immediately. The order number is generated instantly and the payment status remains pending.
              </p>
            </div>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
              settings.payment_policy === "pay_before"
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
            }`}
          >
            <div className="flex h-5 items-center mt-0.5">
              <input
                type="radio"
                name="payment_policy"
                value="pay_before"
                checked={settings.payment_policy === "pay_before"}
                onChange={() => handleSaveSettings({ payment_policy: "pay_before" })}
                disabled={saving}
                className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-slate-600 bg-slate-900 cursor-pointer"
              />
            </div>
            <div>
              <p className={`font-semibold ${settings.payment_policy === "pay_before" ? "text-cyan-300" : "text-slate-200"}`}>
                Pay Before
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Customers must pay upfront. The order is placed in a holding state, and the final order number is not generated until payment is confirmed.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 md:p-8 relative">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Supported Fulfillment Methods</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-xl">
          Restrict the delivery logic for your store. When disabled, users will not be able to choose these options during checkout. If a user's cart contains items from multiple stores, only the officially supported options overlapping across all stores will be available.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "allow_delivery", title: "Delivery", desc: "Require a shipping address" },
            { key: "allow_pickup", title: "Pickup", desc: "Customers collect at your location" },
            { key: "allow_table", title: "On Table", desc: "Serve directly to seated customers" },
            { key: "allow_queue", title: "In Queue", desc: "Customers wait in line for the item" }
          ].map(opt => (
            <label
              key={opt.key}
              className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                settings[opt.key as keyof VSType]
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
              }`}
            >
              <div className="flex h-5 items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={Boolean(settings[opt.key as keyof VSType])}
                  onChange={(e) => handleSaveSettings({ [opt.key]: e.target.checked })}
                  disabled={saving}
                  className="form-checkbox h-4 w-4 text-emerald-400 focus:ring-emerald-400 border-slate-600 bg-slate-900 rounded cursor-pointer"
                />
              </div>
              <div>
                <p className={`font-semibold ${settings[opt.key as keyof VSType] ? "text-emerald-300" : "text-slate-200"}`}>
                  {opt.title}
                </p>
                <p className="text-sm text-slate-400 mt-1">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {msg && (
          <div className="mt-6 rounded-lg bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 text-sm font-semibold text-emerald-300 animate-in fade-in zoom-in duration-300">
            {msg}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 md:p-8 relative">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Physical Store Address</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-xl">
          Enter the full physical address of your store. We use this to calculate delivery distances and fees dynamically when customers place orders. Please be as precise as possible (e.g., "123 Market St, City, State 12345").
        </p>
        <div className="space-y-4">
          <textarea
            rows={3}
            placeholder="E.g., Connaught Place, New Delhi, 110001"
            value={settings.store_address || ""}
            onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
            onBlur={(e) => {
              // Auto-save on blur
              handleSaveSettings({ store_address: e.target.value });
            }}
            disabled={saving}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/50 p-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
