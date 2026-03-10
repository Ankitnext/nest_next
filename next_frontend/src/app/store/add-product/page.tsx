"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProductForm as SharedProductForm } from "@/components/store/ProductForm";

export default function StoreAddProductPage() {
  const router = useRouter();
  const { userStore } = useAuth();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Add New Product</h2>
        <p className="text-sm text-slate-500 mt-0.5">Fill in the details below to list a new product in your store.</p>
      </div>

      <div className="max-w-2xl">
        <SharedProductForm 
          userStore={userStore}
          onSuccess={() => {
            // Redirect to manage products after a short delay
            setTimeout(() => router.push("/store/manage-product"), 1500);
          }}
        />
      </div>
    </section>
  );
}
