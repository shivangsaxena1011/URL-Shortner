import { z } from "zod";

export const RESERVED_ALIASES = new Set([
  "api",
  "admin",
  "login",
  "register",
  "dashboard",
  "settings",
  "favicon",
  "robots",
  "sitemap",
  "public",
  "_next",
  "expired",
  "not-found",
  "inactive",
  "urls",
  "analytics",
  "shorten",
  "auth",
  "static",
  "about",
  "terms",
  "privacy",
]);

export function isValidHttpUrl(urlString: string): { valid: boolean; error?: string } {
  if (!urlString || typeof urlString !== "string") {
    return { valid: false, error: "Please enter a URL." };
  }

  const trimmed = urlString.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Please enter a URL." };
  }

  // Reject dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:")
  ) {
    return { valid: false, error: "Dangerous or unsupported URL protocol." };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Please enter a valid HTTP or HTTPS URL." };
    }

    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { valid: false, error: "Invalid hostname in URL." };
    }

    // Reject localhost in production
    if (process.env.NODE_ENV === "production") {
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname.endsWith(".local") ||
        hostname === "::1"
      ) {
        return { valid: false, error: "Localhost URLs are not allowed in production." };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Please enter a valid HTTP or HTTPS URL." };
  }
}

export function isValidCustomAlias(alias: string): { valid: boolean; error?: string } {
  if (!alias) {
    return { valid: true };
  }

  const trimmed = alias.trim();
  if (trimmed.length < 3 || trimmed.length > 30) {
    return { valid: false, error: "Custom alias must be between 3 and 30 characters." };
  }

  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(trimmed)) {
    return {
      valid: false,
      error: "Alias can only contain letters, numbers, hyphens, and underscores.",
    };
  }

  if (RESERVED_ALIASES.has(trimmed.toLowerCase())) {
    return { valid: false, error: "This alias is a reserved route and cannot be used." };
  }

  return { valid: true };
}

export function isValidExpirationDate(dateInput?: string | Date | null): {
  valid: boolean;
  error?: string;
  date?: Date | null;
} {
  if (!dateInput) {
    return { valid: true, date: null };
  }

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid expiration date format." };
  }

  if (date <= new Date()) {
    return { valid: false, error: "Expiration date must be in the future." };
  }

  return { valid: true, date };
}

export const shortenUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "Please enter a URL.")
    .refine((val) => isValidHttpUrl(val).valid, {
      message: "Please enter a valid HTTP or HTTPS URL.",
    }),
  customAlias: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || isValidCustomAlias(val).valid,
      (val) => ({
        message: val ? isValidCustomAlias(val).error || "Invalid alias." : "Invalid alias.",
      })
    ),
  expiresAt: z.string().optional().nullable(),
});

export const updateUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "Please enter a URL.")
    .refine((val) => isValidHttpUrl(val).valid, {
      message: "Please enter a valid HTTP or HTTPS URL.",
    })
    .optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().optional().nullable(),
});
