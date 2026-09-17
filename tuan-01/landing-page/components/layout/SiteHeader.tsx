"use client";

import { Button } from "@buildo/bento-design-system";
import { Container } from "@/components/ui/Container";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <a className="brand-mark" href="#top" aria-label="Trang chủ">
          <span className="brand-mark__dot" />
          <span>PROJECT NAME</span>
        </a>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <a href="#story">Câu chuyện</a>
          <a href="#features">Điểm nổi bật</a>
          <a href="#contact">Liên hệ</a>
        </nav>
        <Button label="Bắt đầu" onPress={() => {}} kind="solid" hierarchy="primary" size="small" />
      </Container>
    </header>
  );
}
