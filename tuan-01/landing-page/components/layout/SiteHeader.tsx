"use client";

import { Button } from "@buildo/bento-design-system";
import { Container } from "@/components/ui/Container";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <a className="brand-mark" href="#top" aria-label="Naruto - The Shinobi Way">
          <span className="brand-mark__dot">忍</span>
          <span>NARUTO / 忍道</span>
        </a>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <a href="#about">About</a>
          <a href="#characters">Characters</a>
          <a href="#journey">Journey</a>
          <a href="#jutsu">Jutsu</a>
        </nav>
        <Button label="Explore" onPress={() => {}} kind="solid" hierarchy="primary" size="small" />
      </Container>
    </header>
  );
}
