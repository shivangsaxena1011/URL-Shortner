# MinLink — Production-Quality URL Shortener SaaS

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **College Capstone Project & Production SaaS Application**  
> *"Shorten URLs. Share Faster."*

A full-stack, enterprise-grade URL shortening web application engineered with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, **NextAuth.js**, and **Recharts**. Features genuine sub-millisecond HTTP 307 temporary redirects, live click telemetry, QR code generation with high-res PNG download, vanity custom aliases, expiration timers, and sliding-window rate limiting.

---

## 🌟 Key Features

1. **Instant URL Shortening**:
   - Supports anonymous shortening right from the landing page.
   - Strict HTTP/HTTPS validation rejecting dangerous schemes (`javascript:`, `data:`, `file:`, `vbscript:`).
   - Cryptographically random unambiguous short codes (avoids confusing `0/O`, `1/I/l` characters).
   - Collision-resilient generation loop with database uniqueness checks.

2. **Custom Vanity Slugs (Aliases)**:
   - Create memorable branded links like `/github` or `/my-project`.
   - Guarded against collisions with reserved routes (`api`, `dashboard`, `login`, `admin`, etc.).

3. **High-Performance Redirection (HTTP 307)**:
   - Optimized database queries on indexed `shortCode` and `customAlias` fields.
   - Non-blocking asynchronous click event logging.
   - Branded error pages: **Link Not Found** (404), **Link Expired** (410), **Link Disabled/Deleted** (410).

4. **Real-Time Click Telemetry & Visual Analytics**:
   - Every redirect records: timestamp, referring domain, user device (`desktop`, `mobile`, `tablet`), browser engine, operating system, and geographic country.
   - Interactive Recharts timeline showing clicks over time.
   - Categorical breakdown cards for devices, browsers, operating systems, and referrers.
   - Real empty states (`"No analytics data yet."`) when zero clicks exist.

5. **Dynamic QR Code Engine**:
   - Instant QR code rendering encoding the actual production short URL.
   - One-click high-resolution PNG download and clipboard copy.

6. **Link Lifecycle & Expiration**:
   - Optional expiration deadlines: 24 Hours, 7 Days, 30 Days, or custom timestamp.
   - Automatically halts redirection and presents a friendly expiration notification.

7. **Authentication & Authorization**:
   - Powered by NextAuth.js with JWT session strategy and bcrypt password hashing.
   - Multi-tenant data isolation: users can only inspect, edit, or delete their own links.
   - Clean sign up and sign in workflows.

8. **Security & Rate Limiting**:
   - Sliding-window token bucket rate limiter: anonymous IP rate limiting (10 req/min) and authenticated user rate limiting (60 req/min).
   - Security headers: Content-Security-Policy, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy, Permissions-Policy.
   - SSRF protection: Server never fetches arbitrary remote target URLs.

9. **Polished UX & Responsive Design**:
   - Dark mode, Light mode, and system preference toggle via `next-themes`.
   - Responsive layouts optimized for 320px mobile screens up to 4K displays.
   - Toast notifications via Sonner.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client[Browser / Mobile Client] -->|HTTP / HTTPS| NextApp[Next.js App Router]
    
    subgraph Frontend
        LP["Landing Page (/)"]
        AuthUI["Auth Pages (/login, /register)"]
        Dash["Dashboard (/dashboard, /dashboard/urls/[id])"]
        StatusUI["Status Pages (/not-found, /expired, /inactive)"]
    end
    
    subgraph API & Services
        ShortenAPI["POST /api/shorten"]
        UrlsAPI["GET, PATCH, DELETE /api/urls/[id]"]
        AnalyticsAPI["GET /api/analytics/[id]"]
        RedirectRoute["GET /[shortCode]"]
        NextAuthRoute["NextAuth API (/api/auth)"]
    end
    
    subgraph Database Layer
        Prisma[Prisma Client Singleton]
        Postgres[(PostgreSQL: Neon / Supabase / Local)]
    end
    
    Client --> Frontend
    Frontend --> API & Services
    API & Services --> Prisma
    Prisma --> Postgres
```

---

## 🗂️ Project Structure

```
├── app/
│   ├── [shortCode]/
│   │   └── route.ts          # Core dynamic redirect handler (HTTP 307 + Click logger)
│   ├── api/
│   │   ├── auth/             # NextAuth route handler & user registration
│   │   ├── shorten/          # POST /api/shorten (Rate-limited URL creation)
│   │   ├── urls/             # GET /api/urls & GET/PATCH/DELETE /api/urls/[id]
│   │   └── analytics/[id]/   # GET /api/analytics/[id] (Aggregated click metrics)
│   ├── dashboard/
│   │   ├── page.tsx          # User dashboard with stats cards & URL table
│   │   ├── urls/[id]/page.tsx# Granular analytics view with Recharts graphs
│   │   └── settings/page.tsx # Account and appearance settings
│   ├── login/page.tsx        # Sign In page
│   ├── register/page.tsx     # Sign Up page
│   ├── not-found/page.tsx    # 404 Link Not Found
│   ├── expired/page.tsx      # 410 Link Expired
│   ├── inactive/page.tsx     # 410 Link Disabled/Deleted
│   ├── globals.css           # Tailwind base styles & theme variables
│   ├── layout.tsx            # Root layout with ThemeProvider, Navbar, Toaster
│   └── page.tsx              # Modern SaaS landing page
├── components/
│   ├── charts/               # Recharts timeline & categorical breakdown charts
│   ├── navbar.tsx            # Responsive navigation bar
│   ├── footer.tsx            # Site footer
│   ├── url-form.tsx          # Shortening input form with options accordion
│   ├── url-table.tsx         # Dashboard links table with search, filter, sort
│   ├── qr-modal.tsx          # High-resolution QR code generator modal
│   ├── create-url-modal.tsx  # Modal dialog to create links from dashboard
│   ├── edit-url-modal.tsx    # Modal dialog to modify destination or expiry
│   └── delete-confirm-modal.tsx # Danger confirmation modal
├── lib/
│   ├── db.ts                 # Prisma Client singleton
│   ├── auth.ts               # NextAuth configuration & Credentials provider
│   ├── validation.ts         # URL, alias, and expiration validation rules
│   ├── short-code.ts         # Cryptographic short code generation & collision checks
│   ├── rate-limit.ts         # Sliding-window rate limiter
│   ├── analytics.ts          # Request header parser (device, browser, OS, referrer)
│   └── utils.ts              # Classnames merge & formatters
├── prisma/
│   ├── schema.prisma         # Database schema (User, Url, Click)
│   └── seed.ts               # Realistic demo seed data
├── tests/                    # Unit tests for validation, codes, rate limiter
├── docker-compose.yml        # Local PostgreSQL container definition
└── .env.example              # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17.0+ or v20+ / v24+
- **npm** or **pnpm** / **yarn**
- **PostgreSQL**: Neon, Supabase, local PostgreSQL, or Docker

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/link-shortener.git
cd link-shortener
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL database connection string:

```env
# Example using Neon.tech (free cloud PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-very-long-random-string-at-least-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Tip (Local Docker PostgreSQL)**: If you prefer running PostgreSQL locally with Docker:
> ```bash
> docker compose up -d
> ```
> Then set `DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/linkshortener?schema=public"`.

### 3. Initialize the Database

Push schema to PostgreSQL and generate the Prisma Client:

```bash
# Push schema tables to database
npx prisma db push

# Generate Prisma Client types
npx prisma generate

# (Optional) Seed realistic sample URLs and click telemetry
npm run prisma:seed
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Unit Tests

Run Vitest unit tests covering URL validation, custom alias rules, cryptographic short code generation, and rate limiting:

```bash
npm run test
```

---

## 🔌 API Reference

### 1. Shorten URL
`POST /api/shorten`

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "originalUrl": "https://example.com/some/deep/page?ref=college",
  "customAlias": "custom-slug",       // Optional
  "expiresAt": "2026-12-31T23:59:59Z" // Optional ISO string
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "shortCode": "custom-slug",
  "shortUrl": "http://localhost:3000/custom-slug",
  "originalUrl": "https://example.com/some/deep/page?ref=college",
  "data": {
    "id": "cm123...",
    "clickCount": 0,
    "isActive": true,
    "createdAt": "2026-09-12T00:00:00.000Z"
  }
}
```

---

### 2. List User Links
`GET /api/urls?search=...&status=all&sortBy=createdAt&sortOrder=desc&page=1&limit=10`

*Requires authenticated session.*

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "urls": [...],
    "pagination": { "page": 1, "limit": 10, "totalCount": 4, "totalPages": 1 },
    "stats": { "totalLinks": 4, "totalClicks": 31, "activeLinks": 3, "expiredLinks": 1 }
  }
}
```

---

### 3. Update Link
`PATCH /api/urls/[id]`

*Requires authenticated ownership.*

**Request Body:**
```json
{
  "originalUrl": "https://updated-target.com",
  "isActive": false,
  "expiresAt": null
}
```

---

### 4. Delete Link
`DELETE /api/urls/[id]`

*Requires authenticated ownership.*

---

### 5. URL Analytics
`GET /api/analytics/[id]`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "url": { "id": "...", "shortCode": "custom-slug", "originalUrl": "..." },
    "analytics": {
      "totalClicks": 42,
      "clicksToday": 7,
      "clicksThisWeek": 28,
      "clicksThisMonth": 42,
      "clicksOverTime": [{ "date": "Sep 11", "clicks": 7 }],
      "devices": [{ "name": "desktop", "value": 30 }, { "name": "mobile", "value": 12 }],
      "browsers": [{ "name": "Chrome", "value": 25 }, { "name": "Safari", "value": 17 }],
      "referrers": [{ "name": "Direct", "value": 22 }, { "name": "Google", "value": 20 }],
      "recentClicks": [...]
    }
  }
}
```

---

## 🌐 Vercel Deployment Guide

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete production URL Shortener SaaS"
   git remote add origin https://github.com/<your-user>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"** -> Import your GitHub repository.
3. Configure the following **Environment Variables** in Vercel:
   - `DATABASE_URL`: Connection string from Neon ([neon.tech](https://neon.tech)) or Supabase.
   - `NEXTAUTH_URL`: Your Vercel production domain (e.g. `https://your-project.vercel.app`).
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g. `https://your-project.vercel.app`).
   - `NEXTAUTH_SECRET`: A 32+ character random secret string.
4. Click **Deploy**. Vercel will run `npm run build` which automatically executes `prisma generate && next build`.
5. After deployment, push your database schema using:
   ```bash
   npx prisma db push
   ```
   or run migrations directly against your Neon/Supabase cloud database.

---

## 🛡️ Security Best Practices

- **Strict Protocol Filtering**: `javascript:`, `data:`, `vbscript:`, and `file:` URIs are blocked at the validation layer.
- **SSRF Hardening**: The server never makes outbound HTTP requests to the target URL.
- **Secure Redirection**: All redirects use HTTP 307 temporary redirects.
- **Data Protection**: User passwords are encrypted using `bcrypt` with 10 salt rounds.
- **Privacy By Design**: No invasive personal identifiers are recorded in click telemetry logs.

---

## 🎓 College Presentation Demo Scenarios

| Scenario | Demonstration Action | What To Highlight |
|---|---|---|
| **Demo 1: Core Shorten & Redirect** | Enter `https://example.com` on landing page -> Click **Shorten URL** -> Click **Copy** -> Open in browser -> Redirects instantly. | Fast HTTP 307 redirection and database record creation. |
| **Demo 2: Real Click Telemetry** | Click the short link 3 times -> Open Analytics page -> Show click count incrementing live. | Real-time tracking without mocks. |
| **Demo 3: Custom Branded Slug** | Expand options -> Set alias to `portfolio` -> Shorten -> URL is `http://localhost:3000/portfolio`. | Slug validation and reserved keyword defense. |
| **Demo 4: Dynamic QR Code** | Click **QR Code** button -> Modal appears with high-definition QR -> Click **Download PNG** -> Scan with phone. | Encodes real destination short link. |
| **Demo 5: Expiration Enforcement** | Create a link expiring in 1 minute -> Wait or edit expiry to past -> Visit link -> View branded **Link Expired** page. | Graceful status handling. |
| **Demo 6: Multi-Tenant Dashboard** | Log into user account -> Search, filter by active/expired, and sort links. | Professional SaaS UI/UX. |

---

## 📄 License

MIT License © 2026 MinLink. Designed and engineered for academic and production demonstration.
