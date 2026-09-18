import { Code2, Database, Monitor, Server, Wrench } from "lucide-react";
import Card from "../ui/Card";
import Tag from "../ui/Tag";
import { skillGroups } from "../../data/portfolioData";

const skillIcons = {
  code: <Code2 size={20} />,
  server: <Server size={20} />,
  monitor: <Monitor size={20} />,
  database: <Database size={20} />,
  wrench: <Wrench size={20} />,
};

function SkillsSection() {
  return (
    <section id="skills" className="skills-section page-container content-section">
      <div className="section-heading">
        <p className="section-label">02 / Skills</p>
        <span>Always learning</span>
      </div>
      <div className="skills-grid">
        {skillGroups.map((skill) => (
          <Card key={skill.label} className="skill-card">
            <div className="skill-icon">{skillIcons[skill.icon]}</div>
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
  );
}

export default SkillsSection;
