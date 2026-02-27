import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { PageContainer } from "@/components/PageContainer";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen py-8">
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AdminSidebar />
          <section className="space-y-6">
            <AdminTopbar />
            {children}
          </section>
        </div>
      </PageContainer>
    </main>
  );
}

