import { ArrowUpRight } from "lucide-react";
import Card from "../ui/Card";
import Tag from "../ui/Tag";
import { projects } from "../../data/portfolioData";

function ProjectsSection() {
  return (
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
  );
}

export default ProjectsSection;
