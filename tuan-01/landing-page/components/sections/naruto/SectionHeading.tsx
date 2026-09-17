type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  mark?: string;
  count?: string;
};

export function SectionHeading({ eyebrow, title, mark, count }: SectionHeadingProps) {
  return (
    <div className="section-title-row">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {mark ? <span className="section-mark">{mark}</span> : null}
      {count ? <span className="section-count">{count}</span> : null}
    </div>
  );
}
