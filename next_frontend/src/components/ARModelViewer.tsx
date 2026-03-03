"use client";

import dynamic from "next/dynamic";
import React from "react";

// We load the entire module and component exclusively on the client.
// This prevents Next.js Server Components from interacting with the 'window' object 
// or the custom element registry entirely.
const SafeModelViewer = dynamic(
  () =>
    import("@google/model-viewer").then(() => {
      return function ModelViewer({ children, ...props }: any) {
        // @ts-ignore
        return <model-viewer {...props}>{children}</model-viewer>;
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900 border border-slate-700/50 rounded-xl">
        <span className="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">
          Loading 3D...
        </span>
      </div>
    ),
  }
);

export function ARModelViewerWrapper(props: any) {
  return <SafeModelViewer {...props} />;
}
