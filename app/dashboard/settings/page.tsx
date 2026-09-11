"use client";

import { useSession } from "next-auth/react";
import { User, Shield, Database, Sparkles, Key, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Settings & Account</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account profile, preferences, and system parameters
        </p>
      </div>

      {/* Account Info */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Account Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Full Name</span>
            <p className="font-semibold text-foreground mt-0.5">{session?.user?.name || "Anonymous User"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email Address</span>
            <p className="font-semibold text-foreground mt-0.5">{session?.user?.email || "Not signed in"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">User ID</span>
            <p className="font-mono text-foreground mt-0.5">
              {(session?.user as { id?: string })?.id || "N/A"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Session Status</span>
            <div className="mt-0.5 inline-flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated via JWT
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Theme & Appearance</h2>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle between Light mode, Dark mode, or inherit system operating system preference.
        </p>
      </div>

      {/* System & Architecture */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Database className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-bold text-foreground">Database & Deployment Architecture</h2>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <span className="font-medium text-foreground">Database Engine</span>
            <span className="font-mono">PostgreSQL (Neon / Supabase / Prisma)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <span className="font-medium text-foreground">Redirect Protocol</span>
            <span className="font-mono text-primary font-bold">HTTP 307 Temporary Redirect</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <span className="font-medium text-foreground">Rate Limiting</span>
            <span className="font-mono text-emerald-500">Active (Token Bucket)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <span className="font-medium text-foreground">Vercel Edge & Serverless</span>
            <span className="font-mono">Supported (Zero local file dependencies)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
