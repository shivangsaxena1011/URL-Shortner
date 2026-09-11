import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MinLink | Shorten URLs. Share Faster.",
  description:
    "Create short, memorable links, generate QR codes, and track real-time click analytics. A production-quality SaaS URL Shortener.",
  keywords: ["URL Shortener", "Link Management", "QR Code", "Analytics", "SaaS", "Next.js"],
  authors: [{ name: "MinLink Team" }],
  openGraph: {
    title: "MinLink - Shorten URLs. Share Faster.",
    description: "Create short, memorable links and track how they perform with real analytics.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinLink - Shorten URLs. Share Faster.",
    description: "Create short, memorable links and track how they perform.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="bottom-right" closeButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
