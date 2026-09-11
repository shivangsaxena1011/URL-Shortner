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
  Clock,
  Globe,
  Share2,
  AlertCircle,
  BarChart3,
  Monitor,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, getBaseUrl } from "@/lib/utils";
import { QrModal } from "@/components/qr-modal";
import { ClicksChart } from "@/components/charts/clicks-chart";
import { BreakdownChart } from "@/components/charts/breakdown-chart";
import { UrlItem } from "@/types";

interface AnalyticsResponse {
  url: UrlItem;
  analytics: {
    totalClicks: number;
    clicksToday: number;
    clicksThisWeek: number;
    clicksThisMonth: number;
    clicksOverTime: { date: string; clicks: number }[];
    devices: { name: string; value: number }[];
    browsers: { name: string; value: number }[];
    operatingSystems: { name: string; value: number }[];
    referrers: { name: string; value: number }[];
    recentClicks: {
      id: string;
      timestamp: string;
      referrer: string | null;
      device: string | null;
      browser: string | null;
      operatingSystem: string | null;
      country: string | null;
    }[];
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

  const fetchAnalytics = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to load analytics.");
      } else {
        setData(json.data);
      }
    } catch {
      setError("Network error loading analytics.");
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
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading link analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Analytics Error</h2>
        <p className="text-sm text-muted-foreground">{error || "Could not retrieve analytics."}</p>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-mono text-primary">/{shortCode}</h1>
              {url.customAlias && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-sans font-semibold text-primary border border-primary/20">
                  Custom Alias
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-xl mt-0.5">
              Target: {url.originalUrl}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={fullShortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit
          </a>
          <button
            onClick={() => setQrOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Code
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Clicks</span>
          <p className="text-2xl font-black font-mono text-foreground">{analytics.totalClicks}</p>
          <span className="text-[11px] text-muted-foreground">All time redirects</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Clicks Today</span>
          <p className="text-2xl font-black font-mono text-primary">{analytics.clicksToday}</p>
          <span className="text-[11px] text-muted-foreground">Since midnight UTC</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-medium text-muted-foreground">This Week</span>
          <p className="text-2xl font-black font-mono text-blue-500">{analytics.clicksThisWeek}</p>
          <span className="text-[11px] text-muted-foreground">Past 7 days</span>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-1">
          <span className="text-xs font-medium text-muted-foreground">This Month</span>
          <p className="text-2xl font-black font-mono text-emerald-500">{analytics.clicksThisMonth}</p>
          <span className="text-[11px] text-muted-foreground">Past 30 days</span>
        </div>
      </div>

      {/* Main Timeline Chart */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Clicks Over Time</h3>
            <p className="text-xs text-muted-foreground">Traffic volume across the past 7 days</p>
          </div>
        </div>
        <ClicksChart data={analytics.clicksOverTime} />
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BreakdownChart title="Devices" data={analytics.devices} />
        <BreakdownChart title="Browsers" data={analytics.browsers} />
        <BreakdownChart title="Operating Systems" data={analytics.operatingSystems} />
        <BreakdownChart title="Referrers" data={analytics.referrers} />
      </div>

      {/* Recent Clicks Log Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Recent Click Telemetry</h3>
            <p className="text-xs text-muted-foreground">Last 30 recorded incoming redirects</p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {analytics.recentClicks.length} logged events
          </span>
        </div>

        {analytics.recentClicks.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No visitor clicks logged yet. Open your short URL to trigger the first event!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Browser</th>
                  <th className="px-4 py-3">OS</th>
                  <th className="px-4 py-3">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {analytics.recentClicks.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(c.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-medium">{c.referrer || "Direct"}</td>
                    <td className="px-4 py-3 capitalize">{c.device || "desktop"}</td>
                    <td className="px-4 py-3">{c.browser || "Unknown"}</td>
                    <td className="px-4 py-3">{c.operatingSystem || "Unknown"}</td>
                    <td className="px-4 py-3 font-mono">{c.country || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <QrModal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        shortUrl={fullShortUrl}
        shortCode={shortCode}
      />
    </div>
  );
}
