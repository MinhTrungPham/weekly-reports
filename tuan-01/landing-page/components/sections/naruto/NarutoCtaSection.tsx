"use client";

import { Container } from "@/components/ui/Container";
import { ActionButton } from "./ActionButton";

export function NarutoCtaSection() {
  return (
    <section className="dark-section final-cta" id="contact">
      <Container>
        <p className="eyebrow">10 / YOUR NEXT MISSION</p>
        <h2>Believe it.</h2>
        <p>Carry the will of fire into whatever comes next.</p>
        <ActionButton label="Begin the journey" />
      </Container>
    </section>
  );
}
