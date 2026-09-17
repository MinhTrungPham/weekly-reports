"use client";

import { Button } from "@buildo/bento-design-system";
import { Container } from "@/components/ui/Container";

export function HeroSection() {
  return (
    <section className="hero-section" id="top">
      <Container className="hero-section__inner">
        <div className="hero-copy">
          <p className="section-eyebrow">LANDING PAGE FOUNDATION / 01</p>
          <h1>Một ý tưởng tốt nên có không gian để được nhìn thấy.</h1>
          <p className="hero-copy__lede">
            Đây là phần mở đầu có thể thay thế cho bất kỳ chủ đề nào: sản phẩm, thương hiệu, sự kiện hoặc một câu chuyện cá nhân.
          </p>
          <div className="hero-actions">
            <Button label="Khám phá câu chuyện" onPress={() => {}} kind="solid" hierarchy="primary" />
            <a className="text-link" href="#features">
              Xem cấu trúc <span>↘</span>
            </a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__ring" />
          <div className="hero-art__label">
            YOUR
            <br />
            SUBJECT
            <br />
            GOES HERE
          </div>
          <div className="hero-art__stamp">
            READY
            <br />
            TO SHAPE
          </div>
        </div>
      </Container>
    </section>
  );
}
