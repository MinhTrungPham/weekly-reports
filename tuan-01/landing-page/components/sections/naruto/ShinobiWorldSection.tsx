import { Container } from "@/components/ui/Container";
import { shinobiWorld } from "@/data/naruto";
import { SectionHeading } from "./SectionHeading";

const symbols = ["気", "絆", "火"];

export function ShinobiWorldSection() {
  return (
    <section className="dark-section world-section" id="world">
      <Container>
        <SectionHeading eyebrow="03 / SHINOBI WORLD" title="Everything is connected by chakra." mark="世界" />
        <div className="bento-grid world-grid">
          {shinobiWorld.map((item, index) => (
            <div className={`bento-card bento-card--${item.accent}`} key={item.number}>
              <span className="card-number">{item.number}</span>
              <span className="card-symbol">{symbols[index]}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
