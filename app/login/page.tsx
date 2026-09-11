"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link2, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
    } finally {
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
            Sign In to MinLink
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your credentials to manage your shortened links
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Password</label>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-muted-foreground pt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
