import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { CallToActionSection } from "@/components/sections/CallToActionSection";
import { FeatureGridSection } from "@/components/sections/FeatureGridSection";
import { HeroSection } from "@/components/sections/HeroSection";

export default function Home() {
  return (
    <MarketingLayout>
      <HeroSection />
      <FeatureGridSection />
      <CallToActionSection />
    </MarketingLayout>
  );
}
