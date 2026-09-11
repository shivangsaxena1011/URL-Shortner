"use client";

import { X } from "lucide-react";
import { UrlForm } from "@/components/url-form";

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateUrlModal({ isOpen, onClose, onCreated }: CreateUrlModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-foreground">Create Short URL</h3>
            <p className="text-xs text-muted-foreground">
              Generate a trackable short link with custom alias and expiration
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <UrlForm
          onSuccess={() => {
            onCreated();
          }}
        />
      </div>
    </div>
  );
}
