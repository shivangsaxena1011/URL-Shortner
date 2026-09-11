"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link2, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      toast.success("Account created! Signing you in...");

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md">
            <Link2 className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Your Account
          </h1>
          <p className="text-xs text-muted-foreground">
            Get full access to URL analytics, custom aliases, and link management
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-muted-foreground absolute left-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
