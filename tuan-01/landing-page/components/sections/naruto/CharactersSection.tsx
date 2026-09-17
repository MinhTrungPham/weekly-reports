import { Container } from "@/components/ui/Container";
import { characters } from "@/data/naruto";
import { SectionHeading } from "./SectionHeading";

export function CharactersSection() {
  return (
    <section className="dark-section characters-section" id="characters">
      <Container>
        <SectionHeading eyebrow="04 / CHARACTERS" title="Faces behind the legend." count="03 / 09" />
        <div className="character-grid">
          {characters.map((character) => (
            <article className="character-card" key={character.name}>
              <div
                className="character-card__image"
                style={{ backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(11,11,15,.95) 100%), url(${character.image})` }}
              />
              <div className="character-card__content">
                <p>{character.role}</p>
                <h3>{character.name}</h3>
                <span>{character.description}</span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
