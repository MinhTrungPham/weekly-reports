import { ArrowDownRight, Mail } from "lucide-react";
import Button from "../ui/Button";

function HeroSection() {
  return (
    <section className="hero-section page-container">
      <div className="hero-copy">
        <p className="eyebrow">Pham Minh Trung / Java &amp; Full-stack Developer</p>
        <h1>
          I build reliable software with <em>purpose.</em>
        </h1>
        <p className="hero-summary">
          Information Technology graduate with hands-on experience in backend and full-stack web development, business logic, and technical problem
          solving.
        </p>
        <div className="hero-actions">
          <Button href="#projects" type="primary" icon={<ArrowDownRight size={17} />}>
            View projects
          </Button>
          <Button href="#contact" icon={<Mail size={17} />}>
            Contact me
          </Button>
        </div>
      </div>
      <div className="hero-aside" aria-label="Current availability">
        <div className="orbit-mark">
          <span>PMT</span>
        </div>
        <p>
          <span className="status-dot" /> Open to meaningful work
        </p>
      </div>
    </section>
  );
}

export default HeroSection;
