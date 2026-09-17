import { Container } from "@/components/ui/Container";
import { iconicMoments } from "@/data/naruto";

export function IconicMomentsSection() {
  return (
    <section className="dark-section moments-section" id="moments">
      <Container>
        <p className="eyebrow">06 / ICONIC MOMENTS</p>
        <h2>Frames that stayed with us.</h2>
        <div className="moment-grid">
          {iconicMoments.map((moment) => (
            <article className="moment-card" key={moment.label}>
              <div
                className="moment-card__image"
                style={{ backgroundImage: `linear-gradient(180deg, transparent 20%, #15151c 100%), url(${moment.image})` }}
              />
              <div>
                <p>{moment.label}</p>
                <h3>{moment.title}</h3>
                <span>{moment.description}</span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
