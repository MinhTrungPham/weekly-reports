import { Container } from "@/components/ui/Container";
import { narutoHero } from "@/data/naruto";

export function AboutSection() {
  return (
    <section className="dark-section about-section" id="about">
      <Container className="split-heading">
        <div>
          <p className="eyebrow">02 / ABOUT NARUTO</p>
          <h2>A story about being seen.</h2>
        </div>
        <p className="section-lede">
          In a world of hidden villages and inherited conflict, Naruto Uzumaki starts with nothing but a stubborn promise: to become impossible to
          ignore.
        </p>
      </Container>
      <Container className="about-grid">
        <div
          className="about-poster"
          style={{ backgroundImage: `linear-gradient(135deg, rgba(255,107,0,.2), transparent), url(${narutoHero.image})` }}
        >
          <span>NO. 001</span>
          <strong>
            THE
            <br />
            ORANGE
            <br />
            SHINOBI
          </strong>
        </div>
        <div className="about-copy">
          <p className="vertical-note">NARUTO / うずまきナルト</p>
          <div>
            <p>Born with a legend sealed inside him, Naruto grows from the village outsider into a leader who changes what strength can mean.</p>
            <p>His journey is not about becoming someone else. It is about making room for every scar, promise and bond that brought him here.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
