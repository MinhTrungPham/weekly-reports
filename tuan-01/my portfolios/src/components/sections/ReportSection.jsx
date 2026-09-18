import { FileText } from "lucide-react";
import Button from "../ui/Button";
import { contactInfo } from "../../data/portfolioData";

function ReportSection() {
  return (
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
      <Button href={contactInfo.peepReportUrl} icon={<FileText size={17} />}>
        View PEEP report
      </Button>
    </section>
  );
}

export default ReportSection;
