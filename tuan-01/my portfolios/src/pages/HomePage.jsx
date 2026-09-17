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
  {
    number: "01",
    title: "Project Management System",
    description: "A full-stack Agile/Scrum platform for projects, sprints, tasks, collaboration, meetings, and progress tracking.",
    tags: ["Node.js", "React", "AI"],
  },
  {
    number: "02",
    title: "Cosmetic E-commerce Website",
    description: "A multi-role shopping platform with VNPay checkout, product ranking, OTP verification, and real-time chat.",
    tags: ["Java", "Spring Boot", "SQL Server"],
  },
  {
    number: "03",
    title: "Dac san Soc Trang",
    description: "An e-commerce platform with order validation, loyalty points, customer support, and AI comment moderation.",
    tags: ["Next.js", "MongoDB", "MoMo"],
  },
];

const skillGroups = [
  { label: "Programming", icon: <Code2 size={20} />, items: ["Java", "JavaScript", "TypeScript", "C++", "Python (Basic)"] },
  {
    label: "Backend",
    icon: <Server size={20} />,
    items: ["Spring Boot", "Spring Security", "JPA / Hibernate", "Node.js", "Express.js", "REST APIs", "JWT", "Socket.IO"],
  },
  { label: "Frontend", icon: <Monitor size={20} />, items: ["React", "Next.js", "TypeScript", "Thymeleaf", "Tailwind CSS", "Bootstrap"] },
  { label: "Database", icon: <Database size={20} />, items: ["MySQL", "SQL Server", "MongoDB", "PostgreSQL", "Redis"] },
  { label: "Tools & AI", icon: <Wrench size={20} />, items: ["Git", "GitHub", "Docker", "Postman", "n8n", "Gemini API", "OpenAI API"] },
];

const timeline = [
  {
    period: "Aug 2025 — Oct 2025",
    title: "Java Developer Intern",
    place: "HPT Vietnam Corporation · Java, Spring Boot, backend services",
    icon: <BriefcaseBusiness size={18} />,
  },
  {
    period: "2024 — 2025",
    title: "Computer Lab Support Assistant",
    place: "HCMUTE · Hardware, software, Windows, LAN, and user support",
    icon: <BriefcaseBusiness size={18} />,
  },
  {
    period: "Aug 2022 — Sep 2026",
    title: "Bachelor of Information Technology",
    place: "HCMUTE · GPA 8.95/10.0 · Academic encouragement scholarships",
    icon: <GraduationCap size={18} />,
  },
];
const peepReportUrl = import.meta.env.VITE_PEEP_REPORT_URL || "#peep-report";

function HomePage() {
  return (
    <div id="top" className="home-page">
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

      <section id="about" className="about-section page-container content-section">
        <div className="about-heading">
          <p className="section-label">01 / About me</p>
          <span className="about-index">A01</span>
        </div>
        <div className="about-layout">
          <div className="about-lead">
            <p className="about-kicker">The short version</p>
            <h2>
              Curious by nature,
              <br />
              <span>practical by craft.</span>
            </h2>
            <p className="about-description">
              I am an Information Technology graduate with hands-on experience in backend and full-stack web development. I enjoy implementing
              business logic, solving technical problems, and building software for real-world workflows.
            </p>
          </div>
          <div className="about-profile-card">
            <div className="profile-card-top">
              <span>Profile snapshot</span>
              <span className="profile-dot" />
            </div>
            <p className="profile-role">
              Java / Full-stack
              <br />
              Developer
            </p>
            <div className="profile-card-bottom">
              <span>HCMUTE</span>
              <span>2026</span>
            </div>
          </div>
        </div>
        <div className="about-stats">
          <div className="about-stat">
            <strong>8.95</strong>
            <span>GPA / 10.0</span>
          </div>
          <div className="about-stat">
            <strong>03</strong>
            <span>Selected projects</span>
          </div>
          <div className="about-stat">
            <strong>705</strong>
            <span>TOEIC score</span>
          </div>
          <div className="about-direction">
            <p className="fact-label">Direction</p>
            <p>Seeking a Java Developer or Full-stack Developer position to contribute to real-world projects and grow as a software engineer.</p>
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
          <span>2025—26</span>
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
          <p>
            My weekly PEEP reports document what I am learning, building, and improving as I grow from university projects into professional software
            development.
          </p>
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
          <a className="email-link" href="mailto:minhtrungbttv@gmail.com">
            minhtrungbttv@gmail.com <ArrowUpRight size={20} />
          </a>
          <a className="phone-link" href="tel:+84902137976">
            0902 137 976
          </a>
          <div className="social-links">
            <a href="https://github.com/MinhTrungPham" aria-label="GitHub" target="_blank" rel="noreferrer">
              <GitBranch size={19} />
            </a>
            <a href="https://www.linkedin.com/in/minh-trung-pham/" aria-label="LinkedIn" target="_blank" rel="noreferrer">
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
