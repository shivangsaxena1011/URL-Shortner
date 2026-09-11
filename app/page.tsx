"use client";

import Link from "next/link";
import { Link2, Zap, MousePointerClick, QrCode, ArrowRight } from "lucide-react";
import { UrlForm } from "@/components/url-form";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
            Shorten Your URL
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Shorten long URLs into clean, simple, and shareable links with live click tracking.
          </p>
        </div>

        {/* Shortening Form Card */}
        <div className="max-w-xl mx-auto pt-2">
          <UrlForm />
        </div>
      </section>

      {/* 3 Simple Feature Cards */}
      <section className="py-12 border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Fast HTTP 307 Redirects</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct redirects looked up in PostgreSQL with zero delay.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Real Click Tracking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every visitor redirect increments an atomic counter in the database.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Custom Aliases & QR</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Create vanity links like <code className="font-mono text-[11px]">/portfolio</code> and download high-res QR codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple 3-Step Demo Section */}
      <section className="py-12 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-xl font-bold text-foreground">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <span className="text-primary font-black text-sm">1. Paste URL</span>
              <p className="text-xs text-muted-foreground">Enter any long HTTP or HTTPS link.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <span className="text-primary font-black text-sm">2. Shorten</span>
              <p className="text-xs text-muted-foreground">Generate a unique short code or custom alias.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <span className="text-primary font-black text-sm">3. Redirect & Track</span>
              <p className="text-xs text-muted-foreground">Open the link to redirect and watch clicks grow.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
