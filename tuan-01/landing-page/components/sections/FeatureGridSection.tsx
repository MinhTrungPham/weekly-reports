import { Card } from "@buildo/bento-design-system";
import { Section } from "@/components/ui/Section";

const features = [
  ["01", "Kể đúng câu chuyện", "Một vị trí rõ ràng cho thông điệp chính, lợi ích và lời kêu gọi hành động."],
  ["02", "Mở rộng có chủ đích", "Các block độc lập để thêm bằng chứng, sản phẩm, số liệu hoặc trải nghiệm."],
  ["03", "Sẵn sàng thay đổi", "Nội dung được tách khỏi layout để chốt chủ đề sau mà không phá cấu trúc."],
];

export function FeatureGridSection() {
  return (
    <Section id="features" className="features-section" eyebrow="CẤU TRÚC / 02">
      <div className="section-heading">
        <h2>Những viên gạch đầu tiên của landing page.</h2>
        <p>Ba vùng nội dung này là điểm bắt đầu. Chúng sẽ được thay bằng ngôn ngữ của chủ đề khi bạn quyết định hướng đi.</p>
      </div>
      <div className="feature-grid">
        {features.map(([number, title, description]) => (
          <div className="feature-card" key={number}>
            <Card padding={24}>
              <span className="feature-card__number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
}
