import { Container } from "@/components/ui/Container";
import { journey } from "@/data/naruto";

export function JourneySection() {
  return (
    <section className="dark-section journey-section" id="journey">
      <Container>
        <p className="eyebrow">05 / THE JOURNEY</p>
        <h2>From outcast to Hokage.</h2>
        <div className="timeline">
          {journey.map((entry) => (
            <div className="timeline-item" key={entry.era}>
              <span>{entry.era}</span>
              <div>
                <h3>{entry.title}</h3>
                <p>{entry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
