"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { PublicNavbar } from "@/components/PublicNavbar";
import { ARModelViewerWrapper } from "@/components/ARModelViewer";
import { VendorSearchDropdown } from "@/components/VendorSearchDropdown";
import Link from "next/link";

declare global { namespace JSX { interface IntrinsicElements { "model-viewer": any; } } }

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface ArModel {
  id: number;
  name: string;
  model_url: string;
  created_at: string;
  access_list: { vendor_store: string; granted_at: string }[];
}

export default function AdminArConsole() {
  const { role, token } = useAuth();
  const router = useRouter();
  
  const [models, setModels] = useState<ArModel[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form forms
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  
  // Grant modal states
  const [showGrant, setShowGrant] = useState<number | null>(null);
  const [grantVendor, setGrantVendor] = useState("");

  const [editingModel, setEditingModel] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  useEffect(() => {
    if (!token) return;
    if (role !== "admin") {
      router.push("/");
      return;
    }
    fetchModels();
    fetchVendors();
  }, [role, token, router]);

  async function fetchModels() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/ar-models`, { headers: authH() });
      if (!res.ok) throw new Error("Failed to fetch models");
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendors() {
    try {
      const res = await fetch(`${API}/admin/registered-vendors`, { headers: authH() });
      if (!res.ok) throw new Error("Failed to fetch vendors");
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
    }
  }

  async function addModel(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await fetch(`${API}/admin/ar-models`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ name, model_url: url })
      });
      if (!res.ok) throw new Error("Add failed");
      setName("");
      setUrl("");
      fetchModels();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function grantAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!showGrant || !grantVendor) return;
    try {
      const res = await fetch(`${API}/admin/ar-models/${showGrant}/grant`, {
        method: "POST",
        headers: authH(),
        body: JSON.stringify({ vendor_store: grantVendor.trim() })
      });
      if (!res.ok) throw new Error("Grant failed");
      setShowGrant(null);
      setGrantVendor("");
      fetchModels();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function revokeAccess(modelId: number, vendorStore: string) {
    try {
      const res = await fetch(`${API}/admin/ar-models/${modelId}/grant/${encodeURIComponent(vendorStore)}`, {
        method: "DELETE",
        headers: authH(),
      });
      if (!res.ok) throw new Error("Failed to revoke access");
      fetchModels();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function deleteModel(modelId: number) {
    try {
      const res = await fetch(`${API}/admin/ar-models/${modelId}`, {
        method: "DELETE",
        headers: authH(),
      });
      if (!res.ok) throw new Error("Failed to delete model");
      fetchModels();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function updateModel(e: React.FormEvent) {
    e.preventDefault();
    if (!editingModel) return;
    try {
      const res = await fetch(`${API}/admin/ar-models/${editingModel}`, {
        method: "PATCH",
        headers: authH(),
        body: JSON.stringify({ name: editName, model_url: editUrl || 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb' })
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingModel(null);
      fetchModels();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <p className="p-10 text-slate-500">Loading AR models...</p>;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-slate-800">
      <PublicNavbar />
      
      <div className="mx-auto mt-8 max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sky-400 hover:text-sky-300 text-sm mb-2 inline-block">← Back to Admin</Link>
            <h1 className="text-3xl font-bold tracking-tight text-white">AR/VR Models Console</h1>
            <p className="text-slate-500">Upload and grant 3D model access to vendors.</p>
          </div>
        </div>

        {error && <p className="bg-rose-500/10 text-rose-300 p-4 rounded-xl">{error}</p>}

        <div className="grid gap-6 md:grid-cols-3">
          
          <div className="md:col-span-1 border border-slate-200/60 bg-white/60 p-6 rounded-2xl h-fit">
            <h2 className="text-lg font-bold text-white mb-4">Add New Model</h2>
            <form onSubmit={addModel} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Model Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-sky-400"
                  placeholder="e.g. 3D Burger Menu" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">.GLB URL (optional)</label>
                <input value={url} onChange={e => setUrl(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-sky-400"
                  placeholder="Leaves blank for default" />
              </div>
              <button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl transition">
                Upload Model
              </button>
            </form>
          </div>

          <div className="md:col-span-2 space-y-4">
            {models.length === 0 ? (
              <p className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl">No models added yet.</p>
            ) : (
              models.map(m => (
                <div key={m.id} className="border border-slate-200/60 bg-white/60 p-5 rounded-2xl flex gap-5">
                  <div className="h-32 w-32 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 relative group">
                    <ARModelViewerWrapper
                      src={m.model_url}
                      auto-rotate
                      camera-controls
                      disable-zoom
                      style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-white">{m.name}</h3>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => { setEditingModel(m.id); setEditName(m.name); setEditUrl(m.model_url); }} 
                           className="text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-widest bg-amber-400/10 px-2 py-1 rounded"
                         >
                           Edit
                         </button>
                         <button 
                           onClick={() => deleteModel(m.id)} 
                           className="text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-widest bg-rose-400/10 px-2 py-1 rounded"
                         >
                           Delete
                         </button>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-slate-500 font-semibold mb-2">Vendor Access:</p>
                      {m.access_list.length === 0 ? (
                        <span className="text-slate-500 italic">No vendors have access.</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {m.access_list.map(v => (
                            <span key={v.vendor_store} className="bg-sky-400/10 border border-sky-400/20 text-sky-300 px-2 py-1 rounded-lg text-xs flex items-center gap-2">
                              {v.vendor_store}
                              <button onClick={() => revokeAccess(m.id, v.vendor_store)} className="hover:text-rose-400 font-bold">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={() => setShowGrant(m.id)} className="text-sky-400 text-sm font-semibold hover:underline mt-2 inline-block">
                      + Grant Access
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {showGrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setShowGrant(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white mb-4">Grant Access</h3>
            <form onSubmit={grantAccess} className="flex flex-col gap-4">
              <div className="relative z-50">
                <VendorSearchDropdown 
                  vendors={vendors.filter(v => v.store)} 
                  activeVendor={grantVendor}
                  onSelect={setGrantVendor}
                />
              </div>
              
              <button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl transition">
                Grant Access
              </button>
            </form>
          </div>
        </div>
      )}
      {editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button onClick={() => setEditingModel(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-lg font-bold text-white mb-4">Edit AR Model</h3>
            <form onSubmit={updateModel} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Model Name</label>
                <input required value={editName} onChange={e => setEditName(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">.GLB URL</label>
                <input required value={editUrl} onChange={e => setEditUrl(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 text-slate-800"
                />
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-2 rounded-xl transition mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
