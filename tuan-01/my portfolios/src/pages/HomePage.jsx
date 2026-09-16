import { ArrowDownRight, ArrowUpRight, GitBranch, Link2, Mail } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";

const projects = [
  { number: "01", title: "Mosaic Finance", description: "A calmer way for teams to understand their money.", tags: ["Product design", "React"] },
  { number: "02", title: "Field Notes", description: "An editorial workspace for ideas that deserve room.", tags: ["Strategy", "Interface"] },
  { number: "03", title: "Northstar Health", description: "Making complex care journeys feel more human.", tags: ["Research", "Prototyping"] },
];

function HomePage() {
  return (
    <div id="top" className="home-page">
      <section className="hero-section page-container">
        <div className="hero-copy">
          <p className="eyebrow">Product designer &amp; frontend developer</p>
          <h1>
            I make digital products feel <em>obvious.</em>
          </h1>
          <p className="hero-summary">
            I&apos;m Minh, a developer who cares about the space between a good idea and the moment it clicks for someone.
          </p>
          <div className="hero-actions">
            <Button href="#work" type="primary" icon={<ArrowDownRight size={17} />}>
              See my work
            </Button>
            <Button href="mailto:hello@minhtran.dev" icon={<Mail size={17} />}>
              Say hello
            </Button>
          </div>
        </div>
        <div className="hero-aside" aria-label="Current availability">
          <div className="orbit-mark">
            <span>MT</span>
          </div>
          <p>
            <span className="status-dot" /> Available for selected projects
          </p>
        </div>
      </section>
      <section id="about" className="intro-section page-container">
        <p className="section-label">01 / About</p>
        <div className="intro-content">
          <h2>
            Good work lives where craft meets <span>clarity.</span>
          </h2>
          <p>
            I partner with thoughtful teams to turn fuzzy problems into useful, memorable experiences. My approach is equal parts systems thinking,
            visual detail, and a healthy respect for the person on the other side of the screen.
          </p>
        </div>
      </section>
      <section id="work" className="work-section page-container">
        <div className="section-heading">
          <p className="section-label">02 / Selected work</p>
          <span>2022—25</span>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <Card key={project.number} className="project-card">
              <div className="project-topline">
                <span>{project.number}</span>
                <ArrowUpRight size={18} />
              </div>
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <div className="tag-list">
                {project.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
      <section id="contact" className="contact-section page-container">
        <div>
          <p className="section-label">03 / Contact</p>
          <h2>
            Have a good problem?
            <br />
            <em>Let&apos;s talk.</em>
          </h2>
        </div>
        <div className="contact-details">
          <a className="email-link" href="mailto:hello@minhtran.dev">
            hello@minhtran.dev <ArrowUpRight size={20} />
          </a>
          <div className="social-links">
            <a href="https://github.com" aria-label="GitHub">
              <GitBranch size={19} />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn">
              <Link2 size={19} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
