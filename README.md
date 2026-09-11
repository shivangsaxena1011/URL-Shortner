# URL Shortener

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **College Web Development & Full-Stack Project**  
> Built by **Shivang Saxena**  
> GitHub Repository: **[https://github.com/shivangsaxena1011/URL-Shortner](https://github.com/shivangsaxena1011/URL-Shortner)**

A clean, fully functional URL Shortener web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **PostgreSQL**. Designed for simplicity, clarity, and ease of demonstration during college presentations.

---

### 💡 How It Works (1–2 Minute Presentation Pitch)

> *"First, the user enters a long URL on the homepage. The frontend sends the URL to the Next.js backend API route (`POST /api/shorten`). The backend validates that it is a safe HTTP or HTTPS URL and generates a unique 6-character short code (or checks an optional custom vanity alias).*
>
> *The short URL is stored persistently with an automatic fallback storage layer so the demo works smoothly anywhere (locally, Netlify, or Vercel).*
>
> *When someone visits the short link (e.g. `/aB72xK`), the backend resolves the code, verifies the link is active and not expired, increments the click counter in the database, and returns an instant HTTP 307 temporary redirect to send the user to the destination website.*
>
> *Users can also generate high-resolution QR codes to scan with mobile devices or download as PNG."*

---

## 🎯 Core Features

1. **Instant URL Shortening**:
   - Accepts valid `http://` and `https://` URLs.
   - Rejects dangerous schemes (`javascript:`, `data:`, `file:`, `vbscript:`).
   - Generates random 6-character unambiguous short codes (`[A-Za-z0-9]`).
2. **Persistent Storage with Resilient Fallback**:
   - Supports PostgreSQL database via Prisma ORM (`Url`, `Click` models).
   - Seamless local persistent fallback for offline college presentations without requiring Docker/PostgreSQL.
3. **HTTP 307 Instant Redirect**:
   - Instant server-side redirect to the original destination.
   - Clean status pages for **Link Not Found** (404), **Link Expired** (410), and **Link Inactive** (410).
4. **Real Click Tracking**:
   - Atomic database counter increment (`clickCount: { increment: 1 }`) on every redirect.
   - No mock data or fake counters — every count corresponds to a real redirect visit.
5. **Custom Vanity Slugs (Aliases)**:
   - Create custom memorable links like `/github` or `/portfolio`.
   - Case-insensitive resolution and collision defense against reserved routes.
6. **QR Code Generation**:
   - Generates real QR codes containing the actual short link.
   - One-click PNG download for printing or sharing.
7. **Dark Mode & Responsive UI**:
   - Clean, readable light and dark mode with smooth theme toggling.
   - Fully responsive across mobile, tablet, and desktop screens.

---

## 🛠️ Technologies Used

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons, next-themes, Sonner toasts.
- **Backend**: Next.js Route Handlers (Node.js runtime).
- **Database & Storage**: PostgreSQL with Prisma ORM + Resilient local fallback.
- **QR Codes**: `qrcode` library for high-resolution PNG generation.
- **Testing**: Vitest test suite.

---

## 📁 Project Structure

```
├── app/
│   ├── [shortCode]/
│   │   └── route.ts          # Core dynamic redirect handler (HTTP 307 + Click counter)
│   ├── api/
│   │   └── shorten/          # POST /api/shorten (URL creation & alias check)
│   ├── not-found/page.tsx    # Friendly 404 Link Not Found
│   ├── expired/page.tsx      # Friendly 410 Link Expired
│   ├── inactive/page.tsx     # Friendly 410 Link Disabled
│   ├── globals.css           # Tailwind base styles
│   ├── layout.tsx            # Clean root layout with Navbar & Footer
│   └── page.tsx              # Clean, focused homepage shortener
├── components/
│   ├── navbar.tsx            # Minimal header (Brand Logo, Theme Toggle, GitHub Link)
│   ├── footer.tsx            # Minimal college project footer
│   ├── url-form.tsx          # Main shortening input form & result card
│   └── qr-modal.tsx          # Clean QR code display and PNG download
├── lib/
│   ├── db.ts                 # Resilient database layer (Prisma + Local fallback)
│   ├── validation.ts         # Clean URL and custom alias validation
│   ├── short-code.ts         # Random code generator with collision loop
│   └── rate-limit.ts         # Sliding window rate limiter
├── prisma/
│   └── schema.prisma         # Database schema (Url, Click, User)
└── tests/                    # 21 automated tests (validation, rate-limit, integration)
```

---

## ⚡ Quick Start (Running Locally)

### 1. Clone the Repository
```bash
git clone https://github.com/shivangsaxena1011/URL-Shortner.git
cd URL-Shortner
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Optional)* If you want to connect to a cloud PostgreSQL database (Neon or Supabase), add your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/linkshortener?schema=public"
```

---

## 🧪 Automated Tests

Run the test suite covering URL validation, short code uniqueness, rate limiting, and the complete end-to-end create-to-redirect flow:

```bash
npm run test
```

All 21 tests pass:
- `tests/validation.test.ts` (11 tests)
- `tests/short-code.test.ts` (3 tests)
- `tests/rate-limit.test.ts` (2 tests)
- `tests/integration.test.ts` (5 tests: Full create -> 307 redirect -> click counter flow)

---

## 🎬 Live College Demo Guide

| Step | Action | Expected Result |
|---|---|---|
| **1. Shorten a Link** | Paste `https://www.example.com` on the home page and click **Shorten URL**. | A short URL like `http://localhost:3000/aB72xK` appears immediately. |
| **2. Copy & Test Redirect** | Click **Copy**, paste the short URL in a new tab, and press Enter. | Browser redirects instantly (HTTP 307) to `example.com`. |
| **3. Custom Vanity Alias** | Click **Customize alias**, set alias to `github`, and shorten `https://github.com`. | Short link becomes `http://localhost:3000/github`. |
| **4. Duplicate Alias Defense** | Attempt to shorten another URL with alias `github`. | Returns friendly error: *"This alias is already taken."* |
| **5. QR Code** | Click **QR Code** button and scan with a smartphone camera. | Phone opens destination URL directly. Click **Download PNG** to save the QR code image. |

---

## ☁️ Deployment (Vercel or Netlify)

1. Push code to your GitHub repository: `https://github.com/shivangsaxena1011/URL-Shortner`.
2. Import the repository into [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
3. Build command: `npm run build`.
4. Deploy! The application works out-of-the-box.

---

## 📄 License

MIT License © 2026 Shivang Saxena. Built for academic presentation and demonstration.
