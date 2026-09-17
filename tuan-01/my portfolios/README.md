# Pham Minh Trung - Personal Portfolio

Personal portfolio website for **Pham Minh Trung**, a Java and full-stack developer. The page presents personal information, technical skills, education, experience, selected projects, PEEP reports, and contact links.

## Tech stack

- React 19
- Vite 8
- Ant Design
- React Router
- Lucide React
- CSS responsive layout

## Features

- Hero introduction with developer profile and CTA buttons.
- About Me with education, career direction, GPA, and TOEIC score.
- Skills grouped by Programming, Backend, Frontend, Database, and Tools & AI.
- Selected projects with technology tags.
- Experience and education timeline.
- Configurable PEEP report link.
- Contact section with email, phone, GitHub, and LinkedIn links.
- Responsive mobile navigation using Ant Design Drawer.
- Custom favicon loaded from `src/assets/logo.png`.

## Project structure

```text
src/
├── assets/
│   └── logo.png
├── components/
│   ├── layout/
│   │   ├── SiteFooter.jsx
│   │   └── SiteHeader.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Drawer.jsx
│       ├── IconButton.jsx
│       ├── Modal.jsx
│       └── Tag.jsx
├── layouts/
│   └── PortfolioLayout.jsx
├── pages/
│   └── HomePage.jsx
├── routes/
│   └── AppRoutes.jsx
├── App.jsx
├── main.jsx
└── style.css
```

## Requirements

- Node.js 18 or newer
- npm

## Installation

From the project directory:

```bash
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

Vite will display the local URL, usually `http://localhost:5173`.

## Production build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated files are placed in the `dist/` directory.

## PEEP report link

The PEEP report button can be configured with a Vite environment variable. Create a `.env` file in the project root:

```env
VITE_PEEP_REPORT_URL=https://your-report-url.com
```

When the variable is not configured, the button falls back to the PEEP Report section on the landing page.

## Deployment with Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Select Vite as the framework if Vercel does not detect it automatically.
4. Use the following build settings:

```text
Build command: npm run build
Output directory: dist
Install command: npm install
```

5. Add `VITE_PEEP_REPORT_URL` in the Vercel project environment variables when the report URL is available.
6. Deploy and verify the generated website on desktop and mobile.

## Contact

- Email: minhtrungbttv@gmail.com
- Phone: 0902 137 976
- GitHub: https://github.com/MinhTrungPham
- LinkedIn: https://www.linkedin.com/in/minh-trung-pham/
