"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { isValidHttpUrl, isValidExpirationDate } from "@/lib/validation";
import { UrlItem } from "@/types";

interface EditUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlItem | null;
  onUpdated: () => void;
}

export function EditUrlModal({ isOpen, onClose, url, onUpdated }: EditUrlModalProps) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      setOriginalUrl(url.originalUrl);
      setIsActive(url.isActive);
      if (url.expiresAt) {
        // Format for datetime-local
        const d = new Date(url.expiresAt);
        const iso = d.toISOString().slice(0, 16);
        setExpiresAt(iso);
      } else {
        setExpiresAt("");
      }
      setError(null);
    }
  }, [url]);

  if (!isOpen || !url) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = isValidHttpUrl(originalUrl);
    if (!val.valid) {
      setError(val.error || "Please enter a valid HTTP or HTTPS destination URL.");
      return;
    }

    if (expiresAt) {
      const expVal = isValidExpirationDate(expiresAt);
      if (!expVal.valid) {
        setError(expVal.error || "Expiration date must be in the future.");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/urls/${url.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          isActive,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to update URL.");
      } else {
        toast.success("URL updated successfully!");
        onUpdated();
        onClose();
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Edit Short URL</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Code: /{url.customAlias || url.shortCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Destination URL
            </label>
            <input
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Expiration Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Expiration Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave blank if the link should never expire.
            </p>
          </div>

          {/* Active / Inactive switch */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
            <div>
              <p className="text-xs font-semibold text-foreground">Active Status</p>
              <p className="text-[11px] text-muted-foreground">
                Disabled links will show an inactive message
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
