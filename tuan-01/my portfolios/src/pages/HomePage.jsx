import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Database,
  ExternalLink,
  FileText,
  GitBranch,
  GraduationCap,
  Link2,
  Mail,
  Monitor,
  Server,
  Wrench,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Tag from "../components/ui/Tag";

const projects = [
  { number: "01", title: "Mosaic Finance", description: "A calmer way for teams to understand their money.", tags: ["Product design", "React"] },
  { number: "02", title: "Field Notes", description: "An editorial workspace for ideas that deserve room.", tags: ["Strategy", "Interface"] },
  { number: "03", title: "Northstar Health", description: "Making complex care journeys feel more human.", tags: ["Research", "Prototyping"] },
];

const skillGroups = [
  { label: "Programming", icon: <Code2 size={20} />, items: ["JavaScript", "TypeScript", "Python", "Java"] },
  { label: "Backend", icon: <Server size={20} />, items: ["Node.js", "Express", "REST API", "Authentication"] },
  { label: "Frontend", icon: <Monitor size={20} />, items: ["React", "Vue", "Ant Design", "Responsive UI"] },
  { label: "Database", icon: <Database size={20} />, items: ["PostgreSQL", "MongoDB", "MySQL", "Redis"] },
  { label: "Tools", icon: <Wrench size={20} />, items: ["Git", "Docker", "Figma", "VS Code"] },
];

const timeline = [
  { period: "2024 — Present", title: "Software Developer", place: "Building thoughtful digital products", icon: <BriefcaseBusiness size={18} /> },
  { period: "2021 — 2024", title: "Computer Science", place: "University education & independent projects", icon: <GraduationCap size={18} /> },
];
const peepReportUrl = import.meta.env.VITE_PEEP_REPORT_URL || "#peep-report";

function HomePage() {
  return (
    <div id="top" className="home-page">
      <section className="hero-section page-container">
        <div className="hero-copy">
          <p className="eyebrow">Minh Tran / Software Developer</p>
          <h1>
            I build digital products with <em>clarity.</em>
          </h1>
          <p className="hero-summary">
            A software developer focused on reliable systems, considered interfaces, and turning complex problems into useful experiences.
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
            <span>MT</span>
          </div>
          <p>
            <span className="status-dot" /> Open to meaningful work
          </p>
        </div>
      </section>

      <section id="about" className="about-section page-container content-section">
        <p className="section-label">01 / About me</p>
        <div className="about-grid">
          <div className="about-lead">
            <h2>
              Curious by nature,
              <br />
              <span>practical by craft.</span>
            </h2>
            <p>
              I enjoy understanding how things work, then making them work better. My practice moves between backend logic and frontend detail, always
              with the person using the product in mind.
            </p>
          </div>
          <div className="about-facts">
            <div>
              <p className="fact-label">Education</p>
              <p>
                Computer Science
                <br />
                Software engineering foundations
              </p>
            </div>
            <div>
              <p className="fact-label">Direction</p>
              <p>Growing into a product-minded engineer who can own a problem from first sketch to production.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" className="skills-section page-container content-section">
        <div className="section-heading">
          <p className="section-label">02 / Skills</p>
          <span>Always learning</span>
        </div>
        <div className="skills-grid">
          {skillGroups.map((skill) => (
            <Card key={skill.label} className="skill-card">
              <div className="skill-icon">{skill.icon}</div>
              <h3>{skill.label}</h3>
              <div className="skill-list">
                {skill.items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="projects" className="work-section page-container content-section">
        <div className="section-heading">
          <p className="section-label">03 / Selected projects</p>
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

      <section id="experience" className="experience-section page-container content-section">
        <p className="section-label">04 / Experience &amp; education</p>
        <div className="timeline">
          {timeline.map((item) => (
            <div className="timeline-item" key={item.title}>
              <div className="timeline-icon">{item.icon}</div>
              <div>
                <p className="timeline-period">{item.period}</p>
                <h3>{item.title}</h3>
                <p>{item.place}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="peep-report" className="report-section page-container content-section">
        <div className="report-copy">
          <p className="section-label">05 / PEEP report</p>
          <h2>
            Learning in public,
            <br />
            <em>one report at a time.</em>
          </h2>
          <p>My weekly PEEP reports document what I am learning, building, and improving along the way.</p>
        </div>
        <Button href={peepReportUrl} icon={<FileText size={17} />}>
          View PEEP report
        </Button>
      </section>

      <section id="contact" className="contact-section page-container content-section">
        <div>
          <p className="section-label">06 / Contact</p>
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
            <a href="#peep-report" aria-label="PEEP report">
              <ExternalLink size={19} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
