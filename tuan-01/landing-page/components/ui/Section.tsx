import type { HTMLAttributes } from "react";
import { Container } from "./Container";

type SectionProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
};

export function Section({ className = "", eyebrow, children, ...props }: SectionProps) {
  return (
    <section className={`page-section ${className}`.trim()} {...props}>
      <Container>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        {children}
      </Container>
    </section>
  );
}
