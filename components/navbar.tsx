"use client";

import Link from "next/link";
import { Link2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Link2 className="w-4 h-4" />
          </div>
          <span className="tracking-tight font-black">URL Shortener</span>
        </Link>

        {/* Right Actions: Theme Toggle */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
