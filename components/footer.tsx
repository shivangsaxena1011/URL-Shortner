import Link from "next/link";
import { Link2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8 text-xs text-muted-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-foreground">URL Shortener</span>
          <span>— College Project</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
}
