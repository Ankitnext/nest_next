import type { ReactNode } from "react";
import Script from "next/script";
import { PageContainer } from "@/components/PageContainer";
import { PublicNavbar } from "@/components/PublicNavbar";
import { SiteFooter } from "@/components/SiteFooter";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen">
        <PublicNavbar />
        <PageContainer className="space-y-10 py-8">{children}</PageContainer>
        <SiteFooter />
      </div>
    </>
  );
}

