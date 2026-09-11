"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Link2,
  MousePointerClick,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { UrlItem, DashboardStats } from "@/types";
import { UrlTable } from "@/components/url-table";
import { CreateUrlModal } from "@/components/create-url-modal";

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    expiredLinks: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [authStatus, router]);

  const fetchUrls = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/urls?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setUrls(data.data.urls);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (err) {
      console.error("Failed to load URLs:", err);
    } finally {
      setLoading(false);
    }
  }, [authStatus, search, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleSortToggle = () => {
    if (sortBy === "createdAt") {
      setSortBy("clickCount");
      setSortOrder("desc");
    } else {
      setSortBy("createdAt");
      setSortOrder("desc");
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const userDisplayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {userDisplayName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your links, track engagement telemetry, and create new vanity shortcuts.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Create Short URL
        </button>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Links */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Links</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground font-mono">{stats.totalLinks}</p>
          <p className="text-[11px] text-muted-foreground">Shortened by your account</p>
        </div>

        {/* Total Clicks */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Clicks</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-foreground font-mono">{stats.totalClicks}</p>
          <p className="text-[11px] text-muted-foreground">Lifetime redirects tracked</p>
        </div>

        {/* Active Links */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Links</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.activeLinks}
          </p>
          <p className="text-[11px] text-muted-foreground">Currently operational</p>
        </div>

        {/* Expired Links */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Expired Links</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {stats.expiredLinks}
          </p>
          <p className="text-[11px] text-muted-foreground">Passed expiration deadline</p>
        </div>
      </div>

      {/* Main Links Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Your Shortened Links</h2>
        </div>

        <UrlTable
          urls={urls}
          loading={loading}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          status={statusFilter}
          onStatusChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          onRefresh={fetchUrls}
        />
      </div>

      {/* Create URL Modal */}
      <CreateUrlModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          setCreateModalOpen(false);
          fetchUrls();
        }}
      />
    </div>
  );
}
