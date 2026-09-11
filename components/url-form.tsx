"use client";

import { useState } from "react";
import { Link2, Sparkles, Copy, Check, ExternalLink, QrCode, Sliders, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { isValidHttpUrl, isValidCustomAlias } from "@/lib/validation";
import { QrModal } from "@/components/qr-modal";

interface ShortenResult {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

interface UrlFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function UrlForm({ onSuccess, compact = false }: UrlFormProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expirationOption, setExpirationOption] = useState("never");
  const [customDate, setCustomDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side URL validation
    const urlValidation = isValidHttpUrl(originalUrl);
    if (!urlValidation.valid) {
      setError(urlValidation.error || "Please enter a valid HTTP or HTTPS URL.");
      return;
    }

    // Client-side Alias validation
    if (customAlias.trim()) {
      const aliasValidation = isValidCustomAlias(customAlias.trim());
      if (!aliasValidation.valid) {
        setError(aliasValidation.error || "Invalid custom alias.");
        return;
      }
    }

    // Calculate expiration date
    let expiresAt: string | null = null;
    const now = new Date();
    if (expirationOption === "1d") {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationOption === "7d") {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationOption === "30d") {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (expirationOption === "custom") {
      if (!customDate) {
        setError("Please choose a custom expiration date.");
        return;
      }
      const exp = new Date(customDate);
      if (exp <= now) {
        setError("Expiration date must be in the future.");
        return;
      }
      expiresAt = exp.toISOString();
    }

    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          customAlias: customAlias.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to shorten URL. Please try again.");
      } else {
        setResult({
          shortCode: data.shortCode,
          shortUrl: data.shortUrl,
          originalUrl: data.originalUrl,
        });
        toast.success("Short URL generated successfully!");
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleReset = () => {
    setOriginalUrl("");
    setCustomAlias("");
    setExpirationOption("never");
    setCustomDate("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input Box */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border-2 border-primary/20 bg-card p-2 shadow-xl focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <div className="flex items-center pl-3 pr-2 text-muted-foreground">
            <Link2 className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Paste your long URL here... (e.g. https://example.com/long/path)"
            className="flex-1 bg-transparent py-2.5 px-2 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !originalUrl.trim()}
            className="mt-2 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Shortening...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Shorten URL
              </>
            )}
          </button>
        </div>

        {/* Toggle Advanced Options */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize alias & expiration</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-primary hover:underline font-medium"
            >
              + Shorten another link
            </button>
          )}
        </div>

        {/* Advanced Options Accordion */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/40 animate-in fade-in duration-200">
            {/* Custom Alias */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Custom Alias (Optional)
              </label>
              <div className="flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-sm focus-within:border-primary">
                <span className="text-muted-foreground text-xs select-none pr-1">/</span>
                <input
                  type="text"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="e.g. portfolio"
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  maxLength={30}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">3–30 characters, letters, numbers, hyphens</p>
            </div>

            {/* Expiration */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Expiration (Optional)
              </label>
              <select
                value={expirationOption}
                onChange={(e) => setExpirationOption(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="never">Never (Permanent)</option>
                <option value="1d">1 Day</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="custom">Custom Date & Time</option>
              </select>

              {expirationOption === "custom" && (
                <input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full mt-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Result Card */}
      {result && (
        <div className="mt-6 p-5 rounded-2xl border border-primary/30 bg-card shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your Shortened URL
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-lg sm:text-xl font-bold font-mono text-primary truncate">
                {result.shortUrl}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-md">
                Original: {result.originalUrl}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>

              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>

              <button
                type="button"
                onClick={() => setQrOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium transition-colors"
                title="View QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {result && (
        <QrModal
          isOpen={qrOpen}
          onClose={() => setQrOpen(false)}
          shortUrl={result.shortUrl}
          shortCode={result.shortCode}
        />
      )}
    </div>
  );
}
