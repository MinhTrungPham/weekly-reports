"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { jutsu } from "@/data/naruto";
import { SectionHeading } from "./SectionHeading";

export function JutsuSection() {
  const [activeJutsu, setActiveJutsu] = useState<(typeof jutsu)[number] | null>(null);

  return (
    <section className="dark-section jutsu-section" id="jutsu">
      <Container>
        <SectionHeading eyebrow="07 / JUTSU" title="Technique becomes identity." />
        <div className="jutsu-orbit-stage">
          <div className="jutsu-orbit" aria-label="Jutsu techniques orbit" onPointerLeave={() => setActiveJutsu(null)}>
            <div className={`jutsu-preview-panels${activeJutsu ? " is-visible" : ""}`} aria-hidden={!activeJutsu}>
              <div
                className="jutsu-preview-panel jutsu-preview-panel--left"
                style={activeJutsu ? { backgroundImage: `url(${activeJutsu.image})` } : undefined}
              >
                <span>{activeJutsu?.type}</span>
                <strong>{activeJutsu?.description}</strong>
              </div>
              <div
                className="jutsu-preview-panel jutsu-preview-panel--right"
                style={activeJutsu ? { backgroundImage: `url(${activeJutsu.image})` } : undefined}
              >
                <span>{activeJutsu?.symbol}</span>
                <strong>{activeJutsu?.name}</strong>
              </div>
            </div>
            <div className="jutsu-orbit__ring jutsu-orbit__ring--inner">
              {jutsu.slice(0, 3).map((item) => (
                <article
                  className="technique-orbit-item technique-orbit-item--inner"
                  key={item.name}
                  onFocus={() => setActiveJutsu(item)}
                  onPointerEnter={() => setActiveJutsu(item)}
                  tabIndex={0}
                >
                  <div className="technique-orbit-item__body">
                    <span className="technique-orbit-item__symbol">{item.symbol}</span>
                    <h3>{item.name}</h3>
                  </div>
                </article>
              ))}
            </div>
            <div className="jutsu-orbit__ring jutsu-orbit__ring--outer">
              {jutsu.slice(3, 6).map((item) => (
                <article
                  className="technique-orbit-item technique-orbit-item--outer"
                  key={item.name}
                  onFocus={() => setActiveJutsu(item)}
                  onPointerEnter={() => setActiveJutsu(item)}
                  tabIndex={0}
                >
                  <div className="technique-orbit-item__body">
                    <span className="technique-orbit-item__symbol">{item.symbol}</span>
                    <h3>{item.name}</h3>
                  </div>
                </article>
              ))}
            </div>
            <div className="jutsu-orbit__center">
              <span>術</span>
              <small>
                SELECT
                <br />
                TECHNIQUE
              </small>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
