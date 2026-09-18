import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { timeline } from "../../data/portfolioData";

const experienceIcons = {
  briefcase: <BriefcaseBusiness size={18} />,
  graduation: <GraduationCap size={18} />,
};

function ExperienceSection() {
  return (
    <section id="experience" className="experience-section page-container content-section">
      <p className="section-label">04 / Experience &amp; education</p>
      <div className="timeline">
        {timeline.map((item) => (
          <div className="timeline-item" key={item.title}>
            <div className="timeline-icon">{experienceIcons[item.icon]}</div>
            <div>
              <p className="timeline-period">{item.period}</p>
              <h3>{item.title}</h3>
              <p>{item.place}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;
