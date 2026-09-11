import Link from "next/link";
import { Link2, ShieldCheck, Zap, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Link2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">MinLink</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern, secure, and blazingly fast URL shortening with real-time analytics for students, creators, and teams.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#analytics" className="hover:text-foreground transition-colors">
                  Real Analytics
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-foreground transition-colors">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              Technology
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> Next.js 14 App Router
              </li>
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" /> PostgreSQL & Prisma ORM
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Rate Limited & Encrypted
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
              College Project Demo
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Designed as a production-quality full-stack capstone project featuring real redirects, database persistence, and click telemetry.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MinLink. Built for production demonstration.</p>
          <p>Privacy First • No Invasive Tracking • Vercel & Neon Ready</p>
        </div>
      </div>
    </footer>
  );
}
