"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getVendorSettings, updateVendorSettings, type VendorSettings as VSType } from "@/lib/shop-api";

export default function VendorSettings() {
  const { role, token } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState<VSType>({
    policy_delivery: "pay_after",
    policy_pickup: "pay_after",
    policy_table: "pay_after",
    policy_queue: "pay_after",
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
      // Optimistically update the badge to 'pending' if they updated verification info
      if (updates.gst_number || updates.aadhar_number || updates.shop_image) {
        setSettings(prev => ({ ...prev, verification_status: 'pending' }));
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading settings...</p>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Store Settings</h1>
        <p className="text-sm text-slate-500">Manage your store preferences and checkout rules.</p>
      </div>

      <div className={`rounded-2xl border p-6 md:p-8 flex items-center justify-between transition-colors ${
        settings.is_open 
          ? "border-orange-600/50 bg-orange-600/10" 
          : "border-red-500/50 bg-red-500/10"
      }`}>
        <div>
          <h2 className="text-lg font-semibold text-white">Store Status: {settings.is_open ? 'Online' : 'Offline'}</h2>
          <p className="text-sm mt-1 text-slate-600 max-w-lg">
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
          <div className="w-14 h-7 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600 shadow-inner"></div>
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 md:p-8 relative">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Policies</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xl">
          Choose the payment policy for each fulfillment method individually.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { key: "policy_delivery", title: "Delivery" },
            { key: "policy_pickup", title: "Pickup" },
            { key: "policy_table", title: "On Table" },
            { key: "policy_queue", title: "In Queue" }
          ].map(opt => (
            <div key={opt.key} className="space-y-3 p-4 rounded-xl border border-slate-200/50 bg-slate-50/30">
              <h3 className="font-semibold text-slate-800">{opt.title} Payment</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={opt.key}
                    value="pay_after"
                    checked={settings[opt.key as keyof VSType] === "pay_after"}
                    onChange={() => handleSaveSettings({ [opt.key]: "pay_after" })}
                    disabled={saving}
                    className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-slate-200 bg-white cursor-pointer"
                  />
                  <span className={`text-sm ${settings[opt.key as keyof VSType] === "pay_after" ? "text-cyan-300 font-semibold" : "text-slate-600"}`}>Pay After</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={opt.key}
                    value="pay_before"
                    checked={settings[opt.key as keyof VSType] === "pay_before"}
                    onChange={() => handleSaveSettings({ [opt.key]: "pay_before" })}
                    disabled={saving}
                    className="h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-slate-200 bg-white cursor-pointer"
                  />
                  <span className={`text-sm ${settings[opt.key as keyof VSType] === "pay_before" ? "text-cyan-300 font-semibold" : "text-slate-600"}`}>Pay Before</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 md:p-8 relative">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Supported Fulfillment Methods</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xl">
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
                  ? "border-orange-600/50 bg-orange-600/10"
                  : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
              }`}
            >
              <div className="flex h-5 items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={Boolean(settings[opt.key as keyof VSType])}
                  onChange={(e) => handleSaveSettings({ [opt.key]: e.target.checked })}
                  disabled={saving}
                  className="form-checkbox h-4 w-4 text-orange-500 focus:ring-orange-500 border-slate-200 bg-white rounded cursor-pointer"
                />
              </div>
              <div>
                <p className={`font-semibold ${settings[opt.key as keyof VSType] ? "text-orange-500" : "text-slate-800"}`}>
                  {opt.title}
                </p>
                <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {msg && (
          <div className="mt-6 rounded-lg bg-orange-600/10 px-4 py-2 border border-orange-600/20 text-sm font-semibold text-orange-500 animate-in fade-in zoom-in duration-300">
            {msg}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 md:p-8 relative">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Physical Store Address</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-xl">
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
            className="w-full rounded-xl border border-slate-200 bg-white/50 p-4 text-sm text-cyan-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Verification Data Section */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/40 p-6 md:p-8 relative mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Verification Details</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${settings.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
              settings.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
              settings.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-slate-200 text-slate-600'}`
          }>
            {settings.verification_status || 'Unverified'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-6 max-w-xl">
          Enter your formal business and identity details to get your store verified. Updating these fields will submit them for admin review.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
            <input
              type="text"
              placeholder="E.g. 29ABCDE1234F1Z5"
              value={settings.gst_number || ""}
              onChange={(e) => setSettings({ ...settings, gst_number: e.target.value })}
              onBlur={(e) => handleSaveSettings({ gst_number: e.target.value })}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Number</label>
            <input
              type="text"
              placeholder="12-digit Aadhar (e.g. 1234 5678 9012)"
              value={settings.aadhar_number || ""}
              onChange={(e) => setSettings({ ...settings, aadhar_number: e.target.value })}
              onBlur={(e) => handleSaveSettings({ aadhar_number: e.target.value })}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shop Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/shop.jpg"
              value={settings.shop_image || ""}
              onChange={(e) => setSettings({ ...settings, shop_image: e.target.value })}
              onBlur={(e) => handleSaveSettings({ shop_image: e.target.value })}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white/50 p-3 text-sm text-cyan-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
