function AboutSection() {
  return (
    <section id="about" className="about-section page-container content-section">
      <div className="about-heading">
        <p className="section-label">01 / About me</p>
        <span className="about-index">A01</span>
      </div>
      <div className="about-layout">
        <div className="about-lead">
          <p className="about-kicker">The short version</p>
          <h2>
            Curious by nature,
            <br />
            <span>practical by craft.</span>
          </h2>
          <p className="about-description">
            I am an Information Technology graduate with hands-on experience in backend and full-stack web development. I enjoy implementing business
            logic, solving technical problems, and building software for real-world workflows.
          </p>
        </div>
        <div className="about-profile-card">
          <div className="profile-card-top">
            <span>Profile snapshot</span>
            <span className="profile-dot" />
          </div>
          <p className="profile-role">
            Java / Full-stack
            <br />
            Developer
          </p>
          <div className="profile-card-bottom">
            <span>HCMUTE</span>
            <span>2026</span>
          </div>
        </div>
      </div>
      <div className="about-stats">
        <div className="about-stat">
          <strong>8.95</strong>
          <span>GPA / 10.0</span>
        </div>
        <div className="about-stat">
          <strong>03</strong>
          <span>Selected projects</span>
        </div>
        <div className="about-stat">
          <strong>705</strong>
          <span>TOEIC score</span>
        </div>
        <div className="about-direction">
          <p className="fact-label">Direction</p>
          <p>Seeking a Java Developer or Full-stack Developer position to contribute to real-world projects and grow as a software engineer.</p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
