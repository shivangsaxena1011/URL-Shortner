"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link2Off, ArrowLeft, Home } from "lucide-react";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-lg">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <Link2Off className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Link Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The short link you followed does not exist or may have been typed incorrectly.
          </p>
          {code && (
            <div className="mt-2 inline-block px-3 py-1 rounded-md bg-muted text-xs font-mono text-muted-foreground">
              Code: {code}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm"
          >
            <Home className="w-4 h-4" />
            Create Your Own Link
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
