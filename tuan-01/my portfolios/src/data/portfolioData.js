export const projects = [
  {
    number: "01",
    title: "Project Management System",
    description: "A full-stack Agile/Scrum platform for projects, sprints, tasks, collaboration, meetings, and progress tracking.",
    tags: ["Node.js", "React", "AI"],
  },
  {
    number: "02",
    title: "Cosmetic E-commerce Website",
    description: "A multi-role shopping platform with VNPay checkout, product ranking, OTP verification, and real-time chat.",
    tags: ["Java", "Spring Boot", "SQL Server"],
  },
  {
    number: "03",
    title: "Dac san Soc Trang",
    description: "An e-commerce platform with order validation, loyalty points, customer support, and AI comment moderation.",
    tags: ["Next.js", "MongoDB", "MoMo"],
  },
];

export const skillGroups = [
  { label: "Programming", icon: "code", items: ["Java", "JavaScript", "TypeScript", "C++", "Python (Basic)"] },
  {
    label: "Backend",
    icon: "server",
    items: ["Spring Boot", "Spring Security", "JPA / Hibernate", "Node.js", "Express.js", "REST APIs", "JWT", "Socket.IO"],
  },
  { label: "Frontend", icon: "monitor", items: ["React", "Next.js", "TypeScript", "Thymeleaf", "Tailwind CSS", "Bootstrap"] },
  { label: "Database", icon: "database", items: ["MySQL", "SQL Server", "MongoDB", "PostgreSQL", "Redis"] },
  { label: "Tools & AI", icon: "wrench", items: ["Git", "GitHub", "Docker", "Postman", "n8n", "Gemini API", "OpenAI API"] },
];

export const timeline = [
  {
    period: "Aug 2025 — Oct 2025",
    title: "Java Developer Intern",
    place: "HPT Vietnam Corporation · Java, Spring Boot, backend services",
    icon: "briefcase",
  },
  {
    period: "2024 — 2025",
    title: "Computer Lab Support Assistant",
    place: "HCMUTE · Hardware, software, Windows, LAN, and user support",
    icon: "briefcase",
  },
  {
    period: "Aug 2022 — Sep 2026",
    title: "Bachelor of Information Technology",
    place: "HCMUTE · GPA 8.95/10.0 · Academic encouragement scholarships",
    icon: "graduation",
  },
];

export const contactInfo = {
  email: "minhtrungbttv@gmail.com",
  phone: "0902 137 976",
  peepReportUrl: import.meta.env.VITE_PEEP_REPORT_URL || "#peep-report",
  socialLinks: [
    { label: "GitHub", href: "https://github.com/MinhTrungPham", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/minh-trung-pham/", icon: "linkedin" },
    { label: "PEEP report", href: "#peep-report", icon: "external" },
  ],
};
