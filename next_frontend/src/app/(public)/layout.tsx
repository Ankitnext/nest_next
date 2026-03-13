import type { ReactNode } from "react";
import Script from "next/script";
import { PublicNavbar } from "@/components/PublicNavbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-[#F3F4F9]">
        <PublicNavbar />
        {children}
      </div>
    </>
  );
}
