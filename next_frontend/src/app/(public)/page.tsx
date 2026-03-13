import { HeroSection } from "@/components/HeroSection";
import { FeatureCards } from "@/components/FeatureCards";
import { ShopCategoryGrid } from "@/components/ShopCategoryGrid";
import { LocalServicesGrid } from "@/components/LocalServicesGrid";
import { RecommendedVendors } from "@/components/RecommendedVendors";
import { HowItWorks } from "@/components/HowItWorks";
import { RegisterShopCTA } from "@/components/RegisterShopCTA";

export default async function HomePage() {
  return (
    <main>
      {/* 1. Hero: Purple gradient, search bar, CTAs */}
      <HeroSection />

      {/* 2. Why Choose Baazaarse: 4 feature cards */}
      <FeatureCards />

      {/* 3. Shop by Category: Grid of category cards */}
      <ShopCategoryGrid />

      {/* 4. Local Services: 3x2 grid */}
      <LocalServicesGrid />

      {/* 5. Recommended Near You: Vendor cards with ratings */}
      <RecommendedVendors />

      {/* 6. How It Works: 4-step guide */}
      <HowItWorks />

      {/* 7. Register Your Shop / Service CTA (from Figma) */}
      <RegisterShopCTA />
    </main>
  );
}
