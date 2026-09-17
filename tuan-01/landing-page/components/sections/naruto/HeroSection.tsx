"use client";

import { Container } from "@/components/ui/Container";
import { narutoHero } from "@/data/naruto";
import { ActionButton } from "./ActionButton";

export function HeroSection() {
  return (
    <section className="naruto-hero" id="top">
      <Container className="naruto-hero__grid">
        <div className="naruto-hero__copy">
          <p className="eyebrow">{narutoHero.eyebrow}</p>
          <h1>{narutoHero.title}</h1>
          <p className="naruto-hero__description">{narutoHero.description}</p>
          <div className="hero-actions">
            <ActionButton label="Enter the shinobi world" />
            <a className="ghost-link" href="#about">
              Scroll to explore <span>↓</span>
            </a>
          </div>
        </div>
        <div
          className="naruto-hero__visual"
          style={{ backgroundImage: `linear-gradient(180deg, transparent 38%, #0b0b0f 100%), url(${narutoHero.image})` }}
        >
          <span className="hero-seal">{narutoHero.badge}</span>
          <span className="hero-index">01 / 12</span>
          <span className="hero-kanji">忍</span>
        </div>
      </Container>
    </section>
  );
}
