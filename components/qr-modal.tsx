"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check, ExternalLink, QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  shortCode: string;
}

export function QrModal({ isOpen, onClose, shortUrl, shortCode }: QrModalProps) {
  const [qrSrc, setQrSrc] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && shortUrl) {
      setGenerating(true);
      QRCode.toDataURL(
        shortUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        },
        (err, url) => {
          setGenerating(false);
          if (err) {
            console.error("QR Code Generation Error:", err);
            toast.error("Could not generate QR code");
          } else {
            setQrSrc(url);
          }
        }
      );
    }
  }, [isOpen, shortUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Short URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">QR Code</h3>
              <p className="text-xs text-muted-foreground">Scan to open short link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-inner">
          {generating ? (
            <div className="w-64 h-64 flex items-center justify-center text-sm text-slate-500">
              Generating QR Code...
            </div>
          ) : qrSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrSrc}
              alt={`QR Code for ${shortUrl}`}
              className="w-64 h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-sm text-destructive">
              Failed to load QR code
            </div>
          )}
        </div>

        {/* Link Info */}
        <div className="p-2.5 rounded-lg bg-muted text-xs font-mono break-all text-center border border-border text-foreground">
          {shortUrl}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          {qrSrc && (
            <a
              href={qrSrc}
              download={`minlink-${shortCode}.png`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </a>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-medium text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
