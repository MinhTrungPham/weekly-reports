# Naruto Landing Page

Landing page giới thiệu thế giới Naruto theo phong cách **Dark Cinematic + Japanese + Bento Grid**.

Trang tập trung vào hành trình shinobi, nhân vật, các mối quan hệ, khoảnh khắc nổi bật và hệ thống Jutsu tương tác.

## Công nghệ

- Next.js 16 với App Router
- React 19
- TypeScript
- Bento Design System: `@buildo/bento-design-system`
- Tailwind CSS/PostCSS
- CSS custom cho theme, animation và responsive layout

## Chạy project

Cài dependency:

```bash
pnpm install
```

Chạy development server:

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

Kiểm tra lint:

```bash
pnpm lint
```

Build production:

```bash
pnpm build
```

Chạy bản production:

```bash
pnpm start
```

## Cấu trúc source

```text
app/
├── layout.tsx
├── page.tsx
├── globals.css
└── styles/
    ├── base.css
    ├── naruto-theme.css
    ├── motion.css
    ├── sections.css
    └── jutsu-orbit.css

components/
├── layout/
│   ├── MarketingLayout.tsx
│   ├── SiteHeader.tsx
│   └── SiteFooter.tsx
├── sections/
│   ├── NarutoLanding.tsx
│   └── naruto/
│       ├── HeroSection.tsx
│       ├── AboutSection.tsx
│       ├── ShinobiWorldSection.tsx
│       ├── CharactersSection.tsx
│       ├── JourneySection.tsx
│       ├── IconicMomentsSection.tsx
│       ├── JutsuSection.tsx
│       ├── QuotesSection.tsx
│       ├── RivalrySection.tsx
│       └── NarutoCtaSection.tsx
└── ui/
    ├── Container.tsx
    └── Section.tsx

data/
└── naruto.ts
```

## Nội dung landing page

Landing page gồm các khu vực:

1. Hero: thông điệp chính và hình ảnh Naruto.
2. About Naruto: câu chuyện về hành trình được công nhận.
3. Shinobi World: Chakra, Bonds và Will of Fire.
4. Characters: Naruto, Sasuke và Sakura.
5. The Journey: timeline từ Academy đến Legacy.
6. Iconic Moments: các khoảnh khắc tiêu biểu.
7. Jutsu: orbit tương tác với 6 kỹ năng.
8. Quotes: các câu nói nổi bật.
9. Naruto vs Sasuke: section về mối quan hệ đối đầu.
10. CTA: lời kêu gọi tiếp tục hành trình.

## Visual system

```text
Background: #0B0B0F
Surface:    #15151C
Orange:     #FF6B00
Yellow:     #FFA726
White:      #F5F5F5
Muted:      #9CA3AF
```

## Validation

Project đã được kiểm tra bằng:

```bash
pnpm lint
pnpm build
```
