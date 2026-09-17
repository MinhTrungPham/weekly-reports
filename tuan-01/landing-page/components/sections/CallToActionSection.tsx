"use client";

import { Button } from "@buildo/bento-design-system";
import { Section } from "@/components/ui/Section";

export function CallToActionSection() {
  return (
    <Section id="contact" className="cta-section" eyebrow="BƯỚC TIẾP THEO / 03">
      <div className="cta-panel">
        <div>
          <h2>Chủ đề chưa cần xuất hiện ngay từ bước đầu.</h2>
          <p>Kiến trúc đã sẵn sàng để nhận nội dung thật khi bạn có hướng đi.</p>
        </div>
        <Button label="Định hình ý tưởng" onPress={() => {}} kind="solid" hierarchy="primary" />
      </div>
    </Section>
  );
}
