import type { ReactNode } from "react";
import { PageContainer } from "@/components/PageContainer";
import { StoreSidebar } from "@/components/store/StoreSidebar";
import { StoreTopbar } from "@/components/store/StoreTopbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen py-8">
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <StoreSidebar />
          <section className="space-y-6">
            <StoreTopbar />
            {children}
          </section>
        </div>
      </PageContainer>
    </main>
  );
}

