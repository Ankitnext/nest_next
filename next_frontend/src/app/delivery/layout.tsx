import type { ReactNode } from "react";
import { DeliverySidebar } from "@/components/delivery/DeliverySidebar";

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <DeliverySidebar />
          <section className="space-y-6">{children}</section>
        </div>
      </div>
    </main>
  );
}
