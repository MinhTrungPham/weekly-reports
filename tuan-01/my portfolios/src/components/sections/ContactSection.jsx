import { ArrowUpRight, ExternalLink, GitBranch, Link2 } from "lucide-react";
import { contactInfo } from "../../data/portfolioData";

const socialIcons = {
  github: <GitBranch size={19} />,
  linkedin: <Link2 size={19} />,
  external: <ExternalLink size={19} />,
};

function ContactSection() {
  return (
    <section id="contact" className="contact-section page-container content-section">
      <div>
        <p className="section-label">06 / Contact</p>
        <h2>
          Have a good problem?
          <br />
          <em>Let&apos;s talk.</em>
        </h2>
      </div>
      <div className="contact-details">
        <a className="email-link" href={`mailto:${contactInfo.email}`}>
          {contactInfo.email} <ArrowUpRight size={20} />
        </a>
        <a className="phone-link" href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}>
          {contactInfo.phone}
        </a>
        <div className="social-links">
          {contactInfo.socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {socialIcons[link.icon]}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
