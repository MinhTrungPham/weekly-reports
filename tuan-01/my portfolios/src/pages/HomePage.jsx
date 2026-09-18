import AboutSection from "../components/sections/AboutSection";
import ContactSection from "../components/sections/ContactSection";
import ExperienceSection from "../components/sections/ExperienceSection";
import HeroSection from "../components/sections/HeroSection";
import ProjectsSection from "../components/sections/ProjectsSection";
import ReportSection from "../components/sections/ReportSection";
import SkillsSection from "../components/sections/SkillsSection";

function HomePage() {
  return (
    <div id="top" className="home-page">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ReportSection />
      <ContactSection />
    </div>
  );
}

export default HomePage;
