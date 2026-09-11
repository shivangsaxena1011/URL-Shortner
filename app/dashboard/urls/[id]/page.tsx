"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  MousePointerClick,
  Calendar,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, getBaseUrl } from "@/lib/utils";
import { QrModal } from "@/components/qr-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";
import { ClicksChart } from "@/components/charts/clicks-chart";
import { UrlItem } from "@/types";

interface AnalyticsResponse {
  url: UrlItem;
  analytics: {
    totalClicks: number;
    clicksToday: number;
    clicksOverTime: { date: string; clicks: number }[];
  };
}

export default function UrlDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to load link details.");
      } else {
        setData(json.data);
      }
    } catch {
      setError("Network error loading link details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const baseUrl = getBaseUrl();
  const shortCode = data?.url?.customAlias || data?.url?.shortCode || "";
  const fullShortUrl = `${baseUrl}/${shortCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("Short URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-7 h-7 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading link details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Link Not Found</h2>
        <p className="text-xs text-muted-foreground">{error || "Could not retrieve link information."}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { url, analytics } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Links
        </Link>
      </div>

      {/* Link Header Card */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-black text-primary">/{shortCode}</span>
              {url.customAlias && (
                <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px] font-semibold text-primary">
                  Custom Alias
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground break-all mt-1">
              Original: {url.originalUrl}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <a
              href={fullShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Link
            </a>
            <button
              onClick={() => setQrOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR Code
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete Link"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Created: {formatDate(url.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            Status: {url.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Total Clicks</span>
          <p className="text-3xl font-black font-mono text-primary">{analytics.totalClicks}</p>
          <span className="text-[11px] text-muted-foreground">Redirects counted in database</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Clicks Today</span>
          <p className="text-3xl font-black font-mono text-foreground">{analytics.clicksToday}</p>
          <span className="text-[11px] text-muted-foreground">Visits today</span>
        </div>
      </div>

      {/* Clicks Timeline Chart */}
      <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Clicks Over Time</h3>
          <p className="text-xs text-muted-foreground">Past 7 days traffic count</p>
        </div>
        <ClicksChart data={analytics.clicksOverTime} />
      </div>

      {/* Modals */}
      <QrModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={fullShortUrl}
        shortCode={shortCode}
      />

      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        url={url}
        onDeleted={() => {
          router.push("/dashboard");
        }}
      />
    </div>
  );
}
