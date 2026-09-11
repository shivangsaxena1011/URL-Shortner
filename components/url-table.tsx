"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  BarChart3,
  Edit2,
  Trash2,
  QrCode,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  MousePointerClick,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { UrlItem } from "@/types";
import { formatDate, getBaseUrl } from "@/lib/utils";
import { QrModal } from "@/components/qr-modal";
import { EditUrlModal } from "@/components/edit-url-modal";
import { DeleteConfirmModal } from "@/components/delete-confirm-modal";

interface UrlTableProps {
  urls: UrlItem[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortToggle: () => void;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onRefresh: () => void;
}

export function UrlTable({
  urls,
  loading,
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortToggle,
  pagination,
  onPageChange,
  onRefresh,
}: UrlTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [selectedForQr, setSelectedForQr] = useState<UrlItem | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<UrlItem | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<UrlItem | null>(null);

  const baseUrl = getBaseUrl();

  const handleCopy = async (id: string, shortCode: string, customAlias: string | null) => {
    const code = customAlias || shortCode;
    const url = `${baseUrl}/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("Short URL copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const getStatusBadge = (url: UrlItem) => {
    const now = new Date();
    const isExpired = url.expiresAt && new Date(url.expiresAt) <= now;

    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          Expired
        </span>
      );
    }

    if (!url.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
          <AlertCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Active
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search, Filter, Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by code, alias, or URL..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center rounded-xl border border-border bg-card px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Toggle */}
          <button
            onClick={onSortToggle}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span>
              {sortBy === "clickCount" ? "Clicks" : "Date"} ({sortOrder.toUpperCase()})
            </span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading your links...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">No links found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {search
                ? `No URLs matched your search query "${search}". Try resetting filters.`
                : "You haven't shortened any links yet. Click \"Create Short URL\" to get started!"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Short URL</th>
                    <th className="px-5 py-3.5">Original Destination</th>
                    <th className="px-5 py-3.5 text-center">Clicks</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {urls.map((url) => {
                    const code = url.customAlias || url.shortCode;
                    const fullShortUrl = `${baseUrl}/${code}`;
                    return (
                      <tr
                        key={url.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Short URL */}
                        <td className="px-5 py-4 font-mono font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-bold">/{code}</span>
                            {url.customAlias && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[10px] text-primary font-sans font-semibold">
                                Alias
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Original URL */}
                        <td className="px-5 py-4 max-w-xs truncate text-muted-foreground">
                          <span title={url.originalUrl}>{url.originalUrl}</span>
                        </td>

                        {/* Clicks */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground">
                            <MousePointerClick className="w-3.5 h-3.5 text-primary" />
                            {url.clickCount}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">{getStatusBadge(url)}</td>

                        {/* Created */}
                        <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(url.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copy */}
                            <button
                              onClick={() => handleCopy(url.id, url.shortCode, url.customAlias)}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy Short URL"
                            >
                              {copiedId === url.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Open */}
                            <a
                              href={fullShortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Test Redirect"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* QR Code */}
                            <button
                              onClick={() => setSelectedForQr(url)}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Analytics */}
                            <Link
                              href={`/dashboard/urls/${url.id}`}
                              className="p-1.5 rounded-lg border border-border hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-colors"
                              title="View Analytics"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit */}
                            <button
                              onClick={() => setSelectedForEdit(url)}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit Link"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setSelectedForDelete(url)}
                              className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 text-xs">
                <span className="text-muted-foreground">
                  Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total links)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-foreground"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedForQr && (
        <QrModal
          isOpen={!!selectedForQr}
          onClose={() => setSelectedForQr(null)}
          shortUrl={`${baseUrl}/${selectedForQr.customAlias || selectedForQr.shortCode}`}
          shortCode={selectedForQr.customAlias || selectedForQr.shortCode}
        />
      )}

      {/* Edit URL Modal */}
      {selectedForEdit && (
        <EditUrlModal
          isOpen={!!selectedForEdit}
          onClose={() => setSelectedForEdit(null)}
          url={selectedForEdit}
          onUpdated={() => {
            onRefresh();
          }}
        />
      )}

      {/* Delete URL Modal */}
      {selectedForDelete && (
        <DeleteConfirmModal
          isOpen={!!selectedForDelete}
          onClose={() => setSelectedForDelete(null)}
          url={selectedForDelete}
          onDeleted={() => {
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
