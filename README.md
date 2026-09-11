# URL Shortener — College Project

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

## 💡 How It Works (1–2 Minute Presentation Pitch)

> *"First, the user enters a long URL on the homepage. The frontend sends the URL to the Next.js backend API route. The backend validates that it is a safe HTTP or HTTPS URL and generates a unique 6-character short code (or checks a custom vanity alias). The mapping is stored persistently in PostgreSQL using Prisma ORM.*
>
> *When someone visits the short link (e.g. `/aB72xK`), the backend queries the database, verifies the link is active and not expired, increments the click counter directly in the database, and returns an HTTP 307 redirect to send the user to the destination website.*
>
> *Users who register can log in to view their dashboard ('My Links') to see their links, inspect real-time click counts, copy links, generate downloadable QR codes, and delete links."*

---

## 🎯 Core Features

1. **URL Shortening**:
   - Accepts valid `http://` and `https://` URLs.
   - Rejects dangerous schemes (`javascript:`, `data:`, `file:`, `vbscript:`).
   - Generates random 6-character unambiguous short codes (`[A-Za-z0-9]`).
2. **Persistent Database Storage**:
   - PostgreSQL database via Prisma ORM (`User`, `Url`, `Click` models).
   - Short code unique constraint and collision avoidance loop.
3. **HTTP 307 Redirect**:
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
7. **User Dashboard ("My Links")**:
   - Simple view showing all shortened URLs, original destinations, and total clicks.
   - User link isolation (users only manage their own URLs).
8. **Dark Mode & Responsive UI**:
   - Clean, readable light and dark mode.
   - Fully responsive across mobile, tablet, and desktop screens.

---

## 🛠️ Technologies Used

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons, next-themes.
- **Backend**: Next.js Route Handlers (Node.js runtime).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: NextAuth.js with JWT session strategy and bcrypt password hashing.
- **QR Codes**: `qrcode` library for high-resolution PNG generation.
- **Charts**: Recharts for simple click timeline visualization.
- **Testing**: Vitest test suite.

---

## 📁 Project Structure

```
├── app/
│   ├── [shortCode]/
│   │   └── route.ts          # Core dynamic redirect handler (HTTP 307 + Click counter)
│   ├── api/
│   │   ├── auth/             # NextAuth session handler & registration
│   │   ├── shorten/          # POST /api/shorten (URL creation & alias check)
│   │   ├── urls/             # GET /api/urls & GET/PATCH/DELETE /api/urls/[id]
│   │   └── analytics/[id]/   # GET /api/analytics/[id] (Click count data)
│   ├── dashboard/
│   │   ├── page.tsx          # "My Links" dashboard with clean stats and table
│   │   ├── urls/[id]/page.tsx# Single link details & click timeline
│   │   └── settings/page.tsx # Simple account preferences
│   ├── login/page.tsx        # Sign In page
│   ├── register/page.tsx     # Sign Up page
│   ├── not-found/page.tsx    # Friendly 404 Link Not Found
│   ├── expired/page.tsx      # Friendly 410 Link Expired
│   ├── inactive/page.tsx     # Friendly 410 Link Disabled
│   ├── globals.css           # Tailwind base styles
│   ├── layout.tsx            # Clean root layout with Navbar & Footer
│   └── page.tsx              # Clean, focused homepage shortener
├── components/
│   ├── navbar.tsx            # Simple header (Home, Dashboard, Sign In/Out, Theme)
│   ├── footer.tsx            # Minimal college project footer
│   ├── url-form.tsx          # Main shortening input form & result card
│   ├── url-table.tsx         # Dashboard links list & actions
│   ├── qr-modal.tsx          # Clean QR code display and PNG download
│   ├── create-url-modal.tsx  # Modal dialog to shorten link from dashboard
│   ├── delete-confirm-modal.tsx # Simple delete confirmation modal
│   └── charts/               # Recharts timeline component
├── lib/
│   ├── db.ts                 # Prisma Client singleton
│   ├── auth.ts               # NextAuth credentials provider
│   ├── validation.ts         # Clean URL and custom alias validation
│   ├── short-code.ts         # Random code generator with collision loop
│   └── rate-limit.ts         # Sliding window rate limiter
├── prisma/
│   ├── schema.prisma         # Database schema (User, Url, Click)
│   └── seed.ts               # Sample demo seed data
└── tests/                    # 27 automated tests (validation, auth, integration)
```

---

## ⚡ Quick Start (Running Locally)

### 1. Clone the Repository
```bash
git clone https://github.com/shivangsaxena1011/URL-Shortner.git
cd URL-Shortner
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
# PostgreSQL connection string (Local or free cloud database like Neon.tech or Supabase)
DATABASE_URL="postgresql://user:password@localhost:5432/linkshortener?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="my-super-secret-random-key-at-least-32-characters"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize the Database
```bash
# Push schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Add demo sample data
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Tests

Run the test suite covering URL validation, short code uniqueness, authorization, and the complete end-to-end create-to-redirect flow:

```bash
npm run test
```

All 27 tests pass:
- `tests/validation.test.ts` (11 tests)
- `tests/short-code.test.ts` (3 tests)
- `tests/rate-limit.test.ts` (2 tests)
- `tests/authorization.test.ts` (6 tests: User B denied access to User A's links)
- `tests/integration.test.ts` (5 tests: Full create -> 307 redirect -> click counter flow)

---

## 🎬 Live College Demo Guide

| Step | Action | Expected Result |
|---|---|---|
| **1. Shorten a Link** | Paste `https://www.example.com` on the home page and click **Shorten URL**. | A short URL like `http://localhost:3000/aB72xK` appears. |
| **2. Copy & Test Redirect** | Click **Copy**, paste the short URL in a new tab, and press Enter. | Browser redirects instantly to `example.com`. |
| **3. Verify Click Count** | Go to **Dashboard** (`/dashboard`). | Click count shows **1**. |
| **4. Test Concurrency & Tracking** | Open the short link again in a new tab, then refresh the dashboard. | Click count increases to **2**. |
| **5. Custom Vanity Alias** | Expand options, set alias to `github`, and shorten. | Short link becomes `http://localhost:3000/github`. |
| **6. Duplicate Alias Defense** | Attempt to shorten another URL with alias `github`. | Returns friendly error: *"This alias is already taken."* |
| **7. QR Code** | Click **QR Code** button and scan with a smartphone camera. | Phone opens the destination URL directly. Download PNG button downloads the QR code. |

---

## ☁️ Vercel Deployment

1. Push code to your GitHub repository: `https://github.com/shivangsaxena1011/URL-Shortner`.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add environment variables in Vercel settings:
   - `DATABASE_URL`: Cloud PostgreSQL connection string (from Neon or Supabase).
   - `NEXTAUTH_URL`: Your deployed Vercel domain (e.g. `https://your-project.vercel.app`).
   - `NEXT_PUBLIC_APP_URL`: Same as above (`https://your-project.vercel.app`).
   - `NEXTAUTH_SECRET`: Any 32-character random string.
4. Click **Deploy**. Vercel will build and launch your URL Shortener.

---

## 📄 License

MIT License © 2026 Shivang Saxena. Built for academic presentation and demonstration.
