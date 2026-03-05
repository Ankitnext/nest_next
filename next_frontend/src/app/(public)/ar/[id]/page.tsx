"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { ARModelViewerWrapper } from "@/components/ARModelViewer";

declare global { namespace JSX { interface IntrinsicElements { "model-viewer": any; } } }

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type Props = { params: Promise<{ id: string }> };

export default function PublicArViewer({ params }: Props) {
  const { id } = use(params);
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic API resolution to support testing on mobile phones via local IP addresses
    const apiUrl = (typeof window !== "undefined" && window.location.hostname !== "localhost") 
      ? `${window.location.protocol}//${window.location.hostname}:3001/api`
      : API;

    fetch(`${apiUrl}/public/ar-models/${id}`)
      .then(res => res.json())
      .then(data => setModel(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">Loading AR View...</div>;
  if (!model?.model_url) return <div className="min-h-screen bg-white flex items-center justify-center text-rose-400">Model not found</div>;

  return (
    <div className="min-h-screen bg-white text-white flex flex-col">
      <div className="p-4 border-b border-slate-800 bg-white/50 backdrop-blur text-center flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-widest text-orange-500">N</a>
        <h1 className="font-semibold text-sm">{model.name}</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 relative">
        <ARModelViewerWrapper
          src={model.model_url}
          ios-src=""
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          environment-image="neutral"
          style={{ width: '100%', height: '100%', minHeight: '500px', backgroundColor: '#020617' }}
        >
          <button slot="ar-button" className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-white px-6 py-3 rounded-full font-bold shadow-2xl flex gap-2 items-center">
            <span>👁️</span> View in your space
          </button>
        </ARModelViewerWrapper>
      </div>
    </div>
  );
}
