import { Container } from "@/components/ui/Container";
import { rivalry } from "@/data/naruto";

export function RivalrySection() {
  return (
    <section className="dark-section rivalry-section" id="rivalry">
      <Container className="rivalry-panel">
        <div>
          <p className="eyebrow">{rivalry.kicker}</p>
          <h2>{rivalry.title}</h2>
          <p>{rivalry.description}</p>
        </div>
        <div className="rivalry-lines">
          <span>{rivalry.left}</span>
          <i>VS</i>
          <span>{rivalry.right}</span>
        </div>
      </Container>
    </section>
  );
}
