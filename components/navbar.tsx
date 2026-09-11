"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Link2, Menu, X, LayoutDashboard, LogOut, User, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
            <Link2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
            MinLink
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            SaaS
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#analytics" className="hover:text-foreground transition-colors">
            Analytics
          </Link>
          <Link href="/#security" className="hover:text-foreground transition-colors">
            Security
          </Link>
          <Link href="/#faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors border border-border"
              >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/25"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-muted-foreground">
            <Link
              href="/#features"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-muted hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="/#analytics"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-muted hover:text-foreground"
            >
              Analytics
            </Link>
            <Link
              href="/#security"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-muted hover:text-foreground"
            >
              Security
            </Link>
          </nav>

          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({session.user?.email})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-3 py-2 rounded-lg border border-border text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
