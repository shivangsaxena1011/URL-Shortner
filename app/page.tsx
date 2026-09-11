"use client";

import Link from "next/link";
import {
  Link2,
  BarChart3,
  ShieldCheck,
  QrCode,
  Sparkles,
  Zap,
  Globe2,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Smartphone,
} from "lucide-react";
import { UrlForm } from "@/components/url-form";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold shadow-sm animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen URL Management & Real-Time Telemetry</span>
          </div>

          {/* Headline & Subheadline */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
              Shorten URLs. <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-indigo-600 dark:from-primary dark:via-blue-400 dark:to-indigo-400">
                Share Faster.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create short, memorable links and track how they perform. Built with real database persistence, live click telemetry, QR codes, and custom aliases.
            </p>
          </div>

          {/* Core URL Shortening Input Card */}
          <div className="max-w-2xl mx-auto pt-4">
            <UrlForm />
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No signup required for quick links</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span>Sub-millisecond 307 redirects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Safe HTTP/HTTPS validation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Enterprise Grade Features
            </h2>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Everything you need in a URL shortener
            </h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive toolkit engineered for high availability, security, and actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Lightning-Fast Redirects</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct HTTP 307 temporary redirects powered by indexed PostgreSQL lookups ensure visitors reach the destination with zero perceivable delay.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Custom Branded Aliases</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Replace unreadable random codes with recognizable vanity slugs like <code className="px-1 py-0.5 rounded bg-muted font-mono">/github</code> or <code className="px-1 py-0.5 rounded bg-muted font-mono">/portfolio</code>.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Real-Time Click Telemetry</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track every visitor click with granular breakdowns: devices, operating systems, browsers, referring domains, and time-series line graphs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Dynamic QR Codes</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every short link generates an instant, high-definition QR code. Scan on smartphones or download high-resolution PNGs for print materials.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Auto-Expiring Links</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Set lifetime parameters: 24 hours, 7 days, 30 days, or custom timestamp. Expired links seamlessly transition to a branded expiration notice.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Security & Abuse Defense</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built-in rate limiting, strict HTTP/HTTPS protocol sanitization, CSP headers, and SSRF prevention ensure your links remain safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Simple Workflow
            </h2>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              How MinLink Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center space-y-3 p-6 rounded-2xl border border-border bg-card">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-black">
                1
              </div>
              <h4 className="text-base font-bold text-foreground">Paste Long URL</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Input any destination URL. Optionally add custom alias slug and an expiration timestamp.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-2xl border border-border bg-card">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-black">
                2
              </div>
              <h4 className="text-base font-bold text-foreground">Generate & Share</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive an ultra-short link and QR code ready to copy, tweet, print, or email to your audience.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-2xl border border-border bg-card">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-black">
                3
              </div>
              <h4 className="text-base font-bold text-foreground">Track In Real-Time</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monitor live click volumes, referrer distributions, device operating systems, and geographic regions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Section */}
      <section id="security" className="py-20 border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl border border-border bg-card shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Production Security Standard
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Engineered with Zero Compromises
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Strict input sanitization eliminates dangerous protocols (<code className="text-xs font-mono">javascript:</code>, <code className="text-xs font-mono">data:</code>, <code className="text-xs font-mono">vbscript:</code>). NextAuth ensures your links remain exclusively in your control, while rate limiting guards against brute force scraping.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> PostgreSQL ACID compliance
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> bcrypt-hashed credentials
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Token bucket rate limiter
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              Frequently Asked Questions
            </h2>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              Common Questions & Answers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                Can I use MinLink without an account?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Yes! You can shorten links directly on the homepage. Creating an account allows you to edit, delete, view analytics, and manage all your links in one dashboard.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                How does the redirect work?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When someone visits your short link (e.g. <code className="text-xs font-mono">/aB72xK</code>), our server looks up the record, validates that it is active and not expired, records the click, and returns an HTTP 307 redirect to the target URL.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                What data is collected during clicks?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We collect timestamp, referrer domain, device type, browser family, operating system, and approximate country. We never store personal identification or invade privacy.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                What happens when a link expires?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visitors are shown a clean &quot;Link Expired&quot; notification page. The redirect stops executing, preventing unwanted traffic to dead destinations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
