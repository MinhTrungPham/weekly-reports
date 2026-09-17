import { Container } from "@/components/ui/Container";
import { quotes } from "@/data/naruto";

export function QuotesSection() {
  return (
    <section className="dark-section quotes-section" id="quotes">
      <Container>
        <p className="eyebrow">08 / QUOTES</p>
        <div className="quote-layout">
          <article className="quote-feature">
            <span className="quote-mark">“</span>
            <blockquote>{quotes[0].quote}</blockquote>
            <footer>
              <strong>{quotes[0].speaker}</strong>
              <small>{quotes[0].context}</small>
            </footer>
          </article>
          <div className="quote-stack">
            {quotes.slice(1).map((item, index) => (
              <article className="quote-row" key={item.speaker}>
                <span className="quote-row__index">0{index + 2}</span>
                <blockquote>{item.quote}</blockquote>
                <footer>
                  <strong>{item.speaker}</strong>
                  <small>{item.context}</small>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
