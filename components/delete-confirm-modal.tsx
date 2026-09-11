"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { UrlItem } from "@/types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: UrlItem | null;
  onDeleted: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  url,
  onDeleted,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !url) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/urls/${url.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error?.message || "Failed to delete link.");
      } else {
        toast.success("Link deleted successfully.");
        onDeleted();
        onClose();
      }
    } catch {
      toast.error("Failed to delete link. Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-foreground">Confirm Deletion</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-foreground">
            Are you sure you want to delete this shortened link?
          </p>
          <div className="p-3 rounded-lg bg-muted text-xs space-y-1 font-mono">
            <p className="text-primary font-bold">/{url.customAlias || url.shortCode}</p>
            <p className="text-muted-foreground truncate">{url.originalUrl}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Once deleted, this link will immediately stop redirecting and will show a &quot;Link No Longer Available&quot; error to visitors.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {loading ? "Deleting..." : "Yes, Delete Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
