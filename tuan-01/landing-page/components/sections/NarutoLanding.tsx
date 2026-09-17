import { AboutSection } from "./naruto/AboutSection";
import { CharactersSection } from "./naruto/CharactersSection";
import { HeroSection } from "./naruto/HeroSection";
import { IconicMomentsSection } from "./naruto/IconicMomentsSection";
import { JourneySection } from "./naruto/JourneySection";
import { JutsuSection } from "./naruto/JutsuSection";
import { NarutoCtaSection } from "./naruto/NarutoCtaSection";
import { QuotesSection } from "./naruto/QuotesSection";
import { RivalrySection } from "./naruto/RivalrySection";
import { ShinobiWorldSection } from "./naruto/ShinobiWorldSection";

export function NarutoLanding() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ShinobiWorldSection />
      <CharactersSection />
      <JourneySection />
      <IconicMomentsSection />
      <JutsuSection />
      <QuotesSection />
      <RivalrySection />
      <NarutoCtaSection />
    </>
  );
}
